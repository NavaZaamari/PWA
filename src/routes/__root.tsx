import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CatWithBook } from "@/components/brand/doodles";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { registerServiceWorker } from "@/components/pwa/register-sw";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { fa } from "@/i18n/fa";

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="max-w-md text-center">
        <CatWithBook className="mx-auto h-32 w-auto animate-float" />
        <h1 className="mt-4 text-2xl font-extrabold">{fa.common.notFound}</h1>
        <p className="mt-2 text-sm text-olive-dark">{fa.common.notFoundBody}</p>
        <Button asChild className="mt-6">
          <Link to="/">{fa.common.goHome}</Link>
        </Button>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="max-w-md text-center">
        <CatWithBook className="mx-auto h-28 w-auto" />
        <h1 className="mt-4 text-xl font-bold">{fa.common.errorTitle}</h1>
        <p className="mt-2 text-sm text-olive-dark">{fa.common.errorBody}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button
            onClick={() => {
              router.invalidate();
              reset();
            }}
          >
            {fa.common.retry}
          </Button>
          <Button asChild variant="secondary">
            <a href="/">{fa.common.goHome}</a>
          </Button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "یوئین | Yoin" },
      { name: "description", content: fa.app.description },
      { name: "author", content: "Yoin" },
      { property: "og:title", content: "یوئین | Yoin" },
      { property: "og:description", content: fa.app.description },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "fa_IR" },
      { name: "twitter:card", content: "summary" },
      { name: "theme-color", content: "#3F4524" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Yoin" },
      { name: "application-name", content: "Yoin" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
      { rel: "icon", href: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
      { rel: "apple-touch-icon", href: "/icons/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  pendingComponent: LoadingScreen,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    void registerServiceWorker();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <InstallPrompt />
      <Toaster position="top-center" dir="rtl" />
    </QueryClientProvider>
  );
}
