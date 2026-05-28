// SPA entry point for GitHub Pages static build (vite.config.static.ts).
// This file is NOT used by the TanStack Start / Cloudflare Workers build —
// that build uses src/server.ts as its entry.
import "./styles.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { MotionConfig } from "motion/react";
import { getRouter } from "./router";
import { ErrorBoundary } from "./components/echo/ErrorBoundary";
import { DebugPanel } from "./components/echo/DebugPanel";
import { initGlobalErrorHandlers } from "./lib/debug";

initGlobalErrorHandlers();

const effectsEnabled =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).get("effects") === "1";

document.documentElement.classList.toggle("safe-render", !effectsEnabled);

const router = getRouter();

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element #root not found");

createRoot(rootElement).render(
  <StrictMode>
    <MotionConfig reducedMotion={effectsEnabled ? "never" : "always"}>
      <ErrorBoundary>
        <RouterProvider router={router} />
        <DebugPanel />
      </ErrorBoundary>
    </MotionConfig>
  </StrictMode>,
);
