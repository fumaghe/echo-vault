// Vite config for the GitHub Pages static SPA build.
// Run with: bun run build:pages  (or npm run build:pages)
//
// This config bypasses TanStack Start SSR / Cloudflare Workers entirely and
// builds a plain client-side React app that can be served from any static host.
// Output goes to dist-pages/ — the GitHub Actions workflow uploads that folder.
//
// Do NOT add @lovable.dev/vite-tanstack-config or @cloudflare/vite-plugin here;
// they're only for the SSR/Cloudflare build (vite.config.ts).

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [
    // Regenerates routeTree.gen.ts if it's stale — safe even when already committed.
    TanStackRouterVite({ autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],

  // Must match the GitHub Pages sub-path: https://<user>.github.io/echo-vault/
  base: "/echo-vault/",

  build: {
    outDir: "dist-pages",
    emptyOutDir: true,
  },
});
