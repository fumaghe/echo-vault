import { useCallback, useEffect, useRef, useState } from "react";
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

function safeLoad(): Progress {
  if (typeof window === "undefined") return empty;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return empty;
    return { ...empty, ...parsed };
  } catch {
    // Corrupted storage — reset silently
    try {
      localStorage.removeItem(KEY);
    } catch {
      // removeItem can fail in private-browsing mode — ignore
    }
    return empty;
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(empty);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProgress(safeLoad());
    setReady(true);
  }, []);

  // Persist to localStorage whenever progress changes (skip the initial hydration).
  const isFirstPersist = useRef(true);
  useEffect(() => {
    if (!ready) return;
    if (isFirstPersist.current) {
      isFirstPersist.current = false;
      return;
    }
    try {
      localStorage.setItem(KEY, JSON.stringify(progress));
    } catch {
      // localStorage unavailable (private mode, quota exceeded) — ignore
    }
  }, [progress, ready]);

  // Functional updates avoid stale-closure bugs and keep callbacks stable.
  const markSolved = useCallback((id: string, fragment: string) => {
    setProgress((prev) => {
      const next: Progress = {
        ...prev,
        solved: { ...prev.solved, [id]: true },
        fragments: { ...prev.fragments, [id]: fragment },
      };
      const allSolved = challenges.every((c) => next.solved[c.id]);
      if (allSolved) next.finalUnlocked = true;
      return next;
    });
  }, []);

  // isUnlocked intentionally keeps [progress] in deps: it must read live progress
  // so that vault cards update immediately after each solve.
  const isUnlocked = useCallback(
    (id: string) => {
      const idx = challenges.findIndex((c) => c.id === id);
      if (idx <= 0) return true;
      const prev = challenges[idx - 1];
      return !!progress.solved[prev.id];
    },
    [progress],
  );

  const reset = useCallback(() => setProgress(empty), []);

  const unlockAll = useCallback(() => {
    const solved: Record<string, boolean> = {};
    const fragments: Record<string, string> = {};
    challenges.forEach((c) => {
      solved[c.id] = true;
      fragments[c.id] = c.expectedFragment;
    });
    setProgress({ solved, fragments, finalUnlocked: true, finalSolved: true });
  }, []);

  const setFinalSolved = useCallback((v: boolean) => {
    setProgress((prev) => ({ ...prev, finalSolved: v, finalUnlocked: true }));
  }, []);

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
