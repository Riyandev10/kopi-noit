import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, MapPin, CreditCard } from "lucide-react";
import { formatIDR } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/order-success")({
  head: () => ({ meta: [{ title: "Pesanan Berhasil — Kopi Noit" }] }),
  component: Success,
});

type Order = {
  id: string;
  createdAt: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  method: string;
  customer: { name: string; phone: string; address: string; notes: string };
};

function Success() {
  const { t } = useI18n();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("lastOrder");
      if (raw) setOrder(JSON.parse(raw));
    } catch {}
  }, []);

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <p className="text-muted-foreground">Belum ada pesanan.</p>
        <Link to="/menu" className="mt-6 inline-flex rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm">{t("cart.browse")}</Link>
      </div>
    );
  }

  const methodLabel: Record<string, string> = {
    qris: t("pay.qris"), transfer: t("pay.transfer"), cod: t("pay.cod"),
  };

  return (
    <div className="mx-auto max-w-3xl px-5 lg:px-8 py-20">
      <div className="rounded-3xl border border-primary/40 bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent p-8 md:p-12 text-center">
        <CheckCircle2 className="size-14 mx-auto text-primary" />
        <h1 className="mt-4 font-display text-4xl md:text-5xl text-gradient-gold">{t("success.title")}</h1>
        <p className="mt-3 text-muted-foreground">{t("success.desc")}</p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-sm">
          <span className="text-muted-foreground">{t("success.order")}:</span>
          <span className="font-display text-primary tracking-wider">{order.id}</span>
        </div>
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-border bg-card/40 p-6">
          <h2 className="font-display text-xl">{t("success.detail")}</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {order.items.map((i, idx) => (
              <li key={idx} className="flex justify-between gap-3">
                <span><span className="text-primary font-semibold">{i.qty}×</span> {i.name}</span>
                <span className="text-muted-foreground">{formatIDR(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-border my-4" />
          <div className="flex justify-between font-display text-lg"><span>{t("cart.total")}</span><span className="text-gradient-gold">{formatIDR(order.total)}</span></div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-border bg-card/40 p-6">
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-widest">
              <MapPin className="size-4" /> {t("success.deliverTo")}
            </div>
            <p className="mt-2 font-medium">{order.customer.name}</p>
            <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
            <p className="mt-2 text-sm">{order.customer.address}</p>
            {order.customer.notes && <p className="mt-2 text-xs text-muted-foreground italic">"{order.customer.notes}"</p>}
          </div>
          <div className="rounded-2xl border border-border bg-card/40 p-6">
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-widest">
              <CreditCard className="size-4" /> {t("success.method")}
            </div>
            <p className="mt-2 font-medium">{methodLabel[order.method] ?? order.method}</p>
          </div>
        </div>
      </div>

      <div className="mt-10 text-center">
        <Link to="/menu" className="inline-flex rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:opacity-90 transition">
          {t("success.back")}
        </Link>
      </div>
    </div>
  );
}
