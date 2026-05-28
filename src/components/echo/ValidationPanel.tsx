import { useRef, useState } from "react";
import type { Challenge } from "@/data/workshop";
import { fragmentMatches, singleAnswerMatch } from "@/lib/echo";
import { echoStage } from "@/lib/stages";

type Status = "idle" | "checking" | "ok" | "ko";

const inputClassName =
  "h-11 w-full rounded-md border border-[color:var(--color-border)] bg-black/30 px-3 py-2 font-mono text-sm text-white outline-none placeholder:text-slate-500 focus:border-[color:var(--color-cyan)] disabled:cursor-not-allowed disabled:opacity-50";

export function ValidationPanel({
  challenge,
  alreadySolved,
  onSolved,
}: {
  challenge: Challenge;
  alreadySolved: boolean;
  onSolved: (fragment: string) => void;
}) {
  echoStage(`ValidationPanel-${challenge.id}-render`);

  // Use native uncontrolled inputs here on purpose.
  // On GitHub Pages/Chrome, the controlled shadcn Input + motion feedback subtree could
  // freeze the page on keypress. Keeping keystrokes outside React state avoids a render
  // on every character and isolates validation to the button click.
  const answerRef = useRef<HTMLInputElement>(null);
  const fragmentRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

  const validate = () => {
    if (alreadySolved) return;

    echoStage(`ValidationPanel-${challenge.id}-validate`);
    setStatus("checking");
    setMessage("DECRYPTING…");

    window.setTimeout(() => {
      const answer = answerRef.current?.value ?? "";
      const fragment = fragmentRef.current?.value ?? "";
      const ansOk = singleAnswerMatch(answer, challenge.expectedAnswers);
      const fragOk = fragmentMatches(fragment, challenge.expectedFragment);

      if (ansOk && fragOk) {
        setStatus("ok");
        setMessage("FRAGMENT ACCEPTED — " + challenge.successMessage);
        window.setTimeout(() => onSolved(challenge.expectedFragment), 700);
        return;
      }

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
    }, 250);
  };

  return (
    <div className="glass rounded-md p-4 space-y-3">
      <div className="text-xs uppercase tracking-widest text-[color:var(--color-cyan)]">
        Validation Console
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="block text-xs text-slate-400 mb-1">Risposta investigativa</span>
          <input
            ref={answerRef}
            type="text"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            disabled={alreadySolved}
            placeholder="es. service-name, host, ticket…"
            className={inputClassName}
            onFocus={() => echoStage(`ValidationPanel-${challenge.id}-answer-focus`)}
            onInput={() => echoStage(`ValidationPanel-${challenge.id}-answer-input`)}
          />
        </label>

        <label className="block">
          <span className="block text-xs text-slate-400 mb-1">Frammento cassaforte</span>
          <input
            ref={fragmentRef}
            type="text"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            disabled={alreadySolved}
            maxLength={4}
            placeholder="2-3 CARATTERI"
            className={`${inputClassName} uppercase`}
            onFocus={() => echoStage(`ValidationPanel-${challenge.id}-fragment-focus`)}
            onInput={(event) => {
              const input = event.currentTarget;
              const next = input.value.toUpperCase().slice(0, 4);
              if (input.value !== next) input.value = next;
              echoStage(`ValidationPanel-${challenge.id}-fragment-input`);
            }}
          />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={validate}
          disabled={alreadySolved}
          className="inline-flex h-11 items-center gap-2 rounded-md bg-[color:var(--color-cyan)] px-5 font-mono text-sm text-black hover:bg-[color:var(--color-cyan)]/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span aria-hidden="true">▱</span>
          {alreadySolved ? "Cassaforte già aperta" : "Valida frammento"}
        </button>
        {status === "checking" && (
          <span className="text-xs text-[color:var(--color-cyan)]">DECRYPTING</span>
        )}
      </div>

      {status === "ok" && (
        <div className="flex items-start gap-2 text-[color:var(--color-neon)] text-sm font-mono">
          <span aria-hidden="true">✓</span>
          <span>{message}</span>
        </div>
      )}

      {status === "ko" && (
        <div className="flex items-start gap-2 text-[color:var(--color-alert)] text-sm font-mono">
          <span aria-hidden="true">!</span>
          <span>{message}</span>
        </div>
      )}

      {alreadySolved && (
        <div className="text-xs text-[color:var(--color-neon)] font-mono">
          ✓ Cassaforte sbloccata. Procedi al prossimo vault dalla dashboard.
        </div>
      )}
    </div>
  );
}
