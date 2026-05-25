import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QueryBlock({
  title,
  query,
  label = "Copia SPL",
}: {
  title: string;
  query: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(query);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  return (
    <div className="glass rounded-md overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[color:var(--color-border)]">
        <div className="text-xs uppercase tracking-widest text-[color:var(--color-cyan)]">
          {title}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={copy}
          className="h-7 text-xs gap-1 text-[color:var(--color-cyan)] hover:text-white"
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? "Copiato" : label}
        </Button>
      </div>
      <pre className="text-xs leading-relaxed px-3 py-3 overflow-x-auto text-slate-200 no-scrollbar">
        <code>{query}</code>
      </pre>
    </div>
  );
}

export function AIPromptBlock({ prompt }: { prompt: string }) {
  return <QueryBlock title="Prompt AI" query={prompt} label="Copia prompt" />;
}
