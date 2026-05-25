import { motion } from "motion/react";
import { Wifi } from "lucide-react";

export function HeaderNoc({ fragments, total }: { fragments: number; total: number }) {
  const pct = Math.round((fragments / total) * 100);
  return (
    <header className="glass rounded-md p-4 flex flex-wrap items-center gap-4 justify-between relative scanlines">
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="font-mono text-2xl font-black tracking-[0.25em] text-[color:var(--color-cyan)] glitch"
        >
          ECHO
        </motion.div>
        <span className="text-[10px] uppercase tracking-widest text-slate-400">
          Network Operations Center · v1.27
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs font-mono">
        <span className="inline-flex items-center gap-1.5 text-[color:var(--color-neon)]">
          <span className="inline-block size-2 rounded-full bg-[color:var(--color-neon)] shadow-[0_0_10px_var(--color-neon)]" />
          NOC-01 CONNECTED
        </span>
        <Wifi className="size-3 text-[color:var(--color-neon)]" />
      </div>
      <div className="w-full">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-slate-400 mb-1">
          <span>Fragment progress</span>
          <span className="font-mono">
            {fragments}/{total} · {pct}%
          </span>
        </div>
        <div className="h-1.5 rounded bg-white/5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", stiffness: 60, damping: 16 }}
            className="h-full bg-[color:var(--color-cyan)] shadow-[0_0_12px_var(--color-cyan)]"
          />
        </div>
      </div>
    </header>
  );
}
