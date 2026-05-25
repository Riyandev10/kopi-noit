import { Link } from "@tanstack/react-router";
import { Instagram, MessageCircle, Facebook } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Logo } from "./Logo";

// TikTok icon (lucide doesn't ship one)
function TikTokIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.5 3a5.5 5.5 0 0 0 4.5 4.5v3.1a8.6 8.6 0 0 1-4.5-1.3v6.4a6.2 6.2 0 1 1-6.2-6.2c.3 0 .6 0 .9.1v3.2a3 3 0 1 0 2.1 2.9V3h3.2Z" />
    </svg>
  );
}

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-24 border-t border-border/60">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-12 grid gap-10 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-3 text-sm text-muted-foreground italic">{t("footer.tag")}</p>
        </div>
        <div className="text-sm">
          <h4 className="font-semibold mb-3">{t("nav.contact")}</h4>
          <p className="text-muted-foreground">Jl. Siliwangi No. 88<br/>Kota Cirebon, Jawa Barat</p>
          <p className="text-muted-foreground mt-2">hello@kopinoit.id</p>
        </div>
        <div className="text-sm">
          <h4 className="font-semibold mb-3">Social</h4>
          <div className="flex gap-3 flex-wrap">
            <a href="https://instagram.com/kopinoit" target="_blank" rel="noreferrer" aria-label="Instagram" className="inline-flex size-9 items-center justify-center rounded-full border border-border hover:border-primary hover:text-primary transition">
              <Instagram className="size-4" />
            </a>
            <a href="https://tiktok.com/@kopinoit" target="_blank" rel="noreferrer" aria-label="TikTok" className="inline-flex size-9 items-center justify-center rounded-full border border-border hover:border-primary hover:text-primary transition">
              <TikTokIcon className="size-4" />
            </a>
            <a href="https://facebook.com/kopinoit" target="_blank" rel="noreferrer" aria-label="Facebook" className="inline-flex size-9 items-center justify-center rounded-full border border-border hover:border-primary hover:text-primary transition">
              <Facebook className="size-4" />
            </a>
            <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer" aria-label="WhatsApp" className="inline-flex size-9 items-center justify-center rounded-full border border-border hover:border-primary hover:text-primary transition">
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
