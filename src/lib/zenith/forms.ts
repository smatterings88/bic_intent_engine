import "server-only";

import { resolveGhlTags, sanitizeGhlTagList } from "@/lib/ghl/tag-strategy";
import { resolveCtaDestination, type CtaDestinationKind } from "@/lib/zenith/destinations";
import type { GhlTagStrategy } from "@/types/zenith-content";

export type { CtaDestinationKind };
export { resolveCtaDestination } from "@/lib/zenith/destinations";
export { resolveGhlTags } from "@/lib/ghl/tag-strategy";

const SAFE_TAG = /^[a-zA-Z0-9\s:->_-]+$/;

function isSafeTag(t: string): boolean {
  const s = t.trim();
  return s.length > 0 && s.length < 200 && SAFE_TAG.test(s);
}

function tagMatchesDestinationFamily(tag: string, kind: CtaDestinationKind, id?: string): boolean {
  if (!isSafeTag(tag)) return false;
  const t = tag.trim();
  switch (kind) {
    case "lead-magnet":
      return (
        /^lead_magnet:[a-z0-9-]+$/i.test(t) && (id ? t.toLowerCase() === `lead_magnet:${id}` : true)
      );
    case "webinar":
      return /^webinar:[a-z0-9-]+$/i.test(t) && (id ? t.toLowerCase() === `webinar:${id}` : true);
    case "call-upload":
      return t === "sbi --> call upload started";
    case "contact":
      return t === "sbi --> contact form";
    default:
      return false;
  }
}

/** Default destination tags (no page/component strategy or legacy tags). */
export function getDefaultTagsForDestination(destination: string): string[] {
  const resolved = resolveCtaDestination(destination);
  const base: string[] = [];
  switch (resolved.kind) {
    case "lead-magnet":
      if (resolved.id) {
        base.push(`lead_magnet:${resolved.id}`);
      }
      break;
    case "webinar":
      if (resolved.id) {
        base.push(`webinar:${resolved.id}`);
      }
      break;
    case "call-upload":
      base.push("sbi --> call upload started");
      break;
    case "contact":
      base.push("sbi --> contact form");
      break;
    default:
      break;
  }
  return sanitizeGhlTagList(base);
}

/** Legacy `ghlTags` on lead-form: only tags that match the destination family. */
export function filterLegacyComponentGhlTags(
  destination: string,
  componentGhlTags?: string[],
): string[] {
  const resolved = resolveCtaDestination(destination);
  if (resolved.kind === "unknown" || !componentGhlTags?.length) {
    return [];
  }
  const extra: string[] = [];
  for (const raw of componentGhlTags) {
    if (typeof raw !== "string") continue;
    if (tagMatchesDestinationFamily(raw, resolved.kind, resolved.id)) {
      extra.push(raw.trim());
    }
  }
  return sanitizeGhlTagList(extra);
}

export type ResolveZenithFormGhlTagsInput = {
  destination: string;
  pageStrategy?: GhlTagStrategy;
  componentStrategy?: GhlTagStrategy;
  legacyComponentTags?: string[];
};

export function resolveZenithFormGhlTags(input: ResolveZenithFormGhlTagsInput): string[] {
  const legacy =
    input.componentStrategy != null
      ? undefined
      : filterLegacyComponentGhlTags(input.destination, input.legacyComponentTags);

  return resolveGhlTags({
    defaultTags: getDefaultTagsForDestination(input.destination),
    pageStrategy: input.pageStrategy,
    componentStrategy: input.componentStrategy,
    legacyComponentTags: legacy,
  });
}

/**
 * @deprecated Use `resolveZenithFormGhlTags` with page/component strategies.
 * Preserves prior behavior: defaults + legacy component tags (destination-filtered).
 */
export function getTagsForDestination(destination: string, componentGhlTags?: string[]): string[] {
  return resolveZenithFormGhlTags({
    destination,
    legacyComponentTags: componentGhlTags,
  });
}

const MAX_FIELD_LEN = 8000;

export function sanitizeFormFields(fields: unknown): Record<string, string> {
  if (!fields || typeof fields !== "object") {
    return {};
  }
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(fields as Record<string, unknown>)) {
    if (typeof v !== "string") continue;
    const key = k.trim().slice(0, 80);
    if (!key) continue;
    let val = v.trim().slice(0, MAX_FIELD_LEN);
    if (key === "email") {
      val = val.toLowerCase();
    }
    out[key] = val;
  }
  return out;
}

export function validateEmail(email: string): boolean {
  const e = email.trim();
  if (e.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}
