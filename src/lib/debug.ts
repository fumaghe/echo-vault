const MAX_EVENTS = 40;

export type DebugEvent = {
  t: number;
  kind: "error" | "rejection" | "auth" | "nav" | "info";
  msg: string;
};

const events: DebugEvent[] = [];
let listeners: Array<(events: DebugEvent[]) => void> = [];

function isDebugMode(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("debug") === "1";
}

function push(event: DebugEvent) {
  events.unshift(event);
  if (events.length > MAX_EVENTS) events.length = MAX_EVENTS;
  listeners.forEach((fn) => fn([...events]));
}

export const debugLog = {
  info: (msg: string) => push({ t: Date.now(), kind: "info", msg }),
  auth: (msg: string) => push({ t: Date.now(), kind: "auth", msg }),
  nav: (msg: string) => push({ t: Date.now(), kind: "nav", msg }),
  error: (msg: string) => push({ t: Date.now(), kind: "error", msg }),
};

export function getDebugEvents(): DebugEvent[] {
  return [...events];
}

export function subscribeDebug(fn: (events: DebugEvent[]) => void) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

export function initGlobalErrorHandlers() {
  if (typeof window === "undefined") return;

  window.onerror = (msg, src, line, col, err) => {
    const text = err?.message ?? String(msg);
    push({ t: Date.now(), kind: "error", msg: `[onerror] ${text} (${src}:${line}:${col})` });
    if (isDebugMode()) console.error("[echo-debug onerror]", err ?? msg);
  };

  window.onunhandledrejection = (ev) => {
    const reason = ev.reason instanceof Error ? ev.reason.message : String(ev.reason);
    push({ t: Date.now(), kind: "rejection", msg: `[unhandledrejection] ${reason}` });
    if (isDebugMode()) console.error("[echo-debug rejection]", ev.reason);
  };
}
