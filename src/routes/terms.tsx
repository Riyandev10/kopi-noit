import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Syarat & Ketentuan — Kopi Noit" },
      { name: "description", content: "Syarat dan ketentuan penggunaan layanan Kopi Noit." },
      { property: "og:title", content: "Syarat & Ketentuan — Kopi Noit" },
      { property: "og:description", content: "Syarat dan ketentuan penggunaan layanan Kopi Noit." },
    ],
  }),
  component: Terms,
});

function Terms() {
  const { t, lang } = useI18n();
  const sections = lang === "id"
    ? [
        { h: "1. Pemesanan", p: "Pemesanan dilakukan langsung melalui website. Pesanan diproses setelah pembayaran dikonfirmasi. Kami berhak menolak pesanan yang dianggap tidak wajar." },
        { h: "2. Pembayaran", p: "Kami menerima QRIS, transfer bank, dan COD. Untuk metode non-COD, pesanan akan diproses setelah dana masuk." },
        { h: "3. Pengiriman", p: "Free ongkir berlaku untuk wilayah kota Cirebon. Estimasi pengantaran 30–60 menit, tergantung jarak dan kondisi lalu lintas." },
        { h: "4. Pembatalan & Pengembalian", p: "Karena setiap kopi diseduh saat pesanan masuk, pembatalan hanya bisa dilakukan sebelum kopi mulai diseduh. Hubungi WhatsApp kami secepatnya." },
        { h: "5. Komplain", p: "Jika ada masalah dengan pesanan, silakan hubungi kami dalam 1×24 jam melalui WhatsApp atau DM Instagram." },
        { h: "6. Perubahan", p: "Kami dapat memperbarui syarat & ketentuan ini sewaktu-waktu. Perubahan berlaku sejak dipublikasikan di halaman ini." },
      ]
    : [
        { h: "1. Orders", p: "Orders are placed directly on this website. They are processed once payment is confirmed. We reserve the right to decline unreasonable orders." },
        { h: "2. Payment", p: "We accept QRIS, bank transfer, and COD. Non-COD orders are processed after funds are received." },
        { h: "3. Delivery", p: "Free delivery applies within Cirebon city. Estimated delivery is 30–60 minutes depending on distance and traffic." },
        { h: "4. Cancellation & Refund", p: "Because every bottle is freshly brewed when you order, cancellations are only possible before brewing starts. Please contact us via WhatsApp as soon as possible." },
        { h: "5. Complaints", p: "If anything is wrong with your order, contact us within 24 hours via WhatsApp or Instagram DM." },
        { h: "6. Changes", p: "We may update these terms at any time. Changes take effect once published on this page." },
      ];
  return (
    <div className="mx-auto max-w-3xl px-5 lg:px-8 py-20">
      <p className="text-xs uppercase tracking-[0.3em] text-primary">{lang === "id" ? "Legal" : "Legal"}</p>
      <h1 className="mt-4 font-display text-4xl md:text-5xl leading-tight">{t("legal.terms.title")}</h1>
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
