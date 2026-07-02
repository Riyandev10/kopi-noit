import { createFileRoute } from "@tanstack/react-router";
import { Plus, Minus, Check } from "lucide-react";
import { useState } from "react";
import m1 from "@/assets/menu-gula-aren.jpg";
import m2 from "@/assets/menu-butterscotch.jpg";
import m3 from "@/assets/menu-matcha.jpg";
import m4 from "@/assets/menu-americano.jpg";
import { useI18n } from "@/lib/i18n";
import { useCart, formatIDR } from "@/lib/cart";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu — Kopi Noit" },
      { name: "description", content: "Kopi susu gula aren, kopi hitam manis, dan vanilla latte dingin." },
    ],
  }),
  component: Menu,
});

function Menu() {
  const { t } = useI18n();
  const { add, items, inc, dec } = useCart();
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const products = [
    { id: "gula-aren", img: m1, name: t("menu.1.t"), desc: t("menu.1.d"), price: 13000 },
    { id: "butterscotch-latte", img: m2, name: t("menu.2.t"), desc: t("menu.2.d"), price: 14000 },
    { id: "matcha-latte", img: m3, name: t("menu.3.t"), desc: t("menu.3.d"), price: 14000 },
    { id: "americano", img: m4, name: t("menu.4.t"), desc: t("menu.4.d"), price: 10000 },
  ];

  const qtyOf = (id: string) => items.find((i) => i.id === id)?.qty ?? 0;

  const handleAdd = (p: typeof products[number]) => {
    add({ id: p.id, name: p.name, price: p.price, img: p.img });
    setJustAdded(p.id);
    setTimeout(() => setJustAdded((cur) => (cur === p.id ? null : cur)), 1200);
  };

  return (
    <div className="mx-auto max-w-7xl px-5 lg:px-8 py-20">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">{t("menu.eyebrow")}</p>
        <h1 className="mt-4 font-display text-5xl md:text-6xl leading-tight">{t("menu.title")}</h1>
        <p className="mt-5 text-muted-foreground">{t("menu.desc")}</p>
      </div>

      <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-7">
        {products.map((p) => {
          const q = qtyOf(p.id);
          return (
            <article key={p.id} className="group rounded-3xl border border-border bg-card/40 overflow-hidden hover:border-primary/60 transition flex flex-col">
              <div className="aspect-square overflow-hidden bg-muted">
                <img src={p.img} alt={p.name} loading="lazy" width={1024} height={1024} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-display text-2xl leading-tight">{p.name}</h3>
                  <span className="shrink-0 rounded-full bg-primary/15 text-primary text-xs font-semibold px-3 py-1">{formatIDR(p.price)}</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground flex-1">{p.desc}</p>

                <div className="mt-5">
                  {q === 0 ? (
                    <button
                      onClick={() => handleAdd(p)}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground py-2.5 text-sm font-medium hover:opacity-90 transition"
                    >
                      {justAdded === p.id ? (<><Check className="size-4" /> {t("menu.added")}</>) : (<><Plus className="size-4" /> {t("menu.add")}</>)}
                    </button>
                  ) : (
                    <div className="flex items-center justify-between rounded-full border border-primary/40 bg-primary/10 p-1">
                      <button onClick={() => dec(p.id)} aria-label="Kurangi" className="size-9 inline-flex items-center justify-center rounded-full bg-background hover:bg-primary hover:text-primary-foreground transition">
                        <Minus className="size-4" />
                      </button>
                      <span className="font-display text-lg text-primary">{q}</span>
                      <button onClick={() => inc(p.id)} aria-label="Tambah" className="size-9 inline-flex items-center justify-center rounded-full bg-background hover:bg-primary hover:text-primary-foreground transition">
                        <Plus className="size-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
