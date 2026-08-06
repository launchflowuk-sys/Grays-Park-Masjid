import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH;

if (!basePath) {
  throw new Error(
    "BASE_PATH environment variable is required but was not provided.",
  );
}

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png", "favicon.svg", "opengraph.jpg"],
      manifest: {
        name: "Grays Park Masjid",
        short_name: "GP Masjid",
        description:
          "Prayer times, events and community information for Grays Park Masjid, Grays, Essex.",
        theme_color: "#1B3D2F",
        background_color: "#FFFFFF",
        display: "standalone",
        icons: [
          {
            src: "pwa-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "pwa-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        // SPA navigations fall back to index.html, but API calls never should.
        navigateFallbackDenylist: [/^\/api\//],
        // The main JS bundle can exceed workbox's 2MiB default, which would
        // silently skip it from the precache and break offline support.
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        // Routes are matched in order: first match wins.
        runtimeCaching: [
          {
            // Never cache admin or auth responses.
            urlPattern: /\/api\/(?:admin|auth)(?:\/|$)/,
            handler: "NetworkOnly",
          },
          {
            // Today's prayer timetable stays available offline.
            urlPattern: /\/api\/prayer-times/,
            handler: "NetworkFirst",
            options: {
              cacheName: "prayer-times",
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 32,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            // Other public GET API data: serve cached, refresh in background.
            urlPattern: /\/api\//,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "api-public",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            // Hashed build assets are immutable.
            urlPattern: /\/assets\//,
            handler: "CacheFirst",
            options: {
              cacheName: "static-assets",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
      },
    }),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-runtime-error-modal").then((m) =>
            m.default(),
          ),
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
