// Server-only helpers for the order lifecycle. Never import from client code.
import { BANKS, ACCOUNT_NAME, QRIS_WINDOW_MS, TRANSFER_WINDOW_MS, makeUniqueCode, makeVaNumber } from "./payment";

export type OrderStatus =
  | "pending_payment"
  | "awaiting_confirmation"
  | "paid"
  | "expired"
  | "cod_unpaid"
  | "rejected";

export const WA_ADMIN = "628997999306";

export function randomToken(len = 24) {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, len);
}

export function makeOrderCode() {
  return "NOIT-" + randomToken(6).toUpperCase().replace(/[^A-Z0-9]/g, "X").slice(0, 6);
}

export function buildTransfer(bankId: string, code: string) {
  const bank = BANKS.find((b) => b.id === bankId) ?? BANKS[0]!;
  return {
    bank: bank.name,
    bank_full: bank.short,
    va_number: makeVaNumber(bank, code),
    account_name: ACCOUNT_NAME,
    unique_code: makeUniqueCode(code),
    expires_at: new Date(Date.now() + TRANSFER_WINDOW_MS).toISOString(),
  };
}

/** QRIS: nominal dibuat unik dengan kode 3 digit agar rekonsiliasi mudah */
export function buildQris(code: string) {
  return {
    unique_code: makeUniqueCode(code),
    expires_at: new Date(Date.now() + QRIS_WINDOW_MS).toISOString(),
  };
}

export function formatIDRServer(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: "Menunggu pembayaran",
  awaiting_confirmation: "Menunggu konfirmasi admin",
  paid: "Sudah dibayar",
  expired: "Kedaluwarsa",
  cod_unpaid: "Belum dibayar (bayar di tempat)",
  rejected: "Bukti transfer ditolak",
};

export async function assertAdmin(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: { rpc: (fn: any, args: any) => any },
  userId: string,
) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (data !== true) throw new Error("Forbidden: butuh akses admin");
}
