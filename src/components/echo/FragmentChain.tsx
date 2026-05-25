import { motion } from "motion/react";
import { challenges } from "@/data/workshop";

export function FragmentChain({
  fragments,
}: {
  fragments: Record<string, string>;
}) {
  return (
    <div className="glass rounded-md p-4">
      <div className="text-xs uppercase tracking-widest text-[color:var(--color-cyan)] mb-3">
        Fragment Chain
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {challenges.map((c, i) => {
          const got = fragments[c.id];
          return (
            <div key={c.id} className="flex items-center gap-2">
              <motion.div
                initial={false}
                animate={{ scale: got ? 1 : 0.98 }}
                className={`px-3 py-1.5 rounded font-mono text-sm border ${
                  got
                    ? "border-[color:var(--color-neon)] text-[color:var(--color-neon)] bg-[color:var(--color-neon)]/5"
                    : "border-slate-700 text-slate-500"
                }`}
              >
                {got ?? "░░"}
              </motion.div>
              {i < challenges.length - 1 && (
                <span className="text-slate-600">─</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
