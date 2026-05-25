import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "id" | "en";

type Dict = Record<string, string>;

const translations: Record<Lang, Dict> = {
  id: {
    "nav.home": "Beranda",
    "nav.about": "Tentang",
    "nav.menu": "Menu",
    "nav.gallery": "Galeri",
    "nav.contact": "Kontak",
    "cta.order": "Pesan via DM",
    "cta.menu": "Lihat Menu",
    "hero.tag": "Fresh dibuat saat pre-order",
    "hero.title1": "Stuck?",
    "hero.title2": "Noit dulu.",
    "hero.desc": "Kopi keliling premium dari Cirebon. Susu gula aren, fresh diseduh, dikemas dalam botol kaca 250 ml.",
    "hero.promo": "PROMO • FREE ONGKIR khusus kota Cirebon",
    "feature.1.t": "Bahan Pilihan",
    "feature.1.d": "Gula aren alami dan biji kopi pilihan dari petani lokal.",
    "feature.2.t": "Fresh Pre-Order",
    "feature.2.d": "Setiap botol dibuat saat pesanan masuk — tanpa pengawet.",
    "feature.3.t": "Kopi Keliling",
    "feature.3.d": "Gerobak kami siap menjemput kamu di sudut-sudut kota.",
    "about.eyebrow": "Cerita Kami",
    "about.title": "Kopi yang tumbuh dari jalanan Cirebon.",
    "about.p1": "Kopi Noit lahir dari kebiasaan sederhana: ngopi sebentar saat pikiran mentok. Dari satu gerobak kecil, kami menyajikan kopi susu gula aren dengan rasa rumahan dan cara yang jujur.",
    "about.p2": "Setiap botol kami buat saat kamu pesan. Tanpa stok lama, tanpa pengawet. Hanya kopi, susu, dan gula aren asli — disajikan dengan hati.",
    "about.v1.t": "Jujur",
    "about.v1.d": "Bahan asli, tanpa pemanis buatan.",
    "about.v2.t": "Hangat",
    "about.v2.d": "Pelayanan ramah seperti warga sebelah.",
    "about.v3.t": "Dekat",
    "about.v3.d": "Keliling sudut kota mendekat ke kamu.",
    "menu.eyebrow": "Menu",
    "menu.title": "Diseduh segar, dikemas dengan cinta.",
    "menu.desc": "Semua menu dalam botol kaca 250 ml. Pre-order minimal H-1.",
    "menu.order": "Pesan menu ini",
    "menu.1.t": "Kopi Susu Gula Aren",
    "menu.1.d": "Kopi lembut dengan gula aren pilihan. Manis alami, rasa mantap.",
    "menu.2.t": "Kopi Hitam Manis",
    "menu.2.d": "Espresso dingin dengan sentuhan gula aren — pahit yang ramah.",
    "menu.3.t": "Vanilla Latte Dingin",
    "menu.3.d": "Susu creamy dengan vanilla alami, cocok untuk teman santai.",
    "gallery.eyebrow": "Galeri",
    "gallery.title": "Momen di balik setiap tegukan.",
    "contact.eyebrow": "Kontak",
    "contact.title": "Pesan sekarang, kami antar.",
    "contact.desc": "Pesan via DM Instagram atau WhatsApp. Free ongkir untuk wilayah kota Cirebon.",
    "contact.addr": "Alamat Gerobak",
    "contact.hours": "Jam Operasional",
    "contact.hoursVal": "Senin – Minggu, 15.00 – 22.00 WIB",
    "footer.tag": "Stuck? Noit dulu.",
    "footer.rights": "Hak cipta dilindungi.",
  },
  en: {
    "nav.home": "Home",
    "nav.about": "About",
    "nav.menu": "Menu",
    "nav.gallery": "Gallery",
    "nav.contact": "Contact",
    "cta.order": "Order via DM",
    "cta.menu": "See the Menu",
    "hero.tag": "Freshly made on pre-order",
    "hero.title1": "Stuck?",
    "hero.title2": "Noit first.",
    "hero.desc": "A premium street-coffee from Cirebon. Palm sugar milk coffee, freshly brewed, bottled in 250 ml glass.",
    "hero.promo": "PROMO • FREE delivery within Cirebon city",
    "feature.1.t": "Honest Ingredients",
    "feature.1.d": "Natural palm sugar and beans from local farmers.",
    "feature.2.t": "Fresh Pre-Order",
    "feature.2.d": "Every bottle is made when you order — no preservatives.",
    "feature.3.t": "Street Coffee",
    "feature.3.d": "Our little cart rolls right into your neighborhood.",
    "about.eyebrow": "Our Story",
    "about.title": "Coffee grown from the streets of Cirebon.",
    "about.p1": "Kopi Noit was born from a simple habit: pausing for coffee when your head feels stuck. From one small cart, we serve palm-sugar milk coffee with a homely taste and an honest way.",
    "about.p2": "Every bottle is made when you order. No old stock, no preservatives. Just coffee, milk, and real palm sugar — served with heart.",
    "about.v1.t": "Honest",
    "about.v1.d": "Real ingredients, never artificial sweeteners.",
    "about.v2.t": "Warm",
    "about.v2.d": "Friendly service, like your kind neighbor.",
    "about.v3.t": "Close",
    "about.v3.d": "Rolling around the city to find you.",
    "menu.eyebrow": "Menu",
    "menu.title": "Freshly brewed, lovingly bottled.",
    "menu.desc": "All drinks come in 250 ml glass bottles. Pre-order at least one day ahead.",
    "menu.order": "Order this drink",
    "menu.1.t": "Palm Sugar Milk Coffee",
    "menu.1.d": "Soft coffee with selected palm sugar. Naturally sweet, deeply satisfying.",
    "menu.2.t": "Sweet Black Coffee",
    "menu.2.d": "Cold espresso kissed by palm sugar — a friendly bitterness.",
    "menu.3.t": "Iced Vanilla Latte",
    "menu.3.d": "Creamy milk with real vanilla — a calm afternoon companion.",
    "gallery.eyebrow": "Gallery",
    "gallery.title": "Moments behind every sip.",
    "contact.eyebrow": "Contact",
    "contact.title": "Order now, we'll deliver.",
    "contact.desc": "Order via Instagram DM or WhatsApp. Free delivery within Cirebon city.",
    "contact.addr": "Cart Address",
    "contact.hours": "Opening Hours",
    "contact.hoursVal": "Mon – Sun, 3 PM – 10 PM WIB",
    "footer.tag": "Stuck? Noit first.",
    "footer.rights": "All rights reserved.",
  },
};

type I18nCtx = { lang: Lang; setLang: (l: Lang) => void; t: (key: string) => string };
const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("id");
  useEffect(() => {
    const saved = typeof window !== "undefined" ? (localStorage.getItem("lang") as Lang | null) : null;
    if (saved === "id" || saved === "en") setLangState(saved);
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("lang", l);
  };
  const t = (key: string) => translations[lang][key] ?? key;
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
