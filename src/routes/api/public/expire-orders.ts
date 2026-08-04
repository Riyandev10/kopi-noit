import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/expire-orders")({
  server: {
    handlers: {
      POST: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const helpers = await import("@/lib/orders.server");

        const { data: rows } = await supabaseAdmin
          .from("orders")
          .select("id, status, expires_at")
          .eq("status", "pending_payment")
          .lt("expires_at", new Date().toISOString())
          .limit(100);

        let expired = 0;
        for (const row of rows ?? []) {
          await helpers.expireIfNeeded(row);
          expired += 1;
        }

        return new Response(JSON.stringify({ ok: true, expired }), {
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
