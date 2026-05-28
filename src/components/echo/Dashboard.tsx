import { motion } from "motion/react";
import { Vault } from "lucide-react";
import { challenges } from "@/data/workshop";
import { VaultCard, type VaultStatus } from "./VaultCard";
import { FragmentChain } from "./FragmentChain";
import type { Progress } from "@/hooks/useProgress";

export function Dashboard({
  progress,
  isUnlocked,
  onOpen,
  onOpenFinal,
}: {
  progress: Progress;
  isUnlocked: (id: string) => boolean;
  onOpen: (id: string) => void;
  onOpenFinal: () => void;
}) {
  const finalReady = progress.finalUnlocked;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          OPERAZIONE ECHO — <span className="text-[color:var(--color-cyan)]">INCIDENT VAULT</span>
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-2xl">
          6 casseforti. 6 prove. Ogni frammento sblocca la successiva. Solo ricostruendo l'intera
          catena potrete aprire la Final Vault.
        </p>
      </div>

      <FragmentChain fragments={progress.fragments} />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {challenges.map((c, i) => {
          const solved = !!progress.solved[c.id];
          const unlocked = isUnlocked(c.id);
          const status: VaultStatus = solved ? "SOLVED" : unlocked ? "AVAILABLE" : "LOCKED";
          return (
            <VaultCard
              key={c.id}
              challenge={c}
              status={status}
              fragment={progress.fragments[c.id]}
              index={i}
              onOpen={() => unlocked && onOpen(c.id)}
            />
          );
        })}
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        disabled={!finalReady}
        onClick={onOpenFinal}
        className={`w-full glass rounded-lg p-6 text-left relative scanlines transition ${
          finalReady ? "glass-neon hover:translate-y-[-2px]" : "opacity-60 cursor-not-allowed"
        }`}
      >
        <div className="flex items-center gap-3">
          <Vault
            className={`size-6 ${finalReady ? "text-[color:var(--color-neon)]" : "text-slate-500"}`}
          />
          <div>
            <div className="text-xs uppercase tracking-widest text-[color:var(--color-cyan)]">
              Final Vault
            </div>
            <div className="text-xl font-bold text-white">
              {finalReady
                ? "Pronto per la ricomposizione del codice"
                : "Bloccato — completa tutte le 6 prove"}
            </div>
          </div>
        </div>
      </motion.button>
    </motion.div>
  );
}
