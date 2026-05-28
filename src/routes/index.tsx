import { useCallback, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Terminal } from "lucide-react";

import { useProgress } from "@/hooks/useProgress";
import { challengeById } from "@/lib/echo";
import { HeaderNoc } from "@/components/echo/HeaderNoc";
import { Dashboard } from "@/components/echo/Dashboard";
import { VaultDetail } from "@/components/echo/VaultDetail";
import { FinalVault } from "@/components/echo/FinalVault";
import { RootCauseReveal } from "@/components/echo/RootCauseReveal";
import { FacilitatorMode } from "@/components/echo/FacilitatorMode";
import { TerminalPanel } from "@/components/echo/TerminalPanel";

export const Route = createFileRoute("/")({
  component: EchoApp,
});

type View =
  | { kind: "intro" }
  | { kind: "dashboard" }
  | { kind: "vault"; id: string }
  | { kind: "final" }
  | { kind: "reveal" };

function EchoApp() {
  const [view, setView] = useState<View>({ kind: "intro" });
  const p = useProgress();

  if (!p.ready) return null;

  return (
    <div className="min-h-screen px-4 sm:px-6 py-6 max-w-6xl mx-auto">
      <AnimatePresence mode="wait">
        {view.kind === "intro" && (
          <IntroScreen key="intro" onEnter={() => setView({ kind: "dashboard" })} />
        )}

        {view.kind !== "intro" && (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <HeaderNoc fragments={p.fragmentsCount} total={p.total} />

            {view.kind === "dashboard" && (
              <Dashboard
                progress={p.progress}
                isUnlocked={p.isUnlocked}
                onOpen={(id) => setView({ kind: "vault", id })}
                onOpenFinal={() => setView({ kind: "final" })}
              />
            )}

            {view.kind === "vault" &&
              (() => {
                const c = challengeById(view.id);
                if (!c) return null;
                return (
                  <VaultDetail
                    challenge={c}
                    alreadySolved={!!p.progress.solved[c.id]}
                    onBack={() => setView({ kind: "dashboard" })}
                    onSolved={(frag) => {
                      p.markSolved(c.id, frag);
                    }}
                  />
                );
              })()}

            {view.kind === "final" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <Button
                  variant="ghost"
                  onClick={() => setView({ kind: "dashboard" })}
                  className="text-[color:var(--color-cyan)]"
                >
                  ← Dashboard
                </Button>
                <FinalVault
                  fragments={p.progress.fragments}
                  finalSolved={p.progress.finalSolved}
                  onSolved={() => p.setFinalSolved(true)}
                  onReveal={() => setView({ kind: "reveal" })}
                />
              </motion.div>
            )}

            {view.kind === "reveal" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <Button
                  variant="ghost"
                  onClick={() => setView({ kind: "dashboard" })}
                  className="text-[color:var(--color-cyan)]"
                >
                  ← Dashboard
                </Button>
                <RootCauseReveal />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <FacilitatorMode
        progress={p.progress}
        onReset={p.reset}
        onUnlockAll={p.unlockAll}
      />
    </div>
  );
}

const INTRO_LINES = [
  “> sshing into noc-01.echo.internal …”,
  “> handshake OK — TLS pinned”,
  “> mounting /vault/operazione-echo”,
  “> 6 incident vaults detected — chain validated”,
  “> awaiting analyst authentication …”,
  “”,
  “BENVENUTO ANALYST. Il tuo compito: ricostruire la root cause.”,
  “Ogni cassaforte rilascia un frammento. La sequenza apre la Final Vault.”,
];

function IntroScreen({ onEnter }: { onEnter: () => void }) {
  const [done, setDone] = useState(false);
  const handleDone = useCallback(() => setDone(true), []);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className=”min-h-[80vh] flex items-center justify-center”
    >
      <div className=”glass glass-cyan rounded-lg p-6 sm:p-10 w-full max-w-2xl relative scanlines”>
        <div className=”flex items-center gap-2 text-xs uppercase tracking-widest text-[color:var(--color-cyan)]”>
          <Terminal className=”size-4” /> ECHO :: Access Terminal
        </div>
        <h1 className=”mt-3 text-3xl sm:text-5xl font-black tracking-[0.18em] text-white glitch”>
          ECHO NOC
        </h1>
        <p className=”text-sm text-slate-300 mt-1”>
          Incident Vault — sessione operativa “Operazione Echo”
        </p>

        <div className=”mt-6 rounded-md bg-black/40 border border-[color:var(--color-border)] p-4 min-h-[200px]”>
          <TerminalPanel
            lines={INTRO_LINES}
            onDone={handleDone}
          />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: done ? 1 : 0.3 }}
          className="mt-6 flex flex-wrap gap-3"
        >
          <Button
            onClick={onEnter}
            disabled={!done}
            className="bg-[color:var(--color-cyan)] text-black hover:bg-[color:var(--color-cyan)]/80"
          >
            Avvia sessione →
          </Button>
          <Button
            onClick={onEnter}
            variant="ghost"
            className="text-slate-300"
          >
            Skip intro
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
