// SPA entry point for GitHub Pages static build (vite.config.static.ts).
// This file is NOT used by the TanStack Start / Cloudflare Workers build —
// that build uses src/server.ts as its entry.
import "./styles.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";

const router = getRouter();

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element #root not found");

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
