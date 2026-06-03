import { motion } from "motion/react";
import { Lock, Unlock, Check } from "lucide-react";
import type { Challenge } from "@/data/workshop";

export type VaultStatus = "LOCKED" | "AVAILABLE" | "SOLVED";

export function VaultCard({
  challenge,
  status,
  fragment,
  onOpen,
  index,
}: {
  challenge: Challenge;
  status: VaultStatus;
  fragment?: string;
  onOpen: () => void;
  index: number;
}) {
  const isLocked = status === "LOCKED";
  const isSolved = status === "SOLVED";
  const accent = isSolved ? "glass-neon" : status === "AVAILABLE" ? "glass-cyan pulse-cyan" : "";
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileHover={!isLocked ? { y: -3 } : undefined}
      onClick={onOpen}
      disabled={isLocked}
      className={`glass ${accent} text-left rounded-lg p-5 relative overflow-hidden scanlines disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs tracking-widest text-[color:var(--color-cyan)]">
          VAULT — {challenge.code} · {String(challenge.order).padStart(2, "0")}
        </span>
        {isSolved ? (
          <Check className="size-4 text-[color:var(--color-neon)]" />
        ) : isLocked ? (
          <Lock className="size-4 text-slate-400" />
        ) : (
          <Unlock className="size-4 text-[color:var(--color-cyan)]" />
        )}
      </div>
      <h3 className="mt-3 text-lg font-semibold text-white leading-tight">{challenge.title}</h3>
      <p className="mt-1 text-xs text-slate-400">{challenge.subtitle}</p>

      <div className="mt-5 flex items-center justify-between text-xs">
        <span
          className={`px-2 py-0.5 rounded border ${
            isSolved
              ? "border-[color:var(--color-neon)] text-[color:var(--color-neon)]"
              : isLocked
                ? "border-slate-600 text-slate-500"
                : "border-[color:var(--color-cyan)] text-[color:var(--color-cyan)]"
          }`}
        >
          {status}
        </span>
        <span className="font-mono">
          {isSolved ? (
            <span className="text-[color:var(--color-neon)]">FRAG :: {fragment}</span>
          ) : (
            <span className="text-slate-500">FRAG :: ░░</span>
          )}
        </span>
      </div>
    </motion.button>
  );
}
