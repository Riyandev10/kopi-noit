import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Atur Ulang Password — Kopi Noit" },
      { name: "description", content: "Buat password baru untuk akun admin Kopi Noit." },
      { property: "og:title", content: "Atur Ulang Password — Kopi Noit" },
      { property: "og:description", content: "Buat password baru untuk akun admin Kopi Noit." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setMessage("Gagal menyimpan password. Buka tautan dari email lagi lalu coba ulang.");
      return;
    }
    setMessage("Password berhasil diubah.");
    navigate({ to: "/admin" });
  };

  const cls = "mt-1.5 w-full rounded-lg border border-border bg-background/60 px-3.5 py-2.5 text-sm outline-none focus:border-primary";

  return (
    <div className="mx-auto max-w-md px-5 py-24">
      <div className="rounded-2xl border border-border bg-card/40 p-7">
        <KeyRound className="size-6 text-primary" />
        <h1 className="mt-3 font-display text-2xl">Password Baru</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Masukkan password baru untuk akun admin.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Password baru</span>
            <input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={cls} />
          </label>
          <button type="submit" disabled={busy} className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-3 text-sm font-medium hover:opacity-90 transition disabled:opacity-60">
            {busy && <Loader2 className="size-4 animate-spin" />}
            Simpan password
          </button>
        </form>

        {message && <p className="mt-4 text-xs text-secondary leading-relaxed">{message}</p>}
      </div>
    </div>
  );
}
