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
import { flags } from "./lib/flags";
import { echoStage } from "./lib/stages";

initGlobalErrorHandlers();
echoStage("main-init");

// ?minimal=1 — bypass React entirely and render a static "ECHO OK" indicator.
// This proves the HTML/CSS shell and JS bundle load correctly without executing
// any component code. If this works but the normal app freezes, the freeze is
// inside the React component tree.
if (flags.minimal) {
  document.body.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
      min-height:100vh;background:#0d0f18;color:#00e5ff;font-family:monospace;gap:1rem;padding:2rem">
      <div style="font-size:2rem;font-weight:bold;letter-spacing:.2em">ECHO OK</div>
      <div style="font-size:.75rem;color:#64748b">?minimal=1 — React bypassed, HTML/CSS only</div>
      <div style="font-size:.7rem;color:#475569;text-align:center;line-height:1.8">
        HTML, CSS and JS bundle load correctly.<br>
        Remove ?minimal=1 to load the full app.<br>
        Add ?debugPerf=1 for live render checkpoints.<br>
        Add ?noMotion=1 to disable motion/react.<br>
        Add ?fastIntro=1 to skip the typewriter intro.
      </div>
    </div>`;
} else {
  // Inject the DOM stage tracker div.
  // Visible when ?debugPerf=1; hidden (display:none) otherwise so it does not
  // affect layout. The div is written to directly (not via React) so the last
  // checkpoint survives even if the main thread is blocked before React can flush.
  const stageDiv = document.createElement("div");
  stageDiv.id = "echo-boot-stage";
  Object.assign(stageDiv.style, {
    position: "fixed",
    top: "0",
    left: "0",
    right: "0",
    zIndex: "10000",
    pointerEvents: "none",
    fontFamily: "monospace",
    fontSize: "11px",
    padding: "2px 8px",
    whiteSpace: "pre",
    background: "rgba(0,0,0,.9)",
    color: "#0ff",
    display: flags.debugPerf ? "block" : "none",
  });
  document.body.appendChild(stageDiv);
  echoStage("dom-ready");

  const effectsEnabled = flags.effects;
  document.documentElement.classList.toggle("safe-render", !effectsEnabled);
  echoStage("safe-render-set");

  const router = getRouter();
  echoStage("router-ready");

  const rootElement = document.getElementById("root");
  if (!rootElement) throw new Error("Root element #root not found");

  echoStage("react-mount");
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
}
