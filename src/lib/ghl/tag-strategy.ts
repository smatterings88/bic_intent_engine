import type { GhlTagStrategy, GhlTagStrategyMode } from "@/types/zenith-content";

export const GHL_TAG_MAX_COUNT = 50;
export const GHL_TAG_MAX_LENGTH = 200;

/** Allowed GHL tag characters (aligned with Zenith destination tag families). */
const SAFE_TAG = /^[a-zA-Z0-9\s:->_-]+$/;

function isSafeTag(t: string): boolean {
  const s = t.trim();
  return s.length > 0 && s.length <= GHL_TAG_MAX_LENGTH && SAFE_TAG.test(s);
}

/**
 * Normalize tag list: trim, drop empty/unsafe, dedupe, cap count.
 * Used for stored page/component configuration only — not public form bodies.
 */
export function sanitizeGhlTagList(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const v of tags) {
    if (typeof v !== "string") continue;
    const s = v.trim().slice(0, GHL_TAG_MAX_LENGTH);
    if (!isSafeTag(s)) continue;
    if (seen.has(s)) continue;
    seen.add(s);
    out.push(s);
    if (out.length >= GHL_TAG_MAX_COUNT) break;
  }
  return out;
}

const MODES: GhlTagStrategyMode[] = ["merge", "replace", "suppress"];

export function parseGhlTagStrategy(raw: unknown): GhlTagStrategy | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const mode = o.mode;
  if (typeof mode !== "string" || !MODES.includes(mode as GhlTagStrategyMode)) {
    return undefined;
  }
  const parsedMode = mode as GhlTagStrategyMode;
  if (parsedMode === "suppress") {
    return { mode: "suppress" };
  }
  const tags = sanitizeGhlTagList(o.tags);
  return { mode: parsedMode, tags: tags.length ? tags : undefined };
}

function applyStrategy(currentTags: string[], strategy: GhlTagStrategy): string[] {
  switch (strategy.mode) {
    case "suppress":
      return [];
    case "replace":
      return sanitizeGhlTagList(strategy.tags ?? []);
    case "merge":
      return sanitizeGhlTagList([...currentTags, ...(strategy.tags ?? [])]);
    default:
      return currentTags;
  }
}

export type ResolveGhlTagsInput = {
  /** Destination-derived defaults (e.g. `lead_magnet:id`, webinar tag). */
  defaultTags: string[];
  pageStrategy?: GhlTagStrategy;
  componentStrategy?: GhlTagStrategy;
  /** Legacy `lead-form.ghlTags` — merge only when no component `ghlTagStrategy`. */
  legacyComponentTags?: string[];
};

/**
 * Resolve final GHL tags for a form submission or opt-in.
 * Page strategy applies first; component strategy overrides page; legacy tags merge last.
 */
export function resolveGhlTags(input: ResolveGhlTagsInput): string[] {
  let tags = sanitizeGhlTagList(input.defaultTags);

  if (input.pageStrategy) {
    tags = applyStrategy(tags, input.pageStrategy);
  }

  if (input.componentStrategy) {
    tags = applyStrategy(tags, input.componentStrategy);
  } else if (input.legacyComponentTags?.length) {
    tags = applyStrategy(tags, { mode: "merge", tags: input.legacyComponentTags });
  }

  return tags;
}
