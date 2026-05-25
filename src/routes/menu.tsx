import { createFileRoute } from "@tanstack/react-router";
import m1 from "@/assets/menu-gula-aren.jpg";
import m2 from "@/assets/menu-americano.jpg";
import m3 from "@/assets/menu-latte.jpg";
import { useI18n } from "@/lib/i18n";

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
  const items = [
    { img: m1, t: t("menu.1.t"), d: t("menu.1.d"), price: "Rp 22K" },
    { img: m2, t: t("menu.2.t"), d: t("menu.2.d"), price: "Rp 20K" },
    { img: m3, t: t("menu.3.t"), d: t("menu.3.d"), price: "Rp 25K" },
  ];
  return (
    <div className="mx-auto max-w-7xl px-5 lg:px-8 py-20">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">{t("menu.eyebrow")}</p>
        <h1 className="mt-4 font-display text-5xl md:text-6xl leading-tight">{t("menu.title")}</h1>
        <p className="mt-5 text-muted-foreground">{t("menu.desc")}</p>
      </div>

      <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-7">
        {items.map((it) => (
          <article key={it.t} className="group rounded-3xl border border-border bg-card/40 overflow-hidden hover:border-primary/60 transition">
            <div className="aspect-square overflow-hidden bg-muted">
              <img src={it.img} alt={it.t} loading="lazy" width={1024} height={1024} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-display text-2xl leading-tight">{it.t}</h3>
                <span className="shrink-0 rounded-full bg-primary/15 text-primary text-xs font-semibold px-3 py-1">{it.price}</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{it.d}</p>
              <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer" className="mt-5 inline-flex text-sm text-primary hover:underline">
                {t("menu.order")} →
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
