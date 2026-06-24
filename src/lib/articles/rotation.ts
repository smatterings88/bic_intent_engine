import { getISOWeek, getISOWeekYear } from "date-fns";

/** ISO week label, e.g. `2026-W20` (UTC calendar date → ISO week). */
export function getIsoWeekKey(date: Date = new Date()): string {
  return `${getISOWeekYear(date)}-W${String(getISOWeek(date)).padStart(2, "0")}`;
}

/** Deterministic key for this article in the current ISO week. */
export function createArticleRotationKey(articleSlug: string, date: Date = new Date()): string {
  return `${articleSlug.trim()}::${getIsoWeekKey(date)}`;
}

/** Stable 32-bit unsigned hash for string seeds. */
export function stableHash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Fisher–Yates shuffle order derived from `seed` (stable for same inputs). */
export function deterministicShuffle<T>(items: T[], seed: string): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const h = stableHash(`${seed}|${i}`);
    const j = Math.floor((h / 0x1_0000_0000) * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}
