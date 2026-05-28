// Lightweight DOM-based render-stage tracker.
// Writes directly to the DOM (#echo-boot-stage) so it survives main-thread
// hangs where React state updates would never flush to the screen.
// Visible when ?debugPerf=1 injects the div; otherwise the calls are no-ops.
declare global {
  interface Window {
    __echoStage?: string;
  }
}

export function echoStage(label: string): void {
  if (typeof window === "undefined") return;
  window.__echoStage = label;
  const el = document.getElementById("echo-boot-stage");
  if (el) {
    const ms = performance.now().toFixed(0);
    el.textContent = `+${ms}ms  ${label}`;
  }
  try {
    performance.mark(`echo:${label}`);
  } catch {
    // noop — performance.mark unavailable in some environments
  }
}
