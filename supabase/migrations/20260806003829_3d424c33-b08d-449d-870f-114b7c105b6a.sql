-- internal secrets (no policies -> unreachable from client)
CREATE TABLE IF NOT EXISTS public.app_secrets (
  key text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.app_secrets TO service_role;
ALTER TABLE public.app_secrets ENABLE ROW LEVEL SECURITY;

-- allow public order creation with safe statuses only
GRANT INSERT ON public.orders TO anon, authenticated;
GRANT SELECT, UPDATE ON public.orders TO authenticated;

DROP POLICY IF EXISTS "Anyone can create pending orders" ON public.orders;
CREATE POLICY "Anyone can create pending orders" ON public.orders
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    status IN ('pending_payment', 'cod_unpaid')
    AND paid_at IS NULL
    AND proof_path IS NULL
  );

CREATE OR REPLACE FUNCTION public.status_label(_status text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE _status
    WHEN 'pending_payment' THEN 'Menunggu pembayaran'
    WHEN 'awaiting_confirmation' THEN 'Menunggu konfirmasi admin'
    WHEN 'paid' THEN 'Sudah dibayar'
    WHEN 'expired' THEN 'Kedaluwarsa'
    WHEN 'cod_unpaid' THEN 'Belum dibayar (bayar di tempat)'
    WHEN 'rejected' THEN 'Bukti transfer ditolak'
    ELSE _status END
$$;

-- internal: history + notifications
CREATE OR REPLACE FUNCTION public.order_log(_order_id uuid, _status text, _note text, _event text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE o public.orders; lbl text; subj text; body text;
BEGIN
  SELECT * INTO o FROM public.orders WHERE id = _order_id;
  IF o.id IS NULL THEN RAISE EXCEPTION 'Pesanan tidak ditemukan'; END IF;

  INSERT INTO public.order_status_history (order_id, status, note) VALUES (_order_id, _status, _note);

  lbl := public.status_label(_status);
  subj := 'Pesanan ' || o.code || ' — ' || lbl;
  body := 'Halo ' || o.customer_name || E',\n\nStatus pesanan ' || o.code || ' kini: ' || lbl
    || E'.\nTotal: Rp ' || to_char(o.pay_total, 'FM999G999G999')
    || COALESCE(E'\nVirtual Account ' || o.bank || ': ' || o.va_number, '')
    || E'\n\nTerima kasih sudah ngopi bareng Kopi Noit.';

  INSERT INTO public.order_notifications (order_id, event, channel, recipient, subject, body, status)
  VALUES (_order_id, COALESCE(_event, _status), 'whatsapp', o.customer_phone, subj, body, 'ready');

  IF o.customer_email IS NOT NULL AND o.customer_email <> '' THEN
    INSERT INTO public.order_notifications (order_id, event, channel, recipient, subject, body, status)
    VALUES (_order_id, COALESCE(_event, _status), 'email', o.customer_email, subj, body, 'queued');
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.order_log(uuid, text, text, text) FROM PUBLIC, anon, authenticated;

-- internal: set status
CREATE OR REPLACE FUNCTION public.order_set_status(_order_id uuid, _status text, _note text, _event text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.orders
     SET status = _status,
         paid_at = CASE WHEN _status = 'paid' THEN now() ELSE paid_at END
   WHERE id = _order_id;
  PERFORM public.order_log(_order_id, _status, _note, _event);
END;
$$;
REVOKE ALL ON FUNCTION public.order_set_status(uuid, text, text, text) FROM PUBLIC, anon, authenticated;

-- called right after the client inserts the order row
CREATE OR REPLACE FUNCTION public.order_created(_code text, _token text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE o public.orders;
BEGIN
  SELECT * INTO o FROM public.orders WHERE code = _code AND access_token = _token;
  IF o.id IS NULL THEN RAISE EXCEPTION 'Pesanan tidak ditemukan'; END IF;
  IF EXISTS (SELECT 1 FROM public.order_status_history WHERE order_id = o.id) THEN RETURN; END IF;
  PERFORM public.order_log(o.id, o.status, 'Pesanan dibuat', 'created');
END;
$$;
GRANT EXECUTE ON FUNCTION public.order_created(text, text) TO anon, authenticated;

-- token-scoped read (also expires overdue orders)
CREATE OR REPLACE FUNCTION public.order_by_token(_code text, _token text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE o public.orders; hist jsonb;
BEGIN
  SELECT * INTO o FROM public.orders WHERE code = _code AND access_token = _token;
  IF o.id IS NULL THEN RETURN jsonb_build_object('order', NULL, 'history', '[]'::jsonb); END IF;

  IF o.status = 'pending_payment' AND o.expires_at IS NOT NULL AND o.expires_at < now() THEN
    PERFORM public.order_set_status(o.id, 'expired', 'Batas waktu pembayaran habis', 'expired');
    SELECT * INTO o FROM public.orders WHERE id = o.id;
  END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object('id', h.id, 'status', h.status, 'note', h.note, 'created_at', h.created_at)
         ORDER BY h.created_at), '[]'::jsonb)
    INTO hist FROM public.order_status_history h WHERE h.order_id = o.id;

  RETURN jsonb_build_object(
    'order', to_jsonb(o) - 'access_token',
    'history', hist
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.order_by_token(text, text) TO anon, authenticated;

-- proof upload
CREATE OR REPLACE FUNCTION public.order_attach_proof(_code text, _token text, _path text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE o public.orders;
BEGIN
  SELECT * INTO o FROM public.orders WHERE code = _code AND access_token = _token;
  IF o.id IS NULL THEN RAISE EXCEPTION 'Pesanan tidak ditemukan'; END IF;
  IF o.status = 'paid' THEN RAISE EXCEPTION 'Pesanan ini sudah dibayar'; END IF;

  UPDATE public.orders SET proof_path = _path, proof_uploaded_at = now() WHERE id = o.id;
  PERFORM public.order_set_status(o.id, 'awaiting_confirmation', 'Bukti transfer diunggah pelanggan', 'proof_uploaded');
  RETURN jsonb_build_object('ok', true);
END;
$$;
GRANT EXECUTE ON FUNCTION public.order_attach_proof(text, text, text) TO anon, authenticated;

-- admin status change
CREATE OR REPLACE FUNCTION public.admin_set_order_status(_order_id uuid, _status text, _note text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Forbidden: butuh akses admin'; END IF;
  PERFORM public.order_set_status(_order_id, _status, COALESCE(_note, 'Diperbarui admin'), 'admin_' || _status);
  RETURN jsonb_build_object('ok', true);
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_set_order_status(uuid, text, text) TO authenticated;

-- cron: expire overdue orders
CREATE OR REPLACE FUNCTION public.expire_stale_orders()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record; n integer := 0;
BEGIN
  FOR r IN SELECT id FROM public.orders
            WHERE status = 'pending_payment' AND expires_at IS NOT NULL AND expires_at < now()
            LIMIT 200 LOOP
    PERFORM public.order_set_status(r.id, 'expired', 'Batas waktu pembayaran habis', 'expired');
    n := n + 1;
  END LOOP;
  RETURN n;
END;
$$;
GRANT EXECUTE ON FUNCTION public.expire_stale_orders() TO anon, authenticated;

-- webhook verification (requires shared secret stored in app_secrets)
CREATE OR REPLACE FUNCTION public.order_mark_paid(_secret text, _va text, _code text, _amount integer, _reference text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE o public.orders; expected text;
BEGIN
  SELECT value INTO expected FROM public.app_secrets WHERE key = 'payment_webhook_secret';
  IF expected IS NULL THEN RAISE EXCEPTION 'Webhook belum dikonfigurasi'; END IF;
  IF _secret IS NULL OR _secret <> expected THEN RAISE EXCEPTION 'Tanda tangan tidak valid'; END IF;

  SELECT * INTO o FROM public.orders
   WHERE ((_va IS NOT NULL AND va_number = _va) OR (_va IS NULL AND code = _code))
     AND status IN ('pending_payment', 'awaiting_confirmation')
   ORDER BY created_at DESC LIMIT 1;

  IF o.id IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'Pesanan tidak ditemukan'); END IF;
  IF o.expires_at IS NOT NULL AND o.expires_at < now() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Batas waktu pembayaran sudah lewat');
  END IF;
  IF o.pay_total <> _amount THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Jumlah pembayaran tidak sesuai');
  END IF;

  PERFORM public.order_set_status(
    o.id, 'paid',
    'Pembayaran terverifikasi otomatis' || COALESCE(' · ref ' || _reference, ''),
    'payment_webhook');
  RETURN jsonb_build_object('ok', true);
END;
$$;
GRANT EXECUTE ON FUNCTION public.order_mark_paid(text, text, text, integer, text) TO anon, authenticated;

-- storage: customers upload proofs, only admins can read them
DROP POLICY IF EXISTS "Public can upload payment proofs" ON storage.objects;
CREATE POLICY "Public can upload payment proofs" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'payment-proofs');

DROP POLICY IF EXISTS "Admins can read payment proofs" ON storage.objects;
CREATE POLICY "Admins can read payment proofs" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'payment-proofs' AND public.has_role(auth.uid(), 'admin'));