import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, ShieldAlert, Unlock } from "lucide-react";
import type { Challenge } from "@/data/workshop";
import { fragmentMatches, singleAnswerMatch } from "@/lib/echo";

type Status = "idle" | "checking" | "ok" | "ko";

export function ValidationPanel({
  challenge,
  alreadySolved,
  onSolved,
}: {
  challenge: Challenge;
  alreadySolved: boolean;
  onSolved: (fragment: string) => void;
}) {
  const [answer, setAnswer] = useState("");
  const [fragment, setFragment] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

  const validate = () => {
    if (alreadySolved) return;
    setStatus("checking");
    setMessage("DECRYPTING…");
    setTimeout(() => {
      const ansOk = singleAnswerMatch(answer, challenge.expectedAnswers);
      const fragOk = fragmentMatches(fragment, challenge.expectedFragment);
      if (ansOk && fragOk) {
        setStatus("ok");
        setMessage("FRAGMENT ACCEPTED — " + challenge.successMessage);
        setTimeout(() => onSolved(challenge.expectedFragment), 700);
      } else {
        setStatus("ko");
        const hint = challenge.hints[0] ?? "Riprovare con maggiore attenzione.";
        setMessage(
          `ACCESS DENIED — ${
            !ansOk && !fragOk
              ? "risposta e frammento non corretti."
              : !ansOk
                ? "risposta investigativa non corretta."
                : "frammento non corretto."
          } Hint: ${hint}`,
        );
      }
    }, 500);
  };

  return (
    <div className="glass rounded-md p-4 space-y-3">
      <div className="text-xs uppercase tracking-widest text-[color:var(--color-cyan)]">
        Validation Console
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="block text-xs text-slate-400 mb-1">Risposta investigativa</span>
          <Input
            value={answer}
            disabled={alreadySolved}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="es. service-name, host, ticket…"
            className="font-mono bg-black/30 border-[color:var(--color-border)] text-white"
          />
        </label>
        <label className="block">
          <span className="block text-xs text-slate-400 mb-1">Frammento cassaforte</span>
          <Input
            value={fragment}
            disabled={alreadySolved}
            onChange={(e) => setFragment(e.target.value.toUpperCase())}
            placeholder="2-3 caratteri"
            className="font-mono uppercase bg-black/30 border-[color:var(--color-border)] text-white"
          />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={validate}
          disabled={alreadySolved}
          className="gap-2 bg-[color:var(--color-cyan)] text-black hover:bg-[color:var(--color-cyan)]/80"
        >
          <Unlock className="size-4" />
          {alreadySolved ? "Cassaforte già aperta" : "Valida frammento"}
        </Button>
        {status === "checking" && (
          <span className="text-xs text-[color:var(--color-cyan)] cursor">DECRYPTING</span>
        )}
      </div>

      <AnimatePresence>
        {status === "ok" && (
          <motion.div
            key="ok"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-2 text-[color:var(--color-neon)] text-sm font-mono"
          >
            <ShieldCheck className="size-4 mt-0.5" />
            <span>{message}</span>
          </motion.div>
        )}
        {status === "ko" && (
          <motion.div
            key="ko"
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: [0, -4, 4, -2, 2, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-start gap-2 text-[color:var(--color-alert)] text-sm font-mono"
          >
            <ShieldAlert className="size-4 mt-0.5" />
            <span>{message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {alreadySolved && (
        <div className="text-xs text-[color:var(--color-neon)] font-mono">
          ✓ Cassaforte sbloccata. Procedi al prossimo vault dalla dashboard.
        </div>
      )}
    </div>
  );
}
