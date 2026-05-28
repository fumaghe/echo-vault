import { useEffect, useState } from "react";
import { getDebugEvents, subscribeDebug, type DebugEvent } from "@/lib/debug";

const COLOR: Record<DebugEvent["kind"], string> = {
  error: "text-red-400",
  rejection: "text-orange-400",
  auth: "text-cyan-400",
  nav: "text-yellow-400",
  info: "text-slate-400",
};

export function DebugPanel() {
  const [visible, setVisible] = useState(false);
  const [events, setEvents] = useState<DebugEvent[]>(() => getDebugEvents());

  useEffect(() => {
    if (typeof window === "undefined") return;
    const active = new URLSearchParams(window.location.search).get("debug") === "1";
    setVisible(active);
    if (!active) return;
    const unsub = subscribeDebug(setEvents);
    return unsub;
  }, []);

  if (!visible) return null;

  const base = import.meta.env.BASE_URL ?? "/";

  return (
    <div
      style={{ zIndex: 9999 }}
      className="fixed bottom-0 left-0 right-0 max-h-48 overflow-y-auto bg-black/90 border-t border-cyan-800 font-mono text-xs p-2 space-y-0.5"
    >
      <div className="text-cyan-500 font-bold flex items-center justify-between sticky top-0 bg-black/90 py-0.5">
        <span>
          ECHO DEBUG — base: {base} — route:{" "}
          {typeof window !== "undefined" ? window.location.pathname : "?"}
        </span>
        <a
          href={typeof window !== "undefined" ? window.location.pathname : "/"}
          className="text-slate-500 hover:text-slate-300"
        >
          [close]
        </a>
      </div>
      {events.length === 0 ? (
        <div className="text-slate-600">No events yet.</div>
      ) : (
        events.map((ev, i) => (
          <div key={i} className={COLOR[ev.kind]}>
            [{new Date(ev.t).toISOString().slice(11, 23)}] {ev.kind.toUpperCase()} {ev.msg}
          </div>
        ))
      )}
    </div>
  );
}
