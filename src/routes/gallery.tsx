import { createFileRoute } from "@tanstack/react-router";
import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";
import galeriCup from "@/assets/galeri-cup-siap.jpg.asset.json";
import about from "@/assets/about-story.jpg";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Galeri — Kopi Noit" },
      { name: "description", content: "Momen di balik setiap tegukan Kopi Noit." },
    ],
  }),
  component: Gallery,
});

function Gallery() {
  const { t } = useI18n();
  const images = [
    { src: g1, h: "tall" }, { src: g2, h: "short" }, { src: galeriCup.url, h: "short" },
    { src: g3, h: "tall" }, { src: g4, h: "short" }, { src: about, h: "short" },
  ];
  return (
    <div className="mx-auto max-w-7xl px-5 lg:px-8 py-20">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">{t("gallery.eyebrow")}</p>
        <h1 className="mt-4 font-display text-5xl md:text-6xl leading-tight">{t("gallery.title")}</h1>
      </div>

      <div className="mt-14 columns-1 sm:columns-2 lg:columns-3 gap-5 [column-fill:_balance]">
        {images.map((img, i) => (
          <div key={i} className="mb-5 break-inside-avoid overflow-hidden rounded-2xl border border-border group">
            <img
              src={img.src}
              alt={`Kopi Noit gallery ${i + 1}`}
              loading="lazy"
              className={`w-full object-cover transition duration-700 group-hover:scale-[1.03] ${img.h === "tall" ? "aspect-[3/4]" : "aspect-square"}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
