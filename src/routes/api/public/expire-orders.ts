import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/expire-orders")({
  server: {
    handlers: {
      POST: async () => {
        const { serverPublicClient } = await import("@/lib/supabase-public.server");
        const db = serverPublicClient();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (db.rpc as any)("expire_stale_orders", {});
        if (error) {
          return new Response(JSON.stringify({ ok: false, error: error.message }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ ok: true, expired: data ?? 0 }), {
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
