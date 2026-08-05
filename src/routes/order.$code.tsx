import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CheckCircle2, Clock, Copy, Check, Landmark, Loader2, MapPin, CreditCard,
  MessageCircle, Upload, History, XCircle, Banknote, QrCode, Download,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { formatIDR } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { QRIS_MERCHANT, formatCountdown, formatDeadline, makeQrisTrxId } from "@/lib/payment";
import qrisImg from "@/assets/qris-kopinoit.jpeg";
import { getOrder, uploadPaymentProof } from "@/lib/orders.functions";

export const Route = createFileRoute("/order/$code")({
  head: () => ({
    meta: [
      { title: "Detail Pesanan — Kopi Noit" },
      { name: "description", content: "Lacak status pembayaran dan detail pesanan kopi kamu di Kopi Noit." },
      { property: "og:title", content: "Detail Pesanan — Kopi Noit" },
      { property: "og:description", content: "Lacak status pembayaran dan detail pesanan kopi kamu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OrderDetail,
  errorComponent: () => (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <p className="text-muted-foreground">Pesanan tidak dapat dimuat. Coba lagi nanti.</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <p className="text-muted-foreground">Pesanan tidak ditemukan.</p>
    </div>
  ),
});

type OrderItem = { name: string; qty: number; price: number };
type Order = Awaited<ReturnType<typeof getOrder>>["order"];
type HistoryRow = { id: string; status: string; note: string | null; created_at: string };

const STATUS_KEY: Record<string, string> = {
  pending_payment: "st.pending",
  awaiting_confirmation: "st.awaiting",
  paid: "st.paid",
  expired: "st.expired",
  cod_unpaid: "st.cod",
  rejected: "st.rejected",
};

function OrderDetail() {
  const { code } = Route.useParams();
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const fetchOrder = useServerFn(getOrder);
  const sendProof = useServerFn(uploadPaymentProof);

  const [token, setToken] = useState<string | null>(null);
  const [order, setOrder] = useState<Order>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const fromUrl = url.searchParams.get("t");
    const stored = localStorage.getItem(`orderToken:${code}`);
    const value = fromUrl || stored;
    if (fromUrl) localStorage.setItem(`orderToken:${code}`, fromUrl);
    setToken(value);
    if (!value) setLoading(false);
  }, [code]);

  const load = useCallback(async () => {
    if (!token) return;
    const res = await fetchOrder({ data: { code, token } });
    setOrder(res.order);
    setHistory(res.history as HistoryRow[]);
    setLoading(false);
  }, [code, token, fetchOrder]);

  useEffect(() => { void load(); }, [load]);

  // Polling: status berubah otomatis (mis. setelah webhook pembayaran masuk)
  useEffect(() => {
    if (!token) return;
    const id = setInterval(() => { void load(); }, 6000);
    return () => clearInterval(id);
  }, [token, load]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-xl px-5 py-28 text-center">
        <Loader2 className="size-6 animate-spin mx-auto text-primary" />
      </div>
    );
  }

  if (!token || !order) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <p className="text-muted-foreground">{t("detail.notFound")}</p>
        <Link to="/menu" className="mt-6 inline-flex rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm">{t("cart.browse")}</Link>
      </div>
    );
  }

  const items = (order.items as OrderItem[]) ?? [];
  const isTransfer = order.method === "transfer" && !!order.va_number;
  const isQris = order.method === "qris";
  const pending = order.status === "pending_payment";
  const awaiting = order.status === "awaiting_confirmation";
  const paid = order.status === "paid";
  const expired = order.status === "expired";
  const msLeft = order.expires_at ? new Date(order.expires_at).getTime() - now : 0;

  const copyText = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard tidak tersedia */ }
  };
  const copyVa = () => order.va_number && copyText(order.va_number);

  const onPickFile = async (file: File) => {
    setUploadError("");
    if (file.size > 5_000_000) { setUploadError(t("proof.tooBig")); return; }
    setUploading(true);
    try {
      const buf = new Uint8Array(await file.arrayBuffer());
      let binary = "";
      for (const byte of buf) binary += String.fromCharCode(byte);
      await sendProof({
        data: {
          code, token,
          fileName: file.name,
          contentType: file.type || "image/jpeg",
          dataBase64: btoa(binary),
        },
      });
      await load();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : t("proof.failed"));
    } finally {
      setUploading(false);
    }
  };

  const waText = encodeURIComponent(
    `Halo Kopi Noit, saya konfirmasi pesanan ${order.code} total ${formatIDR(order.pay_total)}. Nama: ${order.customer_name}`,
  );

  const proofBox = () => (
    <div className="mt-5 rounded-xl border border-border bg-background/40 p-4">
      <p className="text-sm font-medium inline-flex items-center gap-2"><Upload className="size-4 text-primary" /> {isQris ? t("proof.titleQris") : t("proof.title")}</p>
      <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{t("proof.hint")}</p>
      {order.proof_uploaded_at && (
        <p className="mt-2 text-xs text-secondary">{t("proof.uploadedAt")} {formatDeadline(order.proof_uploaded_at, lang)}</p>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,application/pdf"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) void onPickFile(f); }}
      />
      <button type="button" disabled={uploading} onClick={() => fileRef.current?.click()} className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-3 text-sm font-medium hover:opacity-90 transition disabled:opacity-60">
        {uploading ? (<><Loader2 className="size-4 animate-spin" /> {t("proof.uploading")}</>) : (<><Upload className="size-4" /> {order.proof_path ? t("proof.replace") : t("proof.upload")}</>)}
      </button>
      {uploadError && <p className="mt-2 text-xs text-destructive">{uploadError}</p>}
      {awaiting && <p className="mt-2 text-xs text-secondary">{t("proof.awaiting")}</p>}
    </div>
  );

  const statusChip = (status: string) => {
    const good = status === "paid";
    const bad = status === "expired" || status === "rejected";
    return `rounded-full border px-3 py-1 text-xs ${
      good ? "border-primary/50 bg-primary/10 text-primary"
        : bad ? "border-destructive/50 bg-destructive/10 text-destructive"
        : "border-secondary/50 bg-secondary/10 text-secondary"
    }`;
  };

  return (
    <div className="mx-auto max-w-3xl px-5 lg:px-8 py-20">
      <div className={`rounded-3xl border p-8 md:p-10 text-center ${paid ? "border-primary/40 bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent" : "border-secondary/40 bg-gradient-to-br from-secondary/10 via-primary/5 to-transparent"}`}>
        {paid ? <CheckCircle2 className="size-12 mx-auto text-primary" />
          : expired ? <XCircle className="size-12 mx-auto text-destructive" />
          : <Clock className="size-12 mx-auto text-secondary" />}
        <h1 className="mt-4 font-display text-3xl md:text-4xl text-gradient-gold">{t("detail.title")}</h1>
        <div className="mt-4 flex items-center justify-center gap-2 flex-wrap text-sm">
          <span className="text-muted-foreground">{t("success.order")}:</span>
          <span className="font-display text-primary tracking-wider">{order.code}</span>
          <span className={statusChip(order.status)}>{t(STATUS_KEY[order.status] ?? "st.pending")}</span>
        </div>
      </div>

      {isQris && (pending || awaiting || expired) && (
        <div className="mt-8 rounded-2xl border border-secondary/40 bg-secondary/5 p-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <QrCode className="size-4" /> {t("qris.title")} · {QRIS_MERCHANT.acquirer}
            </span>
            {pending && (
              <span className={`inline-flex items-center gap-1.5 ${statusChip(msLeft <= 0 ? "expired" : "pending")}`}>
                <Clock className="size-3.5" />
                {msLeft <= 0 ? t("qris.expired") : `${t("qris.timeLeft")} ${formatCountdown(msLeft)}`}
              </span>
            )}
          </div>

          {!expired && msLeft > 0 && (
            <div className="mt-4 text-center">
              <p className="text-xs text-muted-foreground">{t("qris.scan")}</p>
              <img src={qrisImg} alt="QRIS Kopi Noit" className="mx-auto mt-3 w-full max-w-[280px] rounded-xl border border-border bg-white p-2" />
              <a href={qrisImg} download={`qris-${order.code}.jpeg`} className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-primary/40 px-3.5 py-1.5 text-xs text-primary hover:bg-primary/15 transition">
                <Download className="size-3.5" /> {t("qris.download")}
              </a>
            </div>
          )}

          <div className="mt-5 space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">{t("qris.merchant")}</span><span>{QRIS_MERCHANT.name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{t("qris.nmid")}</span><span className="text-xs">{QRIS_MERCHANT.nmid}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{t("qris.trxId")}</span><span className="text-xs">{makeQrisTrxId(order.code)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{t("cart.subtotal")}</span><span>{formatIDR(order.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{t("transfer.uniqueCode")}</span><span>+ {order.unique_code}</span></div>
            <div className="border-t border-border my-2" />
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">{t("qris.amount")}</span>
              <span className="inline-flex items-center gap-2">
                <span className="font-display text-lg text-primary">{formatIDR(order.pay_total)}</span>
                <button type="button" onClick={() => void copyText(String(order.pay_total))} className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-primary/40 px-2.5 py-1 text-xs text-primary hover:bg-primary/15 transition">
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  {copied ? t("transfer.copied") : t("qris.copyAmount")}
                </button>
              </span>
            </div>
          </div>

          {order.expires_at && !expired && (
            <p className="mt-3 text-xs text-muted-foreground">{t("transfer.deadline")} {formatDeadline(order.expires_at, lang)}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{t("qris.hint")}</p>

          {pending && msLeft > 0 && (
            <p className="mt-3 inline-flex items-center gap-2 text-xs text-secondary"><Loader2 className="size-3.5 animate-spin" /> {t("pay.waiting")} {t("pay.autoCheck")}</p>
          )}

          <div className="mt-5 rounded-xl border border-border bg-background/40 p-4">
            <p className="text-sm font-medium">{t("qris.steps")}</p>
            <ol className="mt-2 space-y-1.5 text-xs text-muted-foreground leading-relaxed list-decimal pl-4">
              <li>{t("qris.step1")}</li>
              <li>{t("qris.step2")}</li>
              <li>{t("qris.step3")}</li>
              <li>{t("qris.step4")}</li>
            </ol>
          </div>

          {!paid && !expired && proofBox()}

          {expired && (
            <button type="button" onClick={() => navigate({ to: "/menu" })} className="mt-5 w-full rounded-full border border-border px-5 py-3 text-sm hover:border-primary/50 transition">
              {t("pay.newOrder")}
            </button>
          )}
        </div>
      )}

      {isTransfer && (pending || awaiting || expired) && (
        <div className="mt-8 rounded-2xl border border-secondary/40 bg-secondary/5 p-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <Landmark className="size-4" /> {t("transfer.vaTitle")} · {order.bank}
            </span>
            {pending && (
              <span className={`inline-flex items-center gap-1.5 ${statusChip(msLeft <= 0 ? "expired" : "pending")}`}>
                <Clock className="size-3.5" />
                {msLeft <= 0 ? t("transfer.expired") : `${t("transfer.timeLeft")} ${formatCountdown(msLeft)}`}
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-border bg-background/60 px-3.5 py-3">
            <span className="font-display text-xl tracking-wider text-primary break-all">{order.va_number}</span>
            <button type="button" onClick={copyVa} className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-primary/40 px-3 py-1.5 text-xs text-primary hover:bg-primary/15 transition">
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? t("transfer.copied") : t("transfer.copy")}
            </button>
          </div>

          <div className="mt-4 space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">{t("transfer.accName")}</span><span>{order.account_name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{t("cart.subtotal")}</span><span>{formatIDR(order.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{t("transfer.uniqueCode")}</span><span>+ {order.unique_code}</span></div>
            <div className="border-t border-border my-2" />
            <div className="flex justify-between items-center"><span className="text-muted-foreground">{t("transfer.payAmount")}</span><span className="font-display text-lg text-primary">{formatIDR(order.pay_total)}</span></div>
          </div>

          {order.expires_at && (
            <p className="mt-3 text-xs text-muted-foreground">{t("transfer.deadline")} {formatDeadline(order.expires_at, lang)}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{t("transfer.codeHint")}</p>

          {!paid && !expired && proofBox()}

          {expired && (
            <button type="button" onClick={() => navigate({ to: "/menu" })} className="mt-5 w-full rounded-full border border-border px-5 py-3 text-sm hover:border-primary/50 transition">
              {t("success.back")}
            </button>
          )}
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-border bg-card/40 p-6">
        <h2 className="font-display text-xl inline-flex items-center gap-2"><History className="size-4 text-primary" /> {t("detail.history")}</h2>
        <ol className="mt-4 space-y-4">
          {history.map((h) => (
            <li key={h.id} className="flex gap-3">
              <span className="mt-1.5 size-2 rounded-full bg-primary shrink-0" />
              <div>
                <p className="text-sm">{t(STATUS_KEY[h.status] ?? h.status)}</p>
                <p className="text-xs text-muted-foreground">{formatDeadline(h.created_at, lang)}{h.note ? ` · ${h.note}` : ""}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-border bg-card/40 p-6">
          <h2 className="font-display text-xl">{t("success.detail")}</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {items.map((i, idx) => (
              <li key={idx} className="flex justify-between gap-3">
                <span><span className="text-primary font-semibold">{i.qty}×</span> {i.name}</span>
                <span className="text-muted-foreground">{formatIDR(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-border my-4" />
          <div className="flex justify-between font-display text-lg"><span>{t("cart.total")}</span><span className="text-gradient-gold">{formatIDR(order.pay_total)}</span></div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-border bg-card/40 p-6">
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-widest">
              <MapPin className="size-4" /> {t("success.deliverTo")}
            </div>
            <p className="mt-2 font-medium">{order.customer_name}</p>
            <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
            <p className="mt-2 text-sm">{order.customer_address}</p>
            {order.customer_notes && <p className="mt-2 text-xs text-muted-foreground italic">"{order.customer_notes}"</p>}
          </div>
          <div className="rounded-2xl border border-border bg-card/40 p-6">
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-widest">
              <CreditCard className="size-4" /> {t("success.method")}
            </div>
            <p className="mt-2 font-medium">
              {order.method === "qris" ? t("pay.qris") : order.method === "transfer" ? t("pay.transfer") : t("pay.cod")}
              {order.bank ? ` · ${order.bank}` : ""}
            </p>
            {order.method === "cod" && (
              <div className="mt-3 flex items-center justify-between rounded-lg border border-border bg-background/60 px-3.5 py-2.5 text-sm">
                <span className="inline-flex items-center gap-2 text-muted-foreground"><Banknote className="size-4" /> {t("success.prepare")}</span>
                <span className="font-display text-primary">{formatIDR(order.pay_total)}</span>
              </div>
            )}
          </div>
          <a href={`https://wa.me/628997999306?text=${waText}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-2xl border border-primary/40 bg-primary/10 px-5 py-3 text-sm font-medium text-primary hover:bg-primary/20 transition">
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
