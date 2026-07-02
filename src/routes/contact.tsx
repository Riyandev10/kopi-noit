import { createFileRoute } from "@tanstack/react-router";
import { Instagram, MessageCircle, MapPin, Clock } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Kontak — Kopi Noit" },
      { name: "description", content: "Pesan Kopi Noit via DM Instagram atau WhatsApp. Free ongkir kota Cirebon." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-7xl px-5 lg:px-8 py-20">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">{t("contact.eyebrow")}</p>
        <h1 className="mt-4 font-display text-5xl md:text-6xl leading-tight">{t("contact.title")}</h1>
        <p className="mt-5 text-muted-foreground">{t("contact.desc")}</p>
      </div>

      <div className="mt-14 grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <a href="https://wa.me/628997999306" target="_blank" rel="noreferrer" className="flex items-center gap-4 rounded-2xl border border-border bg-card/40 p-5 hover:border-primary transition group">
            <div className="size-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition">
              <MessageCircle className="size-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">WhatsApp</p>
              <p className="font-medium">+62 899-7999-306</p>
            </div>
          </a>
          <a href="https://www.instagram.com/kopinoit.id/" target="_blank" rel="noreferrer" className="flex items-center gap-4 rounded-2xl border border-border bg-card/40 p-5 hover:border-primary transition group">
            <div className="size-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition">
              <Instagram className="size-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Instagram</p>
              <p className="font-medium">@kopinoit.id</p>
            </div>
          </a>
          <div className="flex items-start gap-4 rounded-2xl border border-border bg-card/40 p-5">
            <div className="size-12 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center">
              <MapPin className="size-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{t("contact.addr")}</p>
              <p className="font-medium">Bumi Asri Dawuan Blok B3 No. 21A</p>
              <p className="text-sm text-muted-foreground">Tengah Tani, Kab. Cirebon, Jawa Barat</p>
            </div>
          </div>
          <div className="flex items-start gap-4 rounded-2xl border border-border bg-card/40 p-5">
            <div className="size-12 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{t("contact.hours")}</p>
              <p className="font-medium">{t("contact.hoursVal")}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="rounded-3xl overflow-hidden border border-border h-full min-h-[420px] bg-card/40">
            <iframe
              title="Lokasi Kopi Noit di Cirebon"
              src="https://www.google.com/maps?q=Bumi+Asri+Dawuan,+Tengah+Tani,+Cirebon,+Jawa+Barat&output=embed"
              width="100%"
              height="100%"
              style={{ minHeight: 420, border: 0, filter: "invert(0.9) hue-rotate(180deg) saturate(0.7)" }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </div>
  );
}
