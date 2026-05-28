export function storageGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function storageSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function storageRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {}
}

export function storageClear(): void {
  try {
    localStorage.clear();
  } catch {}
}
