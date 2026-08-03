import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, MapPin, CreditCard, Banknote, MessageCircle, Clock, Copy, Check, Landmark, Loader2 } from "lucide-react";
import { formatIDR } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { formatCountdown, formatDeadline } from "@/lib/payment";

export const Route = createFileRoute("/order-success")({
  head: () => ({ meta: [{ title: "Pesanan Berhasil — Kopi Noit" }] }),
  component: Success,
});

type Order = {
  id: string;
  createdAt: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  payTotal?: number;
  method: string;
  paymentStatus?: "paid" | "unpaid" | "pending";
  transfer?: {
    bank: string;
    bankFull: string;
    va: string;
    accountName: string;
    uniqueCode: number;
    expiresAt: string;
  } | null;
  customer: { name: string; phone: string; address: string; notes: string };
};

function Success() {
  const { t, lang } = useI18n();
  const [order, setOrder] = useState<Order | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("lastOrder");
      if (raw) setOrder(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <p className="text-muted-foreground">Belum ada pesanan.</p>
        <Link to="/menu" className="mt-6 inline-flex rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm">{t("cart.browse")}</Link>
      </div>
    );
  }

  const isCod = order.method === "cod";
  const isTransfer = order.method === "transfer" && !!order.transfer;
  const pending = order.paymentStatus === "pending";
  const unpaid = order.paymentStatus === "unpaid" || isCod;
  const payTotal = order.payTotal ?? order.total;
  const msLeft = isTransfer && order.transfer ? new Date(order.transfer.expiresAt).getTime() - now : 0;
  const expired = isTransfer && pending && msLeft <= 0;

  const persist = (next: Order) => {
    setOrder(next);
    try { localStorage.setItem("lastOrder", JSON.stringify(next)); } catch {}
  };

  const copyVa = async () => {
    if (!order.transfer) return;
    try {
      await navigator.clipboard.writeText(order.transfer.va);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const confirmTransfer = () => {
    setVerifying(true);
    // Simulasi verifikasi pembayaran oleh payment gateway
    setTimeout(() => {
      setVerifying(false);
      persist({ ...order, paymentStatus: "paid" });
    }, 2200);
  };

  const statusText = pending ? t("success.pending") : unpaid ? t("success.unpaid") : t("success.paid");
  const headline = isCod ? t("success.codTitle") : pending ? t("success.transferTitle") : t("success.title");
  const subline = isCod ? t("success.codDesc") : pending ? t("success.transferDesc") : t("success.desc");

  const waText = encodeURIComponent(
    `Halo Kopi Noit, saya mau konfirmasi pesanan ${order.id} (${isCod ? "Bayar di Tempat" : pending ? "transfer bank" : "sudah dibayar"}) total ${formatIDR(payTotal)}. Nama: ${order.customer.name}, alamat: ${order.customer.address}`,
  );
  const waHref = `https://wa.me/628997999306?text=${waText}`;

  const methodLabel: Record<string, string> = {
    qris: t("pay.qris"), transfer: t("pay.transfer"), cod: t("pay.cod"),
  };

  return (
    <div className="mx-auto max-w-3xl px-5 lg:px-8 py-20">
      <div className={`rounded-3xl border p-8 md:p-12 text-center ${pending ? "border-secondary/40 bg-gradient-to-br from-secondary/10 via-primary/5 to-transparent" : "border-primary/40 bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent"}`}>
        {pending ? <Clock className="size-14 mx-auto text-secondary" /> : <CheckCircle2 className="size-14 mx-auto text-primary" />}
        <h1 className="mt-4 font-display text-4xl md:text-5xl text-gradient-gold">{headline}</h1>
        <p className="mt-3 text-muted-foreground">{subline}</p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-sm">
          <span className="text-muted-foreground">{t("success.order")}:</span>
          <span className="font-display text-primary tracking-wider">{order.id}</span>
        </div>
      </div>

      {isTransfer && pending && order.transfer && (
        <div className="mt-8 rounded-2xl border border-secondary/40 bg-secondary/5 p-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <Landmark className="size-4" /> {t("transfer.vaTitle")} · {order.transfer.bank}
            </div>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${expired ? "border-destructive/50 bg-destructive/10 text-destructive" : "border-secondary/50 bg-secondary/10 text-secondary"}`}>
              <Clock className="size-3.5" />
              {expired ? t("transfer.expired") : `${t("transfer.timeLeft")} ${formatCountdown(msLeft)}`}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-border bg-background/60 px-3.5 py-3">
            <span className="font-display text-xl tracking-wider text-primary break-all">{order.transfer.va}</span>
            <button type="button" onClick={copyVa} className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-primary/40 px-3 py-1.5 text-xs text-primary hover:bg-primary/15 transition">
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? t("transfer.copied") : t("transfer.copy")}
            </button>
          </div>

          <div className="mt-4 space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">{t("transfer.accName")}</span><span>{order.transfer.accountName}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{t("cart.subtotal")}</span><span>{formatIDR(order.total)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{t("transfer.uniqueCode")}</span><span>+ {order.transfer.uniqueCode}</span></div>
            <div className="border-t border-border my-2" />
            <div className="flex justify-between items-center"><span className="text-muted-foreground">{t("transfer.payAmount")}</span><span className="font-display text-lg text-primary">{formatIDR(payTotal)}</span></div>
          </div>

          <p className="mt-3 text-xs text-muted-foreground leading-relaxed">{t("transfer.codeHint")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t("transfer.deadline")} {formatDeadline(order.transfer.expiresAt, lang)}</p>

          <ol className="mt-4 space-y-1.5 text-xs text-muted-foreground leading-relaxed list-decimal pl-4">
            <li>{t("transfer.step1")}</li>
            <li>{t("transfer.step2")}</li>
            <li>{t("transfer.step3")}</li>
          </ol>

          {!expired && (
            <button type="button" onClick={confirmTransfer} disabled={verifying} className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-3 text-sm font-medium hover:opacity-90 transition disabled:opacity-60">
              {verifying ? (<><Loader2 className="size-4 animate-spin" /> {t("transfer.verifying")}</>) : t("transfer.confirm")}
            </button>
          )}
          {expired && (
            <Link to="/menu" className="mt-5 w-full inline-flex items-center justify-center rounded-full border border-border px-5 py-3 text-sm hover:border-primary/50 transition">
              {t("success.back")}
            </Link>
          )}
        </div>
      )}

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
          <div className="flex justify-between font-display text-lg"><span>{t("cart.total")}</span><span className="text-gradient-gold">{formatIDR(payTotal)}</span></div>
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
            <p className="mt-2 font-medium">
              {methodLabel[order.method] ?? order.method}
              {isTransfer && order.transfer ? ` · ${order.transfer.bank}` : ""}
            </p>
            <div className="mt-3 flex items-center justify-between text-sm gap-3">
              <span className="text-muted-foreground">{t("success.status")}</span>
              <span className={`rounded-full border px-2.5 py-1 text-xs text-right ${pending || unpaid ? "border-secondary/50 bg-secondary/10 text-secondary" : "border-primary/50 bg-primary/10 text-primary"}`}>
                {statusText}
              </span>
            </div>
            {isCod && (
              <div className="mt-3 flex items-center justify-between rounded-lg border border-border bg-background/60 px-3.5 py-2.5 text-sm">
                <span className="inline-flex items-center gap-2 text-muted-foreground"><Banknote className="size-4" /> {t("success.prepare")}</span>
                <span className="font-display text-primary">{formatIDR(order.total)}</span>
              </div>
            )}
          </div>
          <a href={waHref} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-2xl border border-primary/40 bg-primary/10 px-5 py-3 text-sm font-medium text-primary hover:bg-primary/20 transition">
            <MessageCircle className="size-4" /> {t("success.waConfirm")}
          </a>
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
