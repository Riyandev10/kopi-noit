import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Kebijakan Privasi — Kopi Noit" },
      { name: "description", content: "Bagaimana Kopi Noit mengumpulkan dan menggunakan data Anda." },
      { property: "og:title", content: "Kebijakan Privasi — Kopi Noit" },
      { property: "og:description", content: "Bagaimana Kopi Noit mengumpulkan dan menggunakan data Anda." },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  const { t, lang } = useI18n();
  const sections = lang === "id"
    ? [
        { h: "1. Data yang Kami Kumpulkan", p: "Kami mengumpulkan nama, nomor WhatsApp, dan alamat pengiriman yang Anda berikan saat checkout. Data ini hanya digunakan untuk memproses pesanan." },
        { h: "2. Penggunaan Data", p: "Data digunakan untuk: (a) mengantar pesanan, (b) menghubungi Anda terkait pesanan, (c) memberi update promo bila Anda menyetujui." },
        { h: "3. Penyimpanan Data", p: "Data pesanan disimpan secara aman dan hanya diakses oleh tim Kopi Noit. Kami tidak menjual data Anda ke pihak ketiga." },
        { h: "4. Pembayaran", p: "Pembayaran diproses oleh penyedia pembayaran (QRIS / bank). Kami tidak menyimpan informasi kartu atau kredensial perbankan Anda." },
        { h: "5. Cookies", p: "Website ini hanya menggunakan cookies/penyimpanan lokal untuk preferensi bahasa dan isi keranjang. Tidak ada tracking iklan pihak ketiga." },
        { h: "6. Hak Anda", p: "Anda dapat meminta penghapusan data pesanan dengan menghubungi kami melalui WhatsApp atau email hello@kopinoit.id." },
      ]
    : [
        { h: "1. Data We Collect", p: "We collect the name, WhatsApp number, and delivery address you provide at checkout. This data is used solely to process your order." },
        { h: "2. How We Use It", p: "Your data is used to: (a) deliver your order, (b) contact you about your order, (c) send promo updates if you opt in." },
        { h: "3. Data Storage", p: "Order data is stored securely and only accessed by the Kopi Noit team. We never sell your data to third parties." },
        { h: "4. Payments", p: "Payments are processed by payment providers (QRIS / bank). We do not store card numbers or banking credentials." },
        { h: "5. Cookies", p: "This site only uses cookies/local storage for language preference and cart contents. No third-party ad tracking." },
        { h: "6. Your Rights", p: "You may request deletion of your order data by contacting us via WhatsApp or hello@kopinoit.id." },
      ];
  return (
    <div className="mx-auto max-w-3xl px-5 lg:px-8 py-20">
      <p className="text-xs uppercase tracking-[0.3em] text-primary">Legal</p>
      <h1 className="mt-4 font-display text-4xl md:text-5xl leading-tight">{t("legal.privacy.title")}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{lang === "id" ? "Terakhir diperbarui: 25 Mei 2026" : "Last updated: May 25, 2026"}</p>
      <div className="mt-10 space-y-8">
        {sections.map((s) => (
          <section key={s.h}>
            <h2 className="font-display text-xl text-foreground">{s.h}</h2>
            <p className="mt-2 text-muted-foreground leading-relaxed">{s.p}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
