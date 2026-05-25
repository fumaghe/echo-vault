import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings2, RefreshCw, Unlock, Lock } from "lucide-react";
import {
  challenges,
  FACILITATOR_CODE,
  FINAL_CODE,
  VAULT_KEY,
} from "@/data/workshop";
import { QueryBlock, AIPromptBlock } from "./QueryBlock";
import type { Progress } from "@/hooks/useProgress";

export function FacilitatorMode({
  progress,
  onReset,
  onUnlockAll,
}: {
  progress: Progress;
  onReset: () => void;
  onUnlockAll: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [auth, setAuth] = useState(false);
  const [code, setCode] = useState("");
  const [err, setErr] = useState(false);

  const submit = () => {
    if (code.trim().toUpperCase() === FACILITATOR_CODE) {
      setAuth(true);
      setErr(false);
    } else {
      setErr(true);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full glass px-3 py-2 text-xs text-slate-400 hover:text-[color:var(--color-cyan)]"
      >
        <Settings2 className="size-3" /> Facilitator Mode
      </button>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setAuth(false); setCode(""); setErr(false); } }}>
        <DialogContent className="max-w-4xl bg-[oklch(0.13_0.04_260)] border-[color:var(--color-cyan)] text-white">
          <DialogHeader>
            <DialogTitle className="font-mono text-[color:var(--color-cyan)]">
              FACILITATOR MODE
            </DialogTitle>
          </DialogHeader>

          {!auth ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-300">
                Inserire codice facilitatore per visualizzare soluzioni e
                strumenti di gestione workshop.
              </p>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="ECHO-_____"
                className="font-mono uppercase bg-black/40 text-white"
              />
              <Button onClick={submit} className="bg-[color:var(--color-cyan)] text-black">
                Sblocca
              </Button>
              <AnimatePresence>
                {err && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[color:var(--color-alert)] text-sm font-mono"
                  >
                    ACCESS DENIED
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Tabs defaultValue="state">
              <TabsList className="bg-black/40">
                <TabsTrigger value="state">Stato</TabsTrigger>
                <TabsTrigger value="solutions">Soluzioni</TabsTrigger>
                <TabsTrigger value="queries">SPL & Prompt</TabsTrigger>
                <TabsTrigger value="finale">Finale</TabsTrigger>
              </TabsList>

              <TabsContent value="state" className="space-y-3">
                <div className="text-sm text-slate-300">
                  Progresso corrente:
                </div>
                <ul className="text-sm font-mono space-y-1">
                  {challenges.map((c) => (
                    <li key={c.id}>
                      VAULT-{c.code} · {c.title} —{" "}
                      <span
                        className={
                          progress.solved[c.id]
                            ? "text-[color:var(--color-neon)]"
                            : "text-slate-500"
                        }
                      >
                        {progress.solved[c.id]
                          ? `SOLVED (${progress.fragments[c.id]})`
                          : "LOCKED"}
                      </span>
                    </li>
                  ))}
                  <li>
                    FINAL VAULT —{" "}
                    <span
                      className={
                        progress.finalSolved
                          ? "text-[color:var(--color-neon)]"
                          : "text-slate-500"
                      }
                    >
                      {progress.finalSolved ? "OPENED" : "CLOSED"}
                    </span>
                  </li>
                </ul>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button onClick={onReset} variant="outline" className="gap-2">
                    <RefreshCw className="size-3" /> Reset progresso
                  </Button>
                  <Button onClick={onUnlockAll} className="gap-2 bg-[color:var(--color-neon)] text-black">
                    <Unlock className="size-3" /> Sblocca tutto
                  </Button>
                  <Button onClick={onReset} variant="destructive" className="gap-2">
                    <Lock className="size-3" /> Blocca tutto
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="solutions" className="space-y-2">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm font-mono">
                    <thead className="text-[color:var(--color-cyan)] text-left">
                      <tr>
                        <th className="py-1 pr-3">Vault</th>
                        <th className="py-1 pr-3">Risposta</th>
                        <th className="py-1 pr-3">Frammento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {challenges.map((c) => (
                        <tr key={c.id} className="border-t border-white/10">
                          <td className="py-1 pr-3">{c.code} — {c.title}</td>
                          <td className="py-1 pr-3 text-[color:var(--color-neon)]">
                            {c.expectedAnswers.join(" / ")}
                          </td>
                          <td className="py-1 pr-3 text-[color:var(--color-cyan)]">
                            {c.expectedFragment}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="queries" className="space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar">
                {challenges.map((c) => (
                  <div key={c.id} className="space-y-2">
                    <div className="text-xs uppercase tracking-widest text-[color:var(--color-cyan)]">
                      {c.code} — {c.title}
                    </div>
                    <AIPromptBlock prompt={c.aiPrompt} />
                    {c.splunkQueries.map((q, i) => (
                      <QueryBlock key={i} title={q.title} query={q.query} />
                    ))}
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="finale" className="space-y-3">
                <div className="text-sm">
                  <div className="text-[color:var(--color-cyan)] text-xs uppercase tracking-widest">
                    Codice finale
                  </div>
                  <div className="font-mono text-[color:var(--color-neon)] text-2xl">
                    {FINAL_CODE}
                  </div>
                </div>
                <div className="text-sm">
                  <div className="text-[color:var(--color-cyan)] text-xs uppercase tracking-widest">
                    Vault key
                  </div>
                  <div className="font-mono text-[color:var(--color-neon)] text-2xl">
                    {VAULT_KEY}
                  </div>
                </div>
                {challenges[5].extra && (
                  <pre className="glass rounded-md p-3 text-xs whitespace-pre-wrap">
                    {challenges[5].extra}
                  </pre>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
