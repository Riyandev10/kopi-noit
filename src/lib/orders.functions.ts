import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  adminStatusSchema,
  createOrderSchema,
  orderKeySchema,
  proofSchema,
} from "./orders.schemas";
import type { OrderHistoryEntry, OrderPublic } from "./orders.schemas";

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => createOrderSchema.parse(data))
  .handler(async ({ data }) => {
    const { serverPublicClient } = await import("./supabase-public.server");
    const helpers = await import("./orders.server");
    const db = serverPublicClient();

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

    const { error } = await db.from("orders").insert({
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
    });

    if (error) throw new Error(error.message || "Gagal membuat pesanan");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db.rpc as any)("order_created", { _code: code, _token: token });

    return { code, token };
  });

export const getOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => orderKeySchema.parse(data))
  .handler(async ({ data }) => {
    const { serverPublicClient } = await import("./supabase-public.server");
    const db = serverPublicClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: result, error } = await (db.rpc as any)("order_by_token", {
      _code: data.code,
      _token: data.token,
    });
    if (error) throw new Error(error.message);

    const payload = (result ?? {}) as {
      order: OrderPublic | null;
      history: OrderHistoryEntry[];
    };
    return { order: payload.order ?? null, history: payload.history ?? [] };
  });

export const uploadPaymentProof = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => proofSchema.parse(data))
  .handler(async ({ data }) => {
    const { serverPublicClient } = await import("./supabase-public.server");
    const db = serverPublicClient();

    if (!/^(image\/(png|jpe?g|webp)|application\/pdf)$/.test(data.contentType)) {
      throw new Error("Format file harus JPG, PNG, WEBP, atau PDF");
    }

    const bytes = Uint8Array.from(atob(data.dataBase64), (c) => c.charCodeAt(0));
    if (bytes.byteLength > 5_000_000) throw new Error("Ukuran file maksimal 5 MB");

    const ext = data.fileName.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${data.code}/${Date.now()}.${ext}`;

    const up = await db.storage
      .from("payment-proofs")
      .upload(path, bytes, { contentType: data.contentType, upsert: false });
    if (up.error) throw new Error(up.error.message);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (db.rpc as any)("order_attach_proof", {
      _code: data.code,
      _token: data.token,
      _path: path,
    });
    if (error) throw new Error(error.message);

    return { ok: true };
  });

export const adminListOrders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const helpers = await import("./orders.server");
    await helpers.assertAdmin(context.supabase, context.userId);

    const { data, error } = await context.supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return (data ?? []).map(({ access_token: _t, ...rest }) => rest);
  });

export const adminSetOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => adminStatusSchema.parse(data))
  .handler(async ({ data, context }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (context.supabase.rpc as any)("admin_set_order_status", {
      _order_id: data.orderId,
      _status: data.status,
      _note: data.note ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminProofUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { orderId: string }) => data)
  .handler(async ({ data, context }) => {
    const helpers = await import("./orders.server");
    await helpers.assertAdmin(context.supabase, context.userId);

    const { data: row } = await context.supabase
      .from("orders")
      .select("proof_path")
      .eq("id", data.orderId)
      .maybeSingle();
    if (!row?.proof_path) return { url: null };

    const signed = await context.supabase.storage
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
