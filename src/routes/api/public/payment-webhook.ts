import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

const payloadSchema = z.object({
  va_number: z.string().min(6).max(40),
  amount: z.number().int().min(1),
  reference: z.string().max(80).optional(),
  event: z.string().max(40).optional(),
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export const Route = createFileRoute("/api/public/payment-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["PAYMENT_WEBHOOK_SECRET"];
        if (!secret) return json({ error: "Webhook belum dikonfigurasi" }, 503);

        const raw = await request.text();
        const signature = request.headers.get("x-webhook-signature") ?? "";
        const expected = createHmac("sha256", secret).update(raw).digest("hex");
        const sig = Buffer.from(signature);
        const exp = Buffer.from(expected);
        if (sig.length !== exp.length || !timingSafeEqual(sig, exp)) {
          return json({ error: "Tanda tangan tidak valid" }, 401);
        }

        let parsed;
        try {
          parsed = payloadSchema.parse(JSON.parse(raw));
        } catch {
          return json({ error: "Payload tidak valid" }, 400);
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const helpers = await import("@/lib/orders.server");

        const { data: order } = await supabaseAdmin
          .from("orders")
          .select("id, status, pay_total, expires_at")
          .eq("va_number", parsed.va_number)
          .in("status", ["pending_payment", "awaiting_confirmation"])
          .order("created_at", { ascending: false })
          .maybeSingle();

        if (!order) return json({ error: "Pesanan tidak ditemukan" }, 404);
        if (order.pay_total !== parsed.amount) {
          return json({ error: "Jumlah pembayaran tidak sesuai" }, 409);
        }

        await helpers.setStatus(order.id, "paid", {
          note: `Pembayaran terverifikasi otomatis${parsed.reference ? ` · ref ${parsed.reference}` : ""}`,
          event: "payment_webhook",
        });

        return json({ ok: true });
      },
    },
  },
});
