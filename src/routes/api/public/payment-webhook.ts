import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

const payloadSchema = z
  .object({
    /** Transfer bank: cocokkan lewat nomor VA */
    va_number: z.string().min(6).max(40).optional(),
    /** QRIS: cocokkan lewat kode pesanan (NOIT-XXXXXX) */
    order_code: z.string().min(4).max(30).optional(),
    amount: z.number().int().min(1),
    reference: z.string().max(80).optional(),
    event: z.string().max(40).optional(),
  })
  .refine((v) => !!v.va_number || !!v.order_code, {
    message: "va_number atau order_code wajib diisi",
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

        const { serverPublicClient } = await import("@/lib/supabase-public.server");
        const db = serverPublicClient();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (db.rpc as any)("order_mark_paid", {
          _secret: secret,
          _va: parsed.va_number ?? null,
          _code: parsed.order_code ?? null,
          _amount: parsed.amount,
          _reference: parsed.reference ?? null,
        });
        if (error) return json({ error: error.message }, 400);

        const result = (data ?? {}) as { ok?: boolean; error?: string };
        if (!result.ok) return json({ error: result.error ?? "Gagal memproses" }, 409);

        return json({ ok: true });
      },
    },
  },
});
