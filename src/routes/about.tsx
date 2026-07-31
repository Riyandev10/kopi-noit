import { createFileRoute } from "@tanstack/react-router";
import aboutAsset from "@/assets/tim-kopi-noit.jpg.asset.json";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Tentang — Kopi Noit" },
      { name: "description", content: "Cerita di balik Kopi Noit, kopi keliling premium dari Cirebon." },
    ],
  }),
  component: About,
});

function About() {
  const { t } = useI18n();
  const values = [
    { t: t("about.v1.t"), d: t("about.v1.d") },
    { t: t("about.v2.t"), d: t("about.v2.d") },
    { t: t("about.v3.t"), d: t("about.v3.d") },
  ];
  return (
    <div className="mx-auto max-w-7xl px-5 lg:px-8 py-20 overflow-x-clip">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primary">{t("about.eyebrow")}</p>
          <h1 className="mt-4 font-display text-5xl md:text-6xl leading-tight">{t("about.title")}</h1>
          <p className="mt-6 text-muted-foreground leading-relaxed">{t("about.p1")}</p>
          <p className="mt-4 text-muted-foreground leading-relaxed">{t("about.p2")}</p>
        </div>
        <div className="relative isolate">
          <div className="absolute -inset-6 -z-10 bg-gradient-to-tr from-primary/20 to-transparent blur-3xl" />
          <img src={aboutAsset.url} alt="Tim Kopi Noit di gerobak kopi keliling Cirebon" loading="lazy" width={723} height={964} className="relative rounded-3xl border border-border w-full h-auto object-cover aspect-[3/4]" />
        </div>
      </div>

      <div className="mt-24 grid md:grid-cols-3 gap-6">
        {values.map((v, i) => (
          <div key={v.t} className="rounded-2xl border border-border bg-card/40 p-7">
            <div className="font-display text-5xl text-gradient-gold">0{i + 1}</div>
            <h3 className="mt-4 font-display text-2xl">{v.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{v.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
