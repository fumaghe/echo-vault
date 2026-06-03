import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Challenge } from "@/data/workshop";
import { EvidenceArtifact } from "./EvidenceArtifact";
import { ValidationPanel } from "./ValidationPanel";
import { QueryBlock, AIPromptBlock } from "./QueryBlock";

export function VaultDetail({
  challenge,
  alreadySolved,
  onBack,
  onSolved,
}: {
  challenge: Challenge;
  alreadySolved: boolean;
  onBack: () => void;
  onSolved: (fragment: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="gap-2 text-[color:var(--color-cyan)] hover:text-white"
        >
          <ArrowLeft className="size-4" /> Dashboard
        </Button>
        <span className="text-xs font-mono text-slate-400">
          VAULT-{challenge.code} · {String(challenge.order).padStart(2, "0")}/06
        </span>
      </div>

      <header className="glass rounded-md p-5">
        <div className="text-xs uppercase tracking-widest text-[color:var(--color-cyan)]">
          {challenge.subtitle}
        </div>
        <h1 className="mt-1 text-3xl font-bold text-white">{challenge.title}</h1>
        <p className="mt-3 text-sm text-slate-300 italic">Obiettivo: {challenge.objective}</p>
      </header>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="space-y-3">
          <div className="glass rounded-md p-4">
            <div className="text-xs uppercase tracking-widest text-[color:var(--color-cyan)] mb-2">
              Briefing
            </div>
            <ul className="space-y-2 text-sm text-slate-200">
              {challenge.briefing.map((b, i) => (
                <li key={i} className="leading-relaxed">
                  <span className="text-[color:var(--color-cyan)] mr-2">›</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass rounded-md p-4">
            <div className="text-xs uppercase tracking-widest text-[color:var(--color-cyan)] mb-2">
              Dataset disponibili
            </div>
            <div className="flex flex-wrap gap-2">
              {challenge.dataset.map((d) => (
                <span
                  key={d}
                  className="px-2 py-1 rounded font-mono text-xs border border-[color:var(--color-border)] text-slate-200"
                >
                  {d}
                </span>
              ))}
            </div>
            {challenge.links && challenge.links.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {challenge.links.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 rounded font-mono text-xs border border-[color:var(--color-cyan)] text-[color:var(--color-cyan)] hover:bg-[color:var(--color-cyan)] hover:text-black transition-colors"
                  >
                    ↗ {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {challenge.extra && (
            <pre className="glass rounded-md p-4 text-xs leading-relaxed whitespace-pre-wrap text-slate-200 no-scrollbar overflow-x-auto">
              {challenge.extra}
            </pre>
          )}
        </div>

        <EvidenceArtifact src={challenge.artifactImage} alt={challenge.title} />
      </div>

      <AIPromptBlock prompt={challenge.aiPrompt} />

      <ValidationPanel challenge={challenge} alreadySolved={alreadySolved} onSolved={onSolved} />
    </motion.div>
  );
}
