import { useEffect, useMemo, useState } from "react";
import type { Challenge } from "@/data/workshop";
import { fragmentMatches, singleAnswerMatch } from "@/lib/echo";
import { echoStage } from "@/lib/stages";

type Status = "idle" | "checking" | "ok" | "ko";

type ValidationMessage = {
  type: "echo-validation-submit";
  challengeId: string;
  answer: string;
  fragment: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createValidationFrameSrcDoc(challengeId: string, alreadySolved: boolean): string {
  const safeChallengeId = escapeHtml(challengeId);
  const disabledAttr = alreadySolved ? "disabled" : "";

  return `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  :root {
    color-scheme: dark;
    --cyan: #22d3ee;
    --border: rgba(34, 211, 238, .28);
    --panel: rgba(0, 0, 0, .20);
    --field: rgba(0, 0, 0, .32);
    --text: #f8fafc;
    --muted: #94a3b8;
    --quiet: #475569;
  }
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    background: transparent;
    color: var(--text);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  }
  body { padding: 0; overflow: hidden; }
  form { display: grid; gap: 12px; }
  .grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; }
  @media (max-width: 700px) { .grid { grid-template-columns: 1fr; } body { overflow: auto; } }
  label {
    display: block;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--panel);
    padding: 12px;
  }
  span {
    display: block;
    margin-bottom: 8px;
    color: var(--muted);
    font-size: 12px;
  }
  input {
    width: 100%;
    height: 44px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--field);
    color: var(--text);
    outline: none;
    padding: 0 12px;
    font: inherit;
    font-size: 14px;
  }
  input::placeholder { color: var(--quiet); }
  input:focus { border-color: var(--cyan); box-shadow: 0 0 0 1px rgba(34, 211, 238, .18); }
  input:disabled { cursor: not-allowed; opacity: .55; }
  .fragment { text-transform: uppercase; }
  .actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
  button {
    height: 44px;
    border: 0;
    border-radius: 7px;
    background: var(--cyan);
    color: #020617;
    font: inherit;
    font-size: 14px;
    padding: 0 18px;
    cursor: pointer;
  }
  button:hover { filter: brightness(.92); }
  button:disabled { cursor: not-allowed; opacity: .55; }
  .hint { color: var(--quiet); font-size: 10px; text-transform: uppercase; letter-spacing: .12em; }
</style>
</head>
<body>
<form id="validation-form" autocomplete="off">
  <div class="grid">
    <label>
      <span>Risposta investigativa</span>
      <input id="answer" name="answer" type="text" placeholder="es. service-name, host, ticket…" ${disabledAttr} autofocus />
    </label>
    <label>
      <span>Frammento cassaforte</span>
      <input id="fragment" class="fragment" name="fragment" type="text" maxlength="4" placeholder="2-3 CARATTERI" ${disabledAttr} />
    </label>
  </div>
  <div class="actions">
    <button type="submit" ${disabledAttr}>▱ Valida frammento</button>
    <div class="hint">isolated input console</div>
  </div>
</form>
<script>
  const challengeId = "${safeChallengeId}";
  const form = document.getElementById("validation-form");
  const answer = document.getElementById("answer");
  const fragment = document.getElementById("fragment");

  fragment.addEventListener("input", () => {
    fragment.value = fragment.value.toUpperCase().slice(0, 4);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    window.parent.postMessage({
      type: "echo-validation-submit",
      challengeId,
      answer: answer.value,
      fragment: fragment.value,
    }, "*");
  });
</script>
</body>
</html>`;
}

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

  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");
  const frameSrcDoc = useMemo(
    () => createValidationFrameSrcDoc(challenge.id, alreadySolved),
    [challenge.id, alreadySolved],
  );

  const validate = (answer: string, fragment: string) => {
    if (alreadySolved) return;

    echoStage(`ValidationPanel-${challenge.id}-validate`);
    setStatus("checking");
    setMessage("DECRYPTING…");

    window.setTimeout(() => {
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

  useEffect(() => {
    const onMessage = (event: MessageEvent<ValidationMessage>) => {
      if (!event.data || event.data.type !== "echo-validation-submit") return;
      if (event.data.challengeId !== challenge.id) return;
      validate(event.data.answer, event.data.fragment);
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
    // validate intentionally omitted: it closes over current challenge and callbacks.
    // The listener is recreated when challenge/alreadySolved changes.
  }, [challenge.id, alreadySolved]);

  return (
    <div className="glass rounded-md p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs uppercase tracking-widest text-[color:var(--color-cyan)]">
          Validation Console
        </div>
        <div className="text-[10px] uppercase tracking-widest text-slate-500">
          isolated input mode
        </div>
      </div>

      <iframe
        title={`Validation Console ${challenge.id}`}
        srcDoc={frameSrcDoc}
        sandbox="allow-scripts allow-forms"
        className="block w-full rounded-md border-0 bg-transparent"
        style={{ height: 160 }}
      />

      {status === "checking" && (
        <span className="text-xs text-[color:var(--color-cyan)]">DECRYPTING</span>
      )}

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

      <div className="text-[10px] text-slate-600">
        Gli input sono isolati in un iframe per evitare il freeze su Chrome/GitHub Pages.
      </div>
    </div>
  );
}
