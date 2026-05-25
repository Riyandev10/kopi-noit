import { Link } from "@tanstack/react-router";
import { Instagram, MessageCircle, Facebook } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Logo } from "./Logo";

function TikTokIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.5 3a5.5 5.5 0 0 0 4.5 4.5v3.1a8.6 8.6 0 0 1-4.5-1.3v6.4a6.2 6.2 0 1 1-6.2-6.2c.3 0 .6 0 .9.1v3.2a3 3 0 1 0 2.1 2.9V3h3.2Z" />
    </svg>
  );
}

const socials = [
  { href: "https://www.instagram.com/kopinoit.id/", label: "Instagram", Icon: Instagram },
  { href: "https://www.tiktok.com/@kopi.noit", label: "TikTok", Icon: TikTokIcon },
  { href: "https://www.facebook.com/share/1Cn5EATch9/", label: "Facebook", Icon: Facebook },
  { href: "https://wa.me/6281234567890", label: "WhatsApp", Icon: MessageCircle },
];

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-20 sm:mt-24 border-t border-border/60">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 py-10 sm:py-12 grid gap-10 sm:gap-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo />
          <p className="mt-3 text-sm text-muted-foreground italic max-w-xs">{t("footer.tag")}</p>
        </div>

        {/* Navigation */}
        <div className="text-sm">
          <h4 className="font-semibold mb-3 text-foreground">Navigasi</h4>
          <ul className="space-y-2">
            {[
              { to: "/", label: t("nav.home") },
              { to: "/menu", label: t("nav.menu") },
              { to: "/about", label: t("nav.about") },
              { to: "/gallery", label: t("nav.gallery") },
              { to: "/contact", label: t("nav.contact") },
            ].map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="inline-block text-muted-foreground transition-all duration-200 hover:text-primary hover:translate-x-1"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="text-sm">
          <h4 className="font-semibold mb-3 text-foreground">{t("nav.contact")}</h4>
          <address className="not-italic text-muted-foreground leading-relaxed">
            Jl. Siliwangi No. 88<br />
            Kota Cirebon, Jawa Barat
          </address>
          <a
            href="mailto:hello@kopinoit.id"
            className="mt-2 inline-block text-muted-foreground hover:text-primary transition-colors"
          >
            hello@kopinoit.id
          </a>
        </div>

        {/* Social */}
        <div className="text-sm">
          <h4 className="font-semibold mb-3 text-foreground">Ikuti Kami</h4>
          <div className="flex gap-3 flex-wrap">
            {socials.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="group inline-flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-300 hover:border-primary hover:text-primary-foreground hover:bg-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/30"
              >
                <Icon className="size-4 transition-transform duration-300 group-hover:scale-110" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border/60 py-5 px-5 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs text-muted-foreground text-center">
        <span>© {new Date().getFullYear()} Kopi Noit. {t("footer.rights")}</span>
        <div className="flex items-center gap-4">
          <Link to="/terms" className="hover:text-primary transition-colors">{t("legal.terms")}</Link>
          <span aria-hidden>·</span>
          <Link to="/privacy" className="hover:text-primary transition-colors">{t("legal.privacy")}</Link>
        </div>
      </div>
    </footer>
  );
}
