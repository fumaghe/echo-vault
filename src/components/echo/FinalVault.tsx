import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound, Vault } from "lucide-react";
import { FINAL_CODE, VAULT_KEY, challenges } from "@/data/workshop";
import { finalCodeMatches, normalizeFragment } from "@/lib/echo";
import { DecryptText } from "./DecryptText";

export function FinalVault({
  fragments,
  finalSolved,
  onSolved,
  onReveal,
}: {
  fragments: Record<string, string>;
  finalSolved: boolean;
  onSolved: () => void;
  onReveal: () => void;
}) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "ko">("idle");
  const [msg, setMsg] = useState("");

  const submit = () => {
    if (finalCodeMatches(code)) {
      setStatus("ok");
      setMsg("VAULT UNLOCKED");
      onSolved();
    } else {
      const present = normalizeFragment(code);
      const have = challenges
        .filter((c) => fragments[c.id] && present.includes(fragments[c.id]))
        .map((c) => fragments[c.id]);
      setStatus("ko");
      setMsg(
        `ACCESS DENIED — frammenti rilevati: ${
          have.length ? have.join(", ") : "nessuno"
        }. Sequenza incompleta o errata.`,
      );
    }
  };

  return (
    <div className="glass glass-cyan rounded-lg p-6 relative scanlines">
      <div className="flex items-center gap-2 text-[color:var(--color-cyan)] text-xs uppercase tracking-widest">
        <Vault className="size-4" /> FINAL VAULT — ECHO
      </div>
      <h2 className="mt-2 text-2xl font-bold text-white">
        OPERAZIONE ECHO — ACCESSO ALLA CASSAFORTE
      </h2>
      <p className="mt-2 text-sm text-slate-300">
        Avete raccolto tutti i frammenti. Ma Echo non accetta frammenti in ordine casuale. Il
        terminale proverà a ricostruire la sequenza corretta.
      </p>

      {!finalSolved ? (
        <div className="mt-5 space-y-3">
          <label className="block">
            <span className="block text-xs text-slate-400 mb-1">
              Codice completo (es. AA-BB-CC-DDD-EE-FF)
            </span>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder={FINAL_CODE.replace(/[A-Z0-9]/g, "•")}
              className="font-mono uppercase tracking-widest bg-black/40 text-white"
            />
          </label>
          <Button
            onClick={submit}
            className="gap-2 bg-[color:var(--color-neon)] text-black hover:bg-[color:var(--color-neon)]/80"
          >
            <KeyRound className="size-4" /> Apri la cassaforte
          </Button>
          <AnimatePresence>
            {status === "ko" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[color:var(--color-alert)] text-sm font-mono"
              >
                {msg}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-5 space-y-4"
        >
          <div className="rounded-md border border-[color:var(--color-neon)] p-4 bg-[color:var(--color-neon)]/5">
            <div className="text-xs uppercase tracking-widest text-[color:var(--color-neon)]">
              Vault Key
            </div>
            <div className="text-3xl font-mono text-[color:var(--color-neon)] mt-1">
              <DecryptText text={VAULT_KEY} duration={1200} />
            </div>
          </div>
          <Button
            onClick={onReveal}
            className="bg-[color:var(--color-cyan)] text-black hover:bg-[color:var(--color-cyan)]/80"
          >
            Decodifica payload finale
          </Button>
        </motion.div>
      )}
    </div>
  );
}
