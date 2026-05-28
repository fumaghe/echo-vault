import { useEffect, useRef, useState } from "react";

export function TerminalPanel({
  lines,
  speed = 18,
  instant = false,
  className,
  onDone,
}: {
  lines: string[];
  speed?: number;
  instant?: boolean;
  className?: string;
  onDone?: () => void;
}) {
  const [shown, setShown] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);

  // Keep a ref so the animation effect always calls the latest onDone without
  // including it in deps (avoids restart when the prop reference changes).
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  // Guard: fire onDone exactly once per animation run, even if the parent re-renders
  // while lineIdx >= lines.length.
  const doneFiredRef = useRef(false);

  // ?fastIntro=1 / instant=true — render all lines immediately and fire onDone.
  // This bypasses the setTimeout chain entirely: useful for isolating whether the
  // 18 ms × N-character typewriter loop is causing scheduler pressure on GitHub Pages.
  useEffect(() => {
    if (!instant) return;
    doneFiredRef.current = false;
    setShown(lines);
    setCurrent("");
    setLineIdx(lines.length);
    setCharIdx(0);
  }, [lines, instant]);

  // Fire onDone once when instant mode completes (lineIdx = lines.length).
  useEffect(() => {
    if (!instant) return;
    if (lineIdx >= lines.length && !doneFiredRef.current) {
      doneFiredRef.current = true;
      onDoneRef.current?.();
    }
  }, [instant, lineIdx, lines.length]);

  useEffect(() => {
    if (instant) return; // handled above
    doneFiredRef.current = false;
    setShown([]);
    setCurrent("");
    setLineIdx(0);
    setCharIdx(0);
  }, [lines, instant]);

  useEffect(() => {
    if (instant) return; // handled above
    if (lineIdx >= lines.length) {
      if (!doneFiredRef.current) {
        doneFiredRef.current = true;
        onDoneRef.current?.();
      }
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
  }, [lineIdx, charIdx, lines, speed, instant]); // onDone intentionally omitted — accessed via ref

  return (
    <div
      className={
        "relative font-mono text-sm leading-relaxed text-[color:var(--color-cyan)] " +
        (className ?? "")
      }
    >
      {shown.map((l, i) => (
        <div key={i} className="whitespace-pre-wrap">
          {l || " "}
        </div>
      ))}
      {!instant && lineIdx < lines.length && (
        <div className="whitespace-pre-wrap cursor">{current}</div>
      )}
    </div>
  );
}
