export type BankId = "bca" | "mandiri" | "bri" | "bni";

export type Bank = {
  id: BankId;
  name: string;
  short: string;
  /** VA prefix per bank, mirip payment gateway sungguhan */
  prefix: string;
};

export const BANKS: Bank[] = [
  { id: "bca", name: "BCA", short: "Bank Central Asia", prefix: "39012" },
  { id: "mandiri", name: "Mandiri", short: "Bank Mandiri", prefix: "88908" },
  { id: "bri", name: "BRI", short: "Bank Rakyat Indonesia", prefix: "26215" },
  { id: "bni", name: "BNI", short: "Bank Negara Indonesia", prefix: "98801" },
];

export const ACCOUNT_NAME = "KOPI NOIT";

/** VA number: prefix bank + 8 digit unik dari nomor pesanan */
export function makeVaNumber(bank: Bank, seed: string) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) % 100000000;
  return bank.prefix + String(h).padStart(8, "0");
}

/** Kode unik 3 digit (100–999) yang ditambahkan ke total agar mudah diverifikasi */
export function makeUniqueCode(seed: string) {
  let h = 0;
  for (const ch of seed) h = (h * 17 + ch.charCodeAt(0)) % 900;
  return 100 + h;
}

export const TRANSFER_WINDOW_MS = 60 * 60 * 1000; // 1 jam
export const QRIS_WINDOW_MS = 15 * 60 * 1000; // 15 menit, standar QRIS dinamis

/** Batas waktu pembayaran per metode, seperti payment gateway sungguhan */
export function paymentWindowMs(method: string) {
  return method === "qris" ? QRIS_WINDOW_MS : TRANSFER_WINDOW_MS;
}

export const QRIS_MERCHANT = { name: "KOPI NOIT", nmid: "ID1024398271055", acquirer: "QRIS · GPN" };

/** ID transaksi QRIS yang ditampilkan ke pelanggan (mirip trx id gateway) */
export function makeQrisTrxId(code: string) {
  let h = 0;
  for (const ch of code) h = (h * 131 + ch.charCodeAt(0)) % 1000000;
  return "QR" + String(h).padStart(6, "0");
}

export function formatCountdown(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

export function formatDeadline(iso: string, lang: string) {
  return new Date(iso).toLocaleString(lang === "en" ? "en-US" : "id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
