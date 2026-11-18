// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// Never set ssr.external or resolve.external: the Worker has no runtime module resolution, so
// the build fails. Never add compression (compressPublicAssets, vite-plugin-compression):
// hosting already compresses at the edge.
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  plugins: [
    // Service worker for the installable app. Registration lives only in
    // src/components/pwa/register-sw.ts (never in dev or the Lovable preview).
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: null,
      manifest: false, // hand-written public/manifest.webmanifest
      filename: "sw.js",
      devOptions: { enabled: false },
      includeAssets: ["offline.html", "favicon.ico", "icons/*.png", "manifest.webmanifest"],
      workbox: {
        navigateFallback: null,
        globPatterns: ["**/*.{js,css,woff2,png,svg,ico,webmanifest,html}"],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // Pages: always try the network first; fall back to the last copy, then the offline page.
            urlPattern: ({ request, url }) =>
              request.mode === "navigate" && !url.pathname.startsWith("/~oauth"),
            handler: "NetworkFirst",
            options: {
              cacheName: "yoin-pages",
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 40 },
              precacheFallback: { fallbackURL: "/offline.html" },
            },
          },
          {
            // Hashed build assets are immutable.
            urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith("/assets/"),
            handler: "CacheFirst",
            options: {
              cacheName: "yoin-assets",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith("/icons/"),
            handler: "StaleWhileRevalidate",
            options: { cacheName: "yoin-icons" },
          },
        ],
      },
    }),
  ],
});
