import { useCallback, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Terminal } from "lucide-react";

import { useProgress } from "@/hooks/useProgress";
import { challengeById } from "@/lib/echo";
import { flags } from "@/lib/flags";
import { echoStage } from "@/lib/stages";
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
  echoStage("EchoApp-render");
  const [view, setView] = useState<View>({ kind: "intro" });
  const p = useProgress();

  if (!p.ready) return null;

  echoStage(`EchoApp-view-${view.kind}`);

  const enterDashboard = () => setView({ kind: "dashboard" });

  // ?noVault=1 — prevent VaultDetail from opening (isolates vault rendering)
  const openVault = flags.noVault ? () => {} : (id: string) => setView({ kind: "vault", id });

  const appContent = (
    <div className="space-y-6">
      {!flags.noHeader && <HeaderNoc fragments={p.fragmentsCount} total={p.total} />}

      {view.kind === "dashboard" &&
        (flags.noDashboard ? (
          // ?noDashboard=1 — render only bare navigation, no Dashboard components
          <MinimalDashboard onOpenFinal={() => setView({ kind: "final" })} />
        ) : (
          <Dashboard
            progress={p.progress}
            isUnlocked={p.isUnlocked}
            onOpen={openVault}
            onOpenFinal={() => setView({ kind: "final" })}
          />
        ))}

      {view.kind === "vault" &&
        (() => {
          const c = challengeById(view.id);
          if (!c) return null;
          echoStage(`VaultDetail-${c.id}`);
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
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
    </div>
  );

  const introEl = <IntroScreen key="intro" onEnter={enterDashboard} />;

  // ?noMotion=1 — remove AnimatePresence and motion wrappers from the top-level
  // transition entirely (isolates whether the motion engine is the freeze cause).
  if (flags.noMotion) {
    return (
      <div className="min-h-screen px-4 sm:px-6 py-6 max-w-6xl mx-auto">
        {view.kind === "intro" ? introEl : appContent}
        <FacilitatorMode progress={p.progress} onReset={p.reset} onUnlockAll={p.unlockAll} />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 py-6 max-w-6xl mx-auto">
      {/*
       * PRIMARY FIX: removed mode="wait" from AnimatePresence.
       *
       * Root cause: with MotionConfig reducedMotion="always", motion v12 skips
       * exit animations (runs them at 0 duration or omits the animation entirely).
       * When mode="wait" is set, AnimatePresence waits for the exiting element's
       * onAnimationComplete before mounting the entering element. If the 0-duration
       * exit animation does not reliably fire onAnimationComplete (a known edge-case
       * in motion v12 + React 19 concurrent mode), AnimatePresence never unmounts
       * IntroScreen and never mounts the dashboard — while motion's internal RAF
       * polling loop keeps the main thread pinned ("La pagina non risponde").
       *
       * Without mode (default "sync"), exit and enter run simultaneously.
       * With reducedMotion, both are instant — no waiting, no deadlock.
       */}
      <AnimatePresence>
        {view.kind === "intro" && introEl}

        {view.kind !== "intro" && (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {appContent}
          </motion.div>
        )}
      </AnimatePresence>

      <FacilitatorMode progress={p.progress} onReset={p.reset} onUnlockAll={p.unlockAll} />
    </div>
  );
}

// ?noDashboard=1 — bare navigation for isolating Dashboard rendering
function MinimalDashboard({ onOpenFinal }: { onOpenFinal: () => void }) {
  return (
    <div className="glass rounded-md p-6 space-y-4 font-mono">
      <div className="text-xs uppercase tracking-widest text-[color:var(--color-cyan)]">
        ?noDashboard=1 — minimal navigation active
      </div>
      <p className="text-sm text-slate-300">
        Dashboard, VaultCard and FragmentChain components are disabled. Use this mode to verify that
        the freeze does not occur without them.
      </p>
      <Button onClick={onOpenFinal} className="bg-[color:var(--color-cyan)] text-black">
        Open Final Vault
      </Button>
    </div>
  );
}

const INTRO_LINES = [
  "> sshing into noc-01.echo.internal …",
  "> handshake OK — TLS pinned",
  "> mounting /vault/operazione-echo",
  "> 6 incident vaults detected — chain validated",
  "> awaiting analyst authentication …",
  "",
  "BENVENUTO ANALYST. Il tuo compito: ricostruire la root cause.",
  "Ogni cassaforte rilascia un frammento. La sequenza apre la Final Vault.",
];

function IntroScreen({ onEnter }: { onEnter: () => void }) {
  echoStage("IntroScreen-render");
  const [done, setDone] = useState(false);
  const handleDone = useCallback(() => setDone(true), []);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[80vh] flex items-center justify-center"
    >
      <div className="glass glass-cyan rounded-lg p-6 sm:p-10 w-full max-w-2xl relative scanlines">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[color:var(--color-cyan)]">
          <Terminal className="size-4" /> ECHO :: Access Terminal
        </div>
        <h1 className="mt-3 text-3xl sm:text-5xl font-black tracking-[0.18em] text-white glitch">
          ECHO NOC
        </h1>
        <p className="text-sm text-slate-300 mt-1">
          Incident Vault — sessione operativa "Operazione Echo"
        </p>

        <div className="mt-6 rounded-md bg-black/40 border border-[color:var(--color-border)] p-4 min-h-[200px]">
          <TerminalPanel lines={INTRO_LINES} onDone={handleDone} instant={flags.fastIntro} />
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
          <Button onClick={onEnter} variant="ghost" className="text-slate-300">
            Skip intro
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
