const STORAGE_KEY = 'mathBubblesMaxUnlocked';

/** Returns the highest stage number that is currently unlocked (minimum 1). */
export function getMaxUnlocked(): number {
  if (typeof window === 'undefined') return 1;
  const raw = localStorage.getItem(STORAGE_KEY);
  const parsed = raw !== null ? parseInt(raw, 10) : NaN;
  return !isNaN(parsed) && parsed >= 1 ? parsed : 1;
}

/** Marks `stage` as completed, unlocking the next stage. Returns the new maxUnlocked. */
export function completeStage(stage: number): number {
  const next = stage + 1;
  const current = getMaxUnlocked();
  if (next > current) {
    localStorage.setItem(STORAGE_KEY, String(next));
    return next;
  }
  return current;
}
