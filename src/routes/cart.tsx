import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart, formatIDR } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Keranjang — Kopi Noit" }] }),
  component: CartPage,
});

function CartPage() {
  const { t } = useI18n();
  const { items, inc, dec, remove, total } = useCart();

  return (
    <div className="mx-auto max-w-4xl px-5 lg:px-8 py-20">
      <h1 className="font-display text-4xl md:text-5xl">{t("cart.title")}</h1>

      {items.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-border bg-card/40 p-12 text-center">
          <ShoppingBag className="size-10 mx-auto text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">{t("cart.empty")}</p>
          <Link to="/menu" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium">
            {t("cart.browse")} <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid lg:grid-cols-[1fr_360px] gap-8">
          <div className="space-y-4">
            {items.map((it) => (
              <div key={it.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card/40 p-4">
                {it.img && <img src={it.img} alt={it.name} className="size-20 rounded-xl object-cover" />}
                <div className="flex-1 min-w-0">
                  <p className="font-display text-lg leading-tight truncate">{it.name}</p>
                  <p className="text-sm text-primary">{formatIDR(it.price)}</p>
                </div>
                <div className="flex items-center gap-1 rounded-full border border-border p-1">
                  <button onClick={() => dec(it.id)} className="size-8 inline-flex items-center justify-center rounded-full hover:bg-primary hover:text-primary-foreground transition" aria-label="Kurangi">
                    <Minus className="size-4" />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">{it.qty}</span>
                  <button onClick={() => inc(it.id)} className="size-8 inline-flex items-center justify-center rounded-full hover:bg-primary hover:text-primary-foreground transition" aria-label="Tambah">
                    <Plus className="size-4" />
                  </button>
                </div>
                <button onClick={() => remove(it.id)} aria-label="Hapus" className="text-muted-foreground hover:text-destructive p-2">
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>

          <aside className="rounded-2xl border border-border bg-card/40 p-6 h-fit lg:sticky lg:top-20">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-display text-xl">{t("checkout.summary")}</h2>
              <span className="text-xs text-muted-foreground">{count} item</span>
            </div>

            <ul className="mt-4 space-y-2.5 text-sm">
              {items.map((i) => (
                <li key={i.id} className="flex justify-between gap-3">
                  <span className="text-muted-foreground truncate">
                    {i.name} <span className="text-primary">×{i.qty}</span>
                  </span>
                  <span className="shrink-0">{formatIDR(i.price * i.qty)}</span>
                </li>
              ))}
            </ul>

            <div className="border-t border-border my-4" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">{t("cart.subtotal")}</span><span>{formatIDR(total)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{t("cart.delivery")}</span><span className="text-primary">{t("cart.free")}</span></div>
              <div className="border-t border-border my-3" />
              <div className="flex justify-between font-display text-lg"><span>{t("cart.total")}</span><span className="text-gradient-gold">{formatIDR(total)}</span></div>
            </div>

            <Link to="/checkout" className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-3 text-sm font-medium hover:opacity-90 transition">
              {t("cart.checkout")} <ArrowRight className="size-4" />
            </Link>

            <Link to="/menu" className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition">
              <ShoppingBag className="size-4" /> {t("cart.browse")}
            </Link>

            <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
              <ShieldCheck className="size-3.5 text-primary" />
              QRIS · Transfer · COD
            </div>
          </aside>

        </div>
      )}
    </div>
  );
}
