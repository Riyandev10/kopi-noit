import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, LogOut, RefreshCw, FileImage, Check, X, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatIDR } from "@/lib/cart";
import { adminListOrders, adminProofUrl, adminSetOrderStatus, isAdminUser } from "@/lib/orders.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Dashboard Admin — Kopi Noit" },
      { name: "description", content: "Kelola pesanan, verifikasi bukti transfer, dan pantau status pembayaran Kopi Noit." },
      { property: "og:title", content: "Dashboard Admin — Kopi Noit" },
      { property: "og:description", content: "Verifikasi bukti transfer dan pantau status pesanan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <ShieldAlert className="size-8 mx-auto text-destructive" />
      <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
});

type Order = Awaited<ReturnType<typeof adminListOrders>>[number];

const LABEL: Record<string, string> = {
  pending_payment: "Menunggu pembayaran",
  awaiting_confirmation: "Menunggu konfirmasi",
  paid: "Sudah dibayar",
  expired: "Kedaluwarsa",
  cod_unpaid: "Bayar di tempat",
  rejected: "Bukti ditolak",
};

function AdminPage() {
  const navigate = useNavigate();
  const list = useServerFn(adminListOrders);
  const setStatus = useServerFn(adminSetOrderStatus);
  const proofUrl = useServerFn(adminProofUrl);
  const checkAdmin = useServerFn(isAdminUser);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const load = async () => {
    setError("");
    try {
      const admin = await checkAdmin({});
      setIsAdmin(admin.isAdmin);
      if (!admin.isAdmin) { setLoading(false); return; }
      setOrders(await list({}));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat pesanan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const act = async (orderId: string, status: "paid" | "rejected") => {
    setBusyId(orderId);
    try {
      await setStatus({ data: { orderId, status, note: status === "paid" ? "Diverifikasi admin" : "Bukti transfer ditolak admin" } });
      setOrders(await list({}));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memperbarui status");
    } finally {
      setBusyId("");
    }
  };

  const openProof = async (orderId: string) => {
    const res = await proofUrl({ data: { orderId } });
    if (res.url) window.open(res.url, "_blank", "noopener");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  if (loading) {
    return <div className="py-28 text-center"><Loader2 className="size-6 animate-spin mx-auto text-primary" /></div>;
  }

  if (isAdmin === false) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <ShieldAlert className="size-8 mx-auto text-secondary" />
        <h1 className="mt-3 font-display text-2xl">Akun belum punya akses admin</h1>
        <p className="mt-2 text-sm text-muted-foreground">Minta pemilik toko menambahkan akun ini sebagai admin, lalu muat ulang halaman.</p>
        <button onClick={signOut} className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm hover:border-primary/50 transition">
          <LogOut className="size-4" /> Keluar
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 lg:px-8 py-20">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="font-display text-3xl md:text-4xl">Pesanan Masuk</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:border-primary/50 transition">
            <RefreshCw className="size-4" /> Muat ulang
          </button>
          <button onClick={signOut} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:border-primary/50 transition">
            <LogOut className="size-4" /> Keluar
          </button>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="mt-8 space-y-4">
        {orders.length === 0 && <p className="text-sm text-muted-foreground">Belum ada pesanan.</p>}
        {orders.map((o) => (
          <div key={o.id} className="rounded-2xl border border-border bg-card/40 p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="font-display text-lg text-primary tracking-wider">{o.code}</p>
                <p className="text-sm">{o.customer_name} · {o.customer_phone}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{o.customer_address}</p>
              </div>
              <div className="text-right">
                <p className="font-display text-lg">{formatIDR(o.pay_total)}</p>
                <p className="text-xs text-muted-foreground">{o.method.toUpperCase()}{o.bank ? ` · ${o.bank}` : ""}</p>
                <span className={`mt-1.5 inline-block rounded-full border px-2.5 py-1 text-xs ${o.status === "paid" ? "border-primary/50 bg-primary/10 text-primary" : o.status === "expired" || o.status === "rejected" ? "border-destructive/50 bg-destructive/10 text-destructive" : "border-secondary/50 bg-secondary/10 text-secondary"}`}>
                  {LABEL[o.status] ?? o.status}
                </span>
              </div>
            </div>

            {o.va_number && <p className="mt-3 text-xs text-muted-foreground">VA {o.bank}: <span className="text-primary">{o.va_number}</span></p>}

            <div className="mt-4 flex items-center gap-2 flex-wrap">
              {o.proof_path && (
                <button onClick={() => void openProof(o.id)} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs hover:border-primary/50 transition">
                  <FileImage className="size-3.5" /> Lihat bukti transfer
                </button>
              )}
              {o.status !== "paid" && (
                <button disabled={busyId === o.id} onClick={() => void act(o.id, "paid")} className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-xs font-medium hover:opacity-90 transition disabled:opacity-60">
                  {busyId === o.id ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />} Tandai sudah dibayar
                </button>
              )}
              {o.status === "awaiting_confirmation" && (
                <button disabled={busyId === o.id} onClick={() => void act(o.id, "rejected")} className="inline-flex items-center gap-2 rounded-full border border-destructive/50 text-destructive px-4 py-2 text-xs hover:bg-destructive/10 transition disabled:opacity-60">
                  <X className="size-3.5" /> Tolak bukti
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
