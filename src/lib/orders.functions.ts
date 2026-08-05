import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  adminStatusSchema,
  createOrderSchema,
  orderKeySchema,
  proofSchema,
} from "./orders.schemas";

const PUBLIC_COLUMNS =
  "id, code, customer_name, customer_phone, customer_email, customer_address, customer_notes, items, subtotal, unique_code, pay_total, method, status, bank, bank_full, va_number, account_name, expires_at, proof_path, proof_uploaded_at, paid_at, admin_note, created_at";

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => createOrderSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const helpers = await import("./orders.server");

    const subtotal = data.items.reduce((s, i) => s + i.price * i.qty, 0);
    const code = helpers.makeOrderCode();
    const token = helpers.randomToken(24);
    const isTransfer = data.method === "transfer";
    const isQris = data.method === "qris";
    const transfer = isTransfer ? helpers.buildTransfer(data.bankId ?? "bca", code) : null;
    const qris = isQris ? helpers.buildQris(code) : null;
    const uniqueCode = transfer?.unique_code ?? qris?.unique_code ?? 0;
    const expiresAt = transfer?.expires_at ?? qris?.expires_at ?? null;
    // QRIS & transfer sama-sama menunggu pembayaran nyata — tidak pernah langsung "paid".
    const status = data.method === "cod" ? "cod_unpaid" : "pending_payment";


    const { data: row, error } = await supabaseAdmin
      .from("orders")
      .insert({
        code,
        access_token: token,
        customer_name: data.customer.name,
        customer_phone: data.customer.phone,
        customer_email: data.customer.email || null,
        customer_address: data.customer.address,
        customer_notes: data.customer.notes || null,
        items: data.items,
        subtotal,
        unique_code: uniqueCode,
        pay_total: subtotal + uniqueCode,
        method: data.method,
        status,
        bank: transfer?.bank ?? null,
        bank_full: transfer?.bank_full ?? null,
        va_number: transfer?.va_number ?? null,
        account_name: transfer ? transfer.account_name : isQris ? "KOPI NOIT" : null,
        expires_at: expiresAt,
        paid_at: null,
      })
      .select("id, code, customer_name, customer_phone, customer_email, pay_total, va_number, bank, status")
      .single();

    if (error || !row) throw new Error(error?.message ?? "Gagal membuat pesanan");

    await helpers.recordStatus(row.id, status, "Pesanan dibuat");

    await helpers.notify(row, "created");

    return { code, token };
  });

export const getOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => orderKeySchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const helpers = await import("./orders.server");

    const { data: row } = await supabaseAdmin
      .from("orders")
      .select(PUBLIC_COLUMNS)
      .eq("code", data.code)
      .eq("access_token", data.token)
      .maybeSingle();

    if (!row) return { order: null, history: [] };

    const status = await helpers.expireIfNeeded(row);
    const { data: history } = await supabaseAdmin
      .from("order_status_history")
      .select("id, status, note, created_at")
      .eq("order_id", row.id)
      .order("created_at", { ascending: true });

    return { order: { ...row, status }, history: history ?? [] };
  });

export const uploadPaymentProof = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => proofSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const helpers = await import("./orders.server");

    if (!/^(image\/(png|jpe?g|webp)|application\/pdf)$/.test(data.contentType)) {
      throw new Error("Format file harus JPG, PNG, WEBP, atau PDF");
    }

    const { data: row } = await supabaseAdmin
      .from("orders")
      .select("id, code, status, expires_at")
      .eq("code", data.code)
      .eq("access_token", data.token)
      .maybeSingle();
    if (!row) throw new Error("Pesanan tidak ditemukan");
    if (row.status === "paid") throw new Error("Pesanan ini sudah dibayar");

    const bytes = Uint8Array.from(atob(data.dataBase64), (c) => c.charCodeAt(0));
    if (bytes.byteLength > 5_000_000) throw new Error("Ukuran file maksimal 5 MB");

    const ext = data.fileName.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${row.code}/${Date.now()}.${ext}`;

    const up = await supabaseAdmin.storage
      .from("payment-proofs")
      .upload(path, bytes, { contentType: data.contentType, upsert: false });
    if (up.error) throw new Error(up.error.message);

    await supabaseAdmin
      .from("orders")
      .update({ proof_path: path, proof_uploaded_at: new Date().toISOString() })
      .eq("id", row.id);

    await helpers.setStatus(row.id, "awaiting_confirmation", {
      note: "Bukti transfer diunggah pelanggan",
      event: "proof_uploaded",
    });

    return { ok: true };
  });

export const adminListOrders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const helpers = await import("./orders.server");
    await helpers.assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data, error } = await supabaseAdmin
      .from("orders")
      .select(PUBLIC_COLUMNS)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminSetOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => adminStatusSchema.parse(data))
  .handler(async ({ data, context }) => {
    const helpers = await import("./orders.server");
    await helpers.assertAdmin(context.supabase, context.userId);
    await helpers.setStatus(data.orderId, data.status, {
      note: data.note ?? "Diperbarui admin",
      event: `admin_${data.status}`,
    });
    return { ok: true };
  });

export const adminProofUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { orderId: string }) => data)
  .handler(async ({ data, context }) => {
    const helpers = await import("./orders.server");
    await helpers.assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row } = await supabaseAdmin
      .from("orders")
      .select("proof_path")
      .eq("id", data.orderId)
      .maybeSingle();
    if (!row?.proof_path) return { url: null };

    const signed = await supabaseAdmin.storage
      .from("payment-proofs")
      .createSignedUrl(row.proof_path, 600);
    return { url: signed.data?.signedUrl ?? null };
  });

export const isAdminUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { isAdmin: data === true };
  });
