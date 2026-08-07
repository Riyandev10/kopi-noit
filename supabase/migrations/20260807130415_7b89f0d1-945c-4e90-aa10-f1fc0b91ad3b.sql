-- 1. Lock down internal SECURITY DEFINER helpers
REVOKE ALL ON FUNCTION public.order_log(uuid, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.order_set_status(uuid, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.order_mark_paid(text, text, text, integer, text) FROM authenticated;
REVOKE ALL ON FUNCTION public.expire_stale_orders() FROM authenticated;

-- 2. Explicitly deny client writes to order_notifications (system writes go through SECURITY DEFINER owner)
REVOKE INSERT, UPDATE, DELETE ON public.order_notifications FROM anon, authenticated;

CREATE POLICY "No client inserts on notifications"
  ON public.order_notifications AS RESTRICTIVE FOR INSERT
  TO anon, authenticated WITH CHECK (false);

CREATE POLICY "No client updates on notifications"
  ON public.order_notifications AS RESTRICTIVE FOR UPDATE
  TO anon, authenticated USING (false) WITH CHECK (false);

CREATE POLICY "No client deletes on notifications"
  ON public.order_notifications AS RESTRICTIVE FOR DELETE
  TO anon, authenticated USING (false);

-- 3. Explicit storage policies for the private payment-proofs bucket
DROP POLICY IF EXISTS "payment_proofs_customer_upload" ON storage.objects;
DROP POLICY IF EXISTS "payment_proofs_admin_read" ON storage.objects;
DROP POLICY IF EXISTS "payment_proofs_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "payment_proofs_admin_delete" ON storage.objects;

CREATE POLICY "payment_proofs_customer_upload"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'payment-proofs');

CREATE POLICY "payment_proofs_admin_read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'payment-proofs' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "payment_proofs_admin_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'payment-proofs' AND public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (bucket_id = 'payment-proofs' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "payment_proofs_admin_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'payment-proofs' AND public.has_role(auth.uid(), 'admin'::public.app_role));