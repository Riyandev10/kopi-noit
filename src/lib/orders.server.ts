// Server-only helpers for the order lifecycle. Never import from client code.
import { BANKS, ACCOUNT_NAME, TRANSFER_WINDOW_MS, makeUniqueCode, makeVaNumber } from "./payment";

export type OrderStatus =
  | "pending_payment"
  | "awaiting_confirmation"
  | "paid"
  | "expired"
  | "cod_unpaid"
  | "rejected";

export const WA_ADMIN = "628997999306";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

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

type OrderRow = {
  id: string;
  code: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  pay_total: number;
  va_number: string | null;
  bank: string | null;
  status: string;
};

export async function recordStatus(orderId: string, status: OrderStatus, note?: string) {
  const db = await admin();
  await db.from("order_status_history").insert({ order_id: orderId, status, note: note ?? null });
}

/** Menyimpan notifikasi (email + WhatsApp) untuk setiap perubahan status pesanan. */
export async function notify(order: OrderRow, event: string, extra?: string) {
  const db = await admin();
  const label = STATUS_LABEL[(order.status as OrderStatus) ?? "pending_payment"] ?? order.status;
  const subject = `Pesanan ${order.code} — ${label}`;
  const lines = [
    `Halo ${order.customer_name},`,
    "",
    `Status pesanan ${order.code} kini: ${label}.`,
    `Total: ${formatIDRServer(order.pay_total)}`,
    order.va_number ? `Virtual Account ${order.bank}: ${order.va_number}` : "",
    extra ?? "",
    "",
    "Terima kasih sudah ngopi bareng Kopi Noit.",
  ].filter(Boolean);
  const body = lines.join("\n");

  const rows = [
    {
      order_id: order.id,
      event,
      channel: "whatsapp",
      recipient: order.customer_phone,
      subject,
      body,
      status: "ready",
    },
  ];

  if (order.customer_email) {
    rows.push({
      order_id: order.id,
      event,
      channel: "email",
      recipient: order.customer_email,
      subject,
      body,
      status: "queued",
    });
  }

  const { error } = await db.from("order_notifications").insert(rows);
  if (error) console.error("[notify] failed", error.message);
}

/** Menandai pesanan transfer yang lewat batas waktu sebagai kedaluwarsa. */
export async function expireIfNeeded(order: {
  id: string;
  status: string;
  expires_at: string | null;
}) {
  if (order.status !== "pending_payment" || !order.expires_at) return order.status;
  if (new Date(order.expires_at).getTime() > Date.now()) return order.status;

  const db = await admin();
  const { data } = await db
    .from("orders")
    .update({ status: "expired" })
    .eq("id", order.id)
    .eq("status", "pending_payment")
    .select("id, code, customer_name, customer_phone, customer_email, pay_total, va_number, bank, status")
    .maybeSingle();

  if (data) {
    await recordStatus(data.id, "expired", "Batas waktu pembayaran habis");
    await notify(data as OrderRow, "expired");
  }
  return "expired";
}

export async function setStatus(
  orderId: string,
  status: OrderStatus,
  opts: { note?: string; event?: string; adminNote?: string } = {},
) {
  const db = await admin();
  const patch: { status: OrderStatus; paid_at?: string; admin_note?: string } = { status };
  if (status === "paid") patch.paid_at = new Date().toISOString();
  if (opts.adminNote !== undefined) patch.admin_note = opts.adminNote;

  const { data, error } = await db
    .from("orders")
    .update(patch)
    .eq("id", orderId)
    .select("id, code, customer_name, customer_phone, customer_email, pay_total, va_number, bank, status")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Pesanan tidak ditemukan");

  await recordStatus(orderId, status, opts.note);
  await notify(data as OrderRow, opts.event ?? status);
  return data;
}

export async function assertAdmin(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: { rpc: (fn: any, args: any) => any },
  userId: string,
) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (data !== true) throw new Error("Forbidden: butuh akses admin");
}
