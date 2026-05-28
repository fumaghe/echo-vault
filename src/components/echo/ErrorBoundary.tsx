import { Component, type ErrorInfo, type ReactNode } from "react";
import { debugLog } from "@/lib/debug";

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    debugLog.error(`[ErrorBoundary] ${error.message}\n${info.componentStack ?? ""}`);
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    if (this.state.error) {
      return this.props.fallback ?? <DefaultErrorUI error={this.state.error} onReset={() => this.setState({ error: null })} />;
    }
    return this.props.children;
  }
}

function DefaultErrorUI({ error, onReset }: { error: Error; onReset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="glass rounded-lg p-8 max-w-lg w-full space-y-4">
        <div className="text-xs uppercase tracking-widest text-[color:var(--color-alert)]">
          SISTEMA — ERRORE CRITICO
        </div>
        <h1 className="text-2xl font-bold text-white">Qualcosa è andato storto</h1>
        <pre className="text-xs text-slate-400 whitespace-pre-wrap bg-black/40 rounded p-3 max-h-40 overflow-auto">
          {error.message}
        </pre>
        <p className="text-sm text-slate-400">
          Il progresso locale è al sicuro. Prova a ricaricare la pagina o a cliccare
          "Riprova".
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onReset}
            className="px-4 py-2 rounded bg-[color:var(--color-cyan)] text-black text-sm font-medium"
          >
            Riprova
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded border border-slate-600 text-slate-300 text-sm"
          >
            Ricarica pagina
          </button>
        </div>
        {new URLSearchParams(window.location.search).get("debug") === "1" && (
          <pre className="text-xs text-slate-500 whitespace-pre-wrap bg-black/20 rounded p-2 max-h-40 overflow-auto">
            {error.stack}
          </pre>
        )}
      </div>
    </div>
  );
}
