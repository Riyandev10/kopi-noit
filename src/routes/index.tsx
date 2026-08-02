import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Coffee, Leaf, Truck } from "lucide-react";
import heroImg from "@/assets/kopi-noit-hero.jpeg";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kopi Noit — Kopi Keliling Cirebon" },
      { name: "description", content: "Kopi susu gula aren fresh dari Cirebon. Pesan sekarang, kami antar." },
    ],
  }),
  component: Index,
});

function Index() {
  const { t } = useI18n();
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 pt-16 lg:pt-24 pb-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs uppercase tracking-widest text-primary">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              {t("hero.tag")}
            </div>
            <h1 className="mt-6 font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-semibold leading-[0.95]">
              <span className="block">{t("hero.title1")}</span>
              <span className="block text-gradient-gold italic">{t("hero.title2")}</span>
            </h1>
            <p className="mt-6 max-w-md text-base text-muted-foreground leading-relaxed">{t("hero.desc")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/menu" className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:opacity-90 transition">
                {t("cta.menu")} <ArrowRight className="size-4" />
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium hover:border-primary hover:text-primary transition">
                {t("cta.order")}
              </Link>
            </div>
            <div className="mt-8 inline-flex items-center gap-3 rounded-lg border border-secondary/30 bg-secondary/10 px-4 py-3 text-xs">
              <Truck className="size-4 text-secondary" />
              <span className="font-medium tracking-wide">{t("hero.promo")}</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm lg:max-w-md">
            <div className="absolute -inset-6 bg-gradient-to-br from-primary/20 via-secondary/10 to-transparent blur-3xl" />
            <div className="relative rounded-3xl overflow-hidden border border-border shadow-2xl">
              <img src={heroImg} alt="Menu Kopi Noit" width={1080} height={1080} className="w-full h-auto" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 lg:px-8 py-20 grid md:grid-cols-3 gap-6">
        {[
          { Icon: Leaf, t: t("feature.1.t"), d: t("feature.1.d") },
          { Icon: Coffee, t: t("feature.2.t"), d: t("feature.2.d") },
          { Icon: Truck, t: t("feature.3.t"), d: t("feature.3.d") },
        ].map(({ Icon, t: title, d }) => (
          <div key={title} className="group rounded-2xl border border-border bg-card/50 p-6 hover:border-primary/50 transition">
            <div className="inline-flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition">
              <Icon className="size-5" />
            </div>
            <h3 className="mt-4 font-display text-xl">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{d}</p>
          </div>
        ))}
      </section>

      <section className="border-y border-border/60 overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 py-10 flex flex-wrap items-baseline justify-between gap-6">
          <p className="font-display italic text-2xl sm:text-3xl md:text-5xl text-gradient-gold">"Stuck? Noit dulu."</p>
          <Link to="/about" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-2">
            {t("nav.about")} <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
