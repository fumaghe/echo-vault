import { useCallback, useEffect, useState } from "react";
import { challenges } from "@/data/workshop";

const KEY = "echo-noc-progress-v1";

export type Progress = {
  solved: Record<string, boolean>;
  fragments: Record<string, string>;
  finalUnlocked: boolean;
  finalSolved: boolean;
};

const empty: Progress = {
  solved: {},
  fragments: {},
  finalUnlocked: false,
  finalSolved: false,
};

function load(): Progress {
  if (typeof window === "undefined") return empty;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty;
    return { ...empty, ...JSON.parse(raw) };
  } catch {
    return empty;
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(empty);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProgress(load());
    setReady(true);
  }, []);

  const persist = useCallback((next: Progress) => {
    setProgress(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const markSolved = useCallback(
    (id: string, fragment: string) => {
      const next: Progress = {
        ...progress,
        solved: { ...progress.solved, [id]: true },
        fragments: { ...progress.fragments, [id]: fragment },
      };
      const allSolved = challenges.every((c) => next.solved[c.id]);
      if (allSolved) next.finalUnlocked = true;
      persist(next);
    },
    [progress, persist],
  );

  const isUnlocked = useCallback(
    (id: string) => {
      const idx = challenges.findIndex((c) => c.id === id);
      if (idx <= 0) return true;
      const prev = challenges[idx - 1];
      return !!progress.solved[prev.id];
    },
    [progress],
  );

  const reset = useCallback(() => persist(empty), [persist]);

  const unlockAll = useCallback(() => {
    const solved: Record<string, boolean> = {};
    const fragments: Record<string, string> = {};
    challenges.forEach((c) => {
      solved[c.id] = true;
      fragments[c.id] = c.expectedFragment;
    });
    persist({ solved, fragments, finalUnlocked: true, finalSolved: true });
  }, [persist]);

  const setFinalSolved = useCallback(
    (v: boolean) => persist({ ...progress, finalSolved: v, finalUnlocked: true }),
    [progress, persist],
  );

  const fragmentsCount = challenges.filter((c) => progress.solved[c.id]).length;

  return {
    ready,
    progress,
    markSolved,
    isUnlocked,
    reset,
    unlockAll,
    setFinalSolved,
    fragmentsCount,
    total: challenges.length,
  };
}
