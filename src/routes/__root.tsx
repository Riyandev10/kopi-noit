import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { I18nProvider } from "@/lib/i18n";
import { CartProvider } from "@/lib/cart";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-gradient-gold">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Halaman tidak ditemukan</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Sepertinya halaman ini sudah pindah seperti gerobak kami.
        </p>
        <Link to="/" className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Ada yang salah saat menuang kopi.</h1>
        <p className="mt-2 text-sm text-muted-foreground">Coba muat ulang halaman.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Coba lagi
          </button>
          <a href="/" className="rounded-md border border-border px-4 py-2 text-sm">Beranda</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Kopi Noit Cirebon" },
      { name: "description", content: "Kopi Noit — kopi premium dari Cirebon. Diseduh segar saat pesanan masuk. Stuck? Noit dulu." },
      { property: "og:title", content: "Kopi Noit Cirebon" },
      { property: "og:description", content: "Kopi Noit — kopi premium dari Cirebon. Diseduh segar saat pesanan masuk. Stuck? Noit dulu." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "Kopi Noit Cirebon" },
      { name: "twitter:description", content: "Kopi Noit — kopi premium dari Cirebon. Diseduh segar saat pesanan masuk. Stuck? Noit dulu." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/22d0a432-a41b-4ab2-a7bf-279c42f8d7db/id-preview-7c45fd12--8da9ec1e-ce28-4957-8d32-ee82232764fa.lovable.app-1779703386883.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/22d0a432-a41b-4ab2-a7bf-279c42f8d7db/id-preview-7c45fd12--8da9ec1e-ce28-4957-8d32-ee82232764fa.lovable.app-1779703386883.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col bg-grain">
            <Header />
            <main className="flex-1"><Outlet /></main>
            <Footer />
          </div>
        </CartProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}
