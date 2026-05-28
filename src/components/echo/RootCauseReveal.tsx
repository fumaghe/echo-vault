import { motion } from "motion/react";
import { rootCauseSteps, debrief } from "@/data/workshop";
import { ArrowRight, Sparkles } from "lucide-react";

export function RootCauseReveal() {
  const flow = [
    "BB-042",
    "BB042",
    "lookup failed",
    "route_owner null",
    "fallback edge-03",
    "503 errors",
  ];
  return (
    <div className="space-y-5">
      <div className="glass glass-neon rounded-lg p-5">
        <div className="text-xs uppercase tracking-widest text-[color:var(--color-neon)] flex items-center gap-2">
          <Sparkles className="size-3" /> Root Cause — Operazione Echo
        </div>
        <ol className="mt-3 space-y-2">
          {rootCauseSteps.map((s, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 * i }}
              className="text-sm text-slate-100 flex gap-3"
            >
              <span className="font-mono text-[color:var(--color-cyan)] w-6 shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{s}</span>
            </motion.li>
          ))}
        </ol>
      </div>

      <div className="glass rounded-lg p-5">
        <div className="text-xs uppercase tracking-widest text-[color:var(--color-cyan)] mb-3">
          Flow di propagazione
        </div>
        <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
          {flow.map((step, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.4 }}
              className="px-3 py-1.5 rounded border border-[color:var(--color-cyan)] text-[color:var(--color-cyan)] bg-[color:var(--color-cyan)]/5"
            >
              {step}
              {i < flow.length - 1 && <ArrowRight className="size-3 inline ml-2 text-slate-400" />}
            </motion.span>
          ))}
        </div>
      </div>

      <div className="glass glass-cyan rounded-lg p-5">
        <div className="text-xs uppercase tracking-widest text-[color:var(--color-cyan)] mb-3">
          Debrief finale
        </div>
        <div className="space-y-2 text-slate-200">
          {debrief.map((d, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 * i + 0.6 }}
              className="text-base"
            >
              {d}
            </motion.p>
          ))}
        </div>
      </div>
    </div>
  );
}
