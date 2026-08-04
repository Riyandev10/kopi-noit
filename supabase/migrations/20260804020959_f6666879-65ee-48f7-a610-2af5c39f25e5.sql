CREATE TABLE public.order_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  event text NOT NULL,
  channel text NOT NULL,
  recipient text,
  subject text,
  body text,
  status text NOT NULL DEFAULT 'queued',
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX order_notifications_order_id_idx ON public.order_notifications(order_id);

GRANT SELECT ON public.order_notifications TO authenticated;
GRANT ALL ON public.order_notifications TO service_role;
ALTER TABLE public.order_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view notifications" ON public.order_notifications
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));