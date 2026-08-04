import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Masuk Admin — Kopi Noit" },
      { name: "description", content: "Halaman masuk admin Kopi Noit untuk mengelola pesanan dan verifikasi pembayaran." },
      { property: "og:title", content: "Masuk Admin — Kopi Noit" },
      { property: "og:description", content: "Kelola pesanan dan verifikasi pembayaran Kopi Noit." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/admin" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/auth" },
        });
        if (error) throw error;
        setMessage("Akun dibuat. Cek email untuk konfirmasi, lalu masuk.");
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Gagal masuk");
    } finally {
      setBusy(false);
    }
  };

  const cls = "mt-1.5 w-full rounded-lg border border-border bg-background/60 px-3.5 py-2.5 text-sm outline-none focus:border-primary";

  return (
    <div className="mx-auto max-w-md px-5 py-24">
      <div className="rounded-2xl border border-border bg-card/40 p-7">
        <Lock className="size-6 text-primary" />
        <h1 className="mt-3 font-display text-2xl">Masuk Admin</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Khusus tim Kopi Noit untuk memverifikasi pembayaran.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Email</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={cls} />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Password</span>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={cls} />
          </label>
          <button type="submit" disabled={busy} className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-3 text-sm font-medium hover:opacity-90 transition disabled:opacity-60">
            {busy && <Loader2 className="size-4 animate-spin" />}
            {mode === "signin" ? "Masuk" : "Daftar"}
          </button>
        </form>

        {message && <p className="mt-4 text-xs text-secondary leading-relaxed">{message}</p>}

        <button type="button" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setMessage(""); }} className="mt-5 text-xs text-muted-foreground hover:text-primary transition">
          {mode === "signin" ? "Belum punya akun admin? Daftar" : "Sudah punya akun? Masuk"}
        </button>
      </div>
    </div>
  );
}
