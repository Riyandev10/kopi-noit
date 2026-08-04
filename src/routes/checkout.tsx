import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CreditCard, QrCode, Banknote, ArrowRight, Clock, Landmark } from "lucide-react";
import { useCart, formatIDR } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { ACCOUNT_NAME, BANKS, TRANSFER_WINDOW_MS, formatDeadline, type BankId } from "@/lib/payment";
import { createOrder } from "@/lib/orders.functions";
import qrisImg from "@/assets/qris-kopinoit.jpeg";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Kopi Noit" },
      { name: "description", content: "Selesaikan pesanan kopi Kopi Noit: QRIS, transfer bank virtual account, atau bayar di tempat." },
      { property: "og:title", content: "Checkout — Kopi Noit" },
      { property: "og:description", content: "Bayar pesanan kopi kamu dengan QRIS, transfer bank, atau bayar di tempat." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Checkout,
});

type PayMethod = "qris" | "transfer" | "cod";

function Checkout() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { items, total, clear } = useCart();
  const submitOrder = useServerFn(createOrder);
  const [method, setMethod] = useState<PayMethod>("qris");
  const [bankId, setBankId] = useState<BankId>("bca");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", notes: "" });

  const bank = BANKS.find((b) => b.id === bankId)!;
  const isTransfer = method === "transfer";
  const payTotal = total;

  if (items.length === 0 && !processing) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <p className="text-muted-foreground">{t("cart.empty")}</p>
        <Link to="/menu" className="mt-6 inline-flex rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm">{t("cart.browse")}</Link>
      </div>
    );
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) return;
    setProcessing(true);
    setError("");
    try {
      const res = await submitOrder({
        data: {
          items: items.map((i) => ({ id: i.id, name: i.name, qty: i.qty, price: i.price })),
          method,
          bankId: isTransfer ? bankId : undefined,
          customer: {
            name: form.name.trim(),
            phone: form.phone.trim(),
            email: form.email.trim(),
            address: form.address.trim(),
            notes: form.notes.trim(),
          },
        },
      });
      clear();
      navigate({ to: "/order/$code", params: { code: res.code }, search: { t: res.token } });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("checkout.failed"));
      setProcessing(false);
    }
  };

  const methods: { id: PayMethod; label: string; Icon: typeof CreditCard; desc: string }[] = [
    { id: "qris", label: t("pay.qris"), Icon: QrCode, desc: "GoPay, OVO, Dana, ShopeePay" },
    { id: "transfer", label: t("pay.transfer"), Icon: CreditCard, desc: "BCA, Mandiri, BRI, BNI" },
    { id: "cod", label: t("pay.cod"), Icon: Banknote, desc: "Cash saat pesanan tiba" },
  ];


  return (
    <div className="mx-auto max-w-5xl px-5 lg:px-8 py-20">
      <h1 className="font-display text-4xl md:text-5xl">{t("checkout.title")}</h1>

      <form onSubmit={onSubmit} className="mt-10 grid lg:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card/40 p-6 space-y-4">
            <Field label={t("checkout.name")} value={form.name} onChange={(v) => setForm({ ...form, name: v })} required maxLength={100} />
            <Field label={t("checkout.phone")} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required maxLength={20} type="tel" />
            <Field label={t("checkout.address")} value={form.address} onChange={(v) => setForm({ ...form, address: v })} required maxLength={300} textarea />
            <Field label={t("checkout.notes")} value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} maxLength={300} textarea />
          </div>

          <div className="rounded-2xl border border-border bg-card/40 p-6">
            <h2 className="font-display text-xl">{t("checkout.pay")}</h2>
            <div className="mt-4 grid sm:grid-cols-3 gap-3">
              {methods.map((m) => {
                const active = method === m.id;
                return (
                  <button type="button" key={m.id} onClick={() => setMethod(m.id)} className={`text-left rounded-xl border p-4 transition ${active ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}>
                    <m.Icon className={`size-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                    <p className="mt-2 text-sm font-medium">{m.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
                  </button>
                );
              })}
            </div>

            {method === "cod" && (
              <div className="mt-5 rounded-xl border border-primary/30 bg-primary/5 p-4">
                <p className="text-sm font-medium">{t("checkout.codTitle")}</p>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{t("checkout.codHint")}</p>
                <div className="mt-3 flex items-center justify-between rounded-lg border border-border bg-background/60 px-3.5 py-2.5 text-sm">
                  <span className="text-muted-foreground">{t("success.prepare")}</span>
                  <span className="font-display text-primary">{formatIDR(total)}</span>
                </div>
              </div>
            )}

            {method === "qris" && (
              <div className="mt-5 rounded-xl border border-primary/30 bg-primary/5 p-4 text-center">
                <p className="text-sm font-medium">{t("checkout.qrisTitle")}</p>
                <img src={qrisImg} alt="QRIS Kopi Noit" className="mx-auto mt-3 w-full max-w-[280px] rounded-lg border border-border bg-white" />
                <p className="mt-3 text-xs text-muted-foreground">{t("checkout.qrisHint")}</p>
              </div>
            )}

            {isTransfer && (
              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">{t("transfer.chooseBank")}</p>
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {BANKS.map((b) => {
                      const active = bankId === b.id;
                      return (
                        <button type="button" key={b.id} onClick={() => setBankId(b.id)} className={`rounded-xl border p-3 text-left transition ${active ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}>
                          <Landmark className={`size-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                          <p className="mt-2 text-sm font-medium">{b.name}</p>
                          <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{b.short}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">{t("transfer.vaTitle")} · {bank.name}</p>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t("transfer.vaAfterOrder")}</p>
                  <div className="mt-3 space-y-1.5 text-sm">
                    <Row label={t("transfer.accName")} value={ACCOUNT_NAME} />
                    <Row label={t("cart.subtotal")} value={formatIDR(total)} />
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground leading-relaxed">{t("transfer.codeHint")}</p>
                  <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-secondary">
                    <Clock className="size-3.5" /> {t("transfer.deadline")} {formatDeadline(new Date(Date.now() + TRANSFER_WINDOW_MS).toISOString(), lang)}
                  </p>
                </div>


                <div className="rounded-xl border border-border bg-background/40 p-4">
                  <p className="text-sm font-medium">{t("transfer.steps")}</p>
                  <ol className="mt-2 space-y-1.5 text-xs text-muted-foreground leading-relaxed list-decimal pl-4">
                    <li>{t("transfer.step1")}</li>
                    <li>{t("transfer.step2")}</li>
                    <li>{t("transfer.step3")}</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="rounded-2xl border border-border bg-card/40 p-6 h-fit lg:sticky lg:top-20">
          <h2 className="font-display text-xl">{t("checkout.summary")}</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {items.map((i) => (
              <li key={i.id} className="flex justify-between gap-3">
                <span className="text-muted-foreground">{i.name} <span className="text-primary">×{i.qty}</span></span>
                <span>{formatIDR(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-border my-4" />
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t("cart.subtotal")}</span><span>{formatIDR(total)}</span></div>
          <div className="flex justify-between text-sm mt-1"><span className="text-muted-foreground">{t("cart.delivery")}</span><span className="text-primary">{t("cart.free")}</span></div>
          {isTransfer && (
            <div className="flex justify-between text-sm mt-1"><span className="text-muted-foreground">{t("transfer.uniqueCode")}</span><span className="text-muted-foreground">{t("transfer.afterOrder")}</span></div>
          )}

          <div className="flex justify-between font-display text-lg mt-3"><span>{t("cart.total")}</span><span className="text-gradient-gold">{formatIDR(payTotal)}</span></div>
          <button type="submit" disabled={processing} className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-3 text-sm font-medium hover:opacity-90 transition disabled:opacity-60">
            {processing
              ? (method === "qris" ? t("checkout.processingPay") : t("checkout.processingOrder"))
              : (<>{method === "qris" ? t("checkout.payNow") : isTransfer ? t("transfer.createOrder") : t("checkout.placeOrder")} <ArrowRight className="size-4" /></>)}
          </button>
        </aside>
      </form>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Field({ label, value, onChange, required, maxLength, type = "text", textarea }: {
  label: string; value: string; onChange: (v: string) => void; required?: boolean; maxLength?: number; type?: string; textarea?: boolean;
}) {
  const cls = "mt-1.5 w-full rounded-lg border border-border bg-background/60 px-3.5 py-2.5 text-sm outline-none focus:border-primary";
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}{required && " *"}</span>
      {textarea ? (
        <textarea required={required} maxLength={maxLength} value={value} onChange={(e) => onChange(e.target.value)} rows={3} className={cls} />
      ) : (
        <input type={type} required={required} maxLength={maxLength} value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
      )}
    </label>
  );
}
