import { useEffect, useState } from "react";

export function TerminalPanel({
  lines,
  speed = 18,
  className,
  onDone,
}: {
  lines: string[];
  speed?: number;
  className?: string;
  onDone?: () => void;
}) {
  const [shown, setShown] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    setShown([]);
    setCurrent("");
    setLineIdx(0);
    setCharIdx(0);
  }, [lines]);

  useEffect(() => {
    if (lineIdx >= lines.length) {
      onDone?.();
      return;
    }
    const line = lines[lineIdx];
    if (charIdx <= line.length) {
      const t = setTimeout(() => {
        setCurrent(line.slice(0, charIdx));
        setCharIdx((c) => c + 1);
      }, speed);
      return () => clearTimeout(t);
    } else {
      setShown((s) => [...s, line]);
      setCurrent("");
      setCharIdx(0);
      setLineIdx((i) => i + 1);
    }
  }, [lineIdx, charIdx, lines, speed, onDone]);

  return (
    <div
      className={
        "relative font-mono text-sm leading-relaxed text-[color:var(--color-cyan)] " +
        (className ?? "")
      }
    >
      {shown.map((l, i) => (
        <div key={i} className="whitespace-pre-wrap">{l || "\u00A0"}</div>
      ))}
      {lineIdx < lines.length && (
        <div className="whitespace-pre-wrap cursor">{current}</div>
      )}
    </div>
  );
}
