import { Link } from "@tanstack/react-router";
import { Instagram, MessageCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-24 border-t border-border/60">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-12 grid gap-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display text-2xl font-semibold text-gradient-gold">N</span>
            <span className="font-display text-lg font-semibold tracking-widest uppercase">Kopi Noit</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground italic">{t("footer.tag")}</p>
        </div>
        <div className="text-sm">
          <h4 className="font-semibold mb-3">{t("nav.contact")}</h4>
          <p className="text-muted-foreground">Jl. Siliwangi No. 88<br/>Kota Cirebon, Jawa Barat</p>
          <p className="text-muted-foreground mt-2">hello@kopinoit.id</p>
        </div>
        <div className="text-sm">
          <h4 className="font-semibold mb-3">Social</h4>
          <div className="flex gap-3">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="inline-flex size-9 items-center justify-center rounded-full border border-border hover:border-primary hover:text-primary transition">
              <Instagram className="size-4" />
            </a>
            <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer" className="inline-flex size-9 items-center justify-center rounded-full border border-border hover:border-primary hover:text-primary transition">
              <MessageCircle className="size-4" />
            </a>
          </div>
          <div className="flex gap-4 mt-5 text-muted-foreground">
            <Link to="/menu" className="hover:text-foreground">{t("nav.menu")}</Link>
            <Link to="/about" className="hover:text-foreground">{t("nav.about")}</Link>
            <Link to="/gallery" className="hover:text-foreground">{t("nav.gallery")}</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Kopi Noit. {t("footer.rights")}
      </div>
    </footer>
  );
}
