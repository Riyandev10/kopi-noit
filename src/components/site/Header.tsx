import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, ShoppingBag } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { Logo } from "./Logo";

export function Header() {
  const { t, lang, setLang } = useI18n();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const { location } = useRouterState();

  const links = [
    { to: "/", label: t("nav.home") },
    { to: "/about", label: t("nav.about") },
    { to: "/menu", label: t("nav.menu") },
    { to: "/gallery", label: t("nav.gallery") },
    { to: "/contact", label: t("nav.contact") },
  ] as const;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/70 border-b border-border/60">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Logo />
          <span className="hidden sm:inline font-display text-xs font-medium tracking-[0.3em] uppercase text-muted-foreground">
            Kopi
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => {
            const active = location.pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`relative px-3 py-2 text-sm rounded-md transition-colors after:content-[''] after:absolute after:left-3 after:right-3 after:-bottom-0.5 after:h-px after:bg-primary after:origin-left after:transition-transform after:duration-300 ${active ? "text-primary after:scale-x-100" : "text-muted-foreground hover:text-foreground after:scale-x-0 hover:after:scale-x-100"}`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center text-xs font-medium border border-border rounded-full overflow-hidden">
            <button onClick={() => setLang("id")} className={`px-2.5 py-1 ${lang === "id" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>ID</button>
            <button onClick={() => setLang("en")} className={`px-2.5 py-1 ${lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>EN</button>
          </div>
          <Link to="/cart" className="relative inline-flex size-9 items-center justify-center rounded-full border border-border hover:border-primary hover:text-primary transition" aria-label="Keranjang">
            <ShoppingBag className="size-4" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          <Link to="/menu" className="hidden lg:inline-flex items-center rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition">
            {t("cta.order")}
          </Link>
          <button className="lg:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border/60 bg-background/95 backdrop-blur">
          <div className="px-5 py-4 flex flex-col gap-2">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="py-2 text-sm">
                {l.label}
              </Link>
            ))}
            <div className="flex items-center gap-2 pt-2">
              <button onClick={() => setLang("id")} className={`px-3 py-1 text-xs rounded-full border ${lang === "id" ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}>ID</button>
              <button onClick={() => setLang("en")} className={`px-3 py-1 text-xs rounded-full border ${lang === "en" ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}>EN</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
