import { normalizeSlug } from "@/lib/content/slug";
import type { ArticleDraftInput } from "@/types/article";
import type { LandingPageDraftInput } from "@/types/landing-page";
import type { LeadMagnetDraftInput } from "@/types/lead-magnet";

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function trimString(s: string): string {
  return s.trim();
}

/**
 * Normalizes slug/id/canonicalPath for articles. Does not rewrite substantive body copy.
 */
export function normalizeArticleDraft(input: unknown): ArticleDraftInput {
  if (!input || typeof input !== "object") {
    throw new Error("Article draft must be a non-null object");
  }
  const o = cloneJson(input) as Record<string, unknown>;
  const slug = normalizeSlug(String(o.slug ?? ""));
  o.slug = slug;
  o.id = slug;
  o.source = "zenithmind";
  o.contentType = "article";

  if (typeof o.title === "string") o.title = trimString(o.title);
  if (typeof o.subtitle === "string") o.subtitle = trimString(o.subtitle);

  const seo = o.seo;
  if (seo && typeof seo === "object") {
    const s = seo as Record<string, unknown>;
    if (typeof s.metaTitle === "string") s.metaTitle = trimString(s.metaTitle);
    if (typeof s.metaDescription === "string") {
      s.metaDescription = trimString(s.metaDescription);
    }
    const cp = typeof s.canonicalPath === "string" ? trimString(s.canonicalPath) : "";
    if (!cp.startsWith("/articles/")) {
      s.canonicalPath = `/articles/${slug}`;
    }
  }

  const kw = o.keyword;
  if (kw && typeof kw === "object") {
    const k = kw as Record<string, unknown>;
    if (typeof k.primary === "string") k.primary = trimString(k.primary);
  }

  if (typeof o.relatedLandingPageSlug === "string") {
    const s = normalizeSlug(o.relatedLandingPageSlug);
    if (s) o.relatedLandingPageSlug = s;
    else delete o.relatedLandingPageSlug;
  }
  if (typeof o.leadMagnetId === "string") {
    const s = normalizeSlug(o.leadMagnetId);
    if (s) o.leadMagnetId = s;
    else delete o.leadMagnetId;
  }
  if (Array.isArray(o.relatedArticleSlugs)) {
    o.relatedArticleSlugs = o.relatedArticleSlugs
      .map((x) => normalizeSlug(String(x)))
      .filter((x) => x.length > 0);
  }

  const il = o.internalLinking;
  if (il && typeof il === "object") {
    const inner = il as Record<string, unknown>;
    if (typeof inner.primaryCluster === "string") {
      inner.primaryCluster = trimString(inner.primaryCluster);
    }
    if (Array.isArray(inner.requiredLinks)) {
      inner.requiredLinks = inner.requiredLinks
        .map((x) => normalizeSlug(String(x)))
        .filter((x) => x.length > 0);
    }
    if (Array.isArray(inner.excludedLinks)) {
      inner.excludedLinks = inner.excludedLinks
        .map((x) => normalizeSlug(String(x)))
        .filter((x) => x.length > 0);
    }
  }

  return o as ArticleDraftInput;
}

/**
 * Normalizes slug/id/canonicalPath for landing pages.
 */
export function normalizeLandingPageDraft(input: unknown): LandingPageDraftInput {
  if (!input || typeof input !== "object") {
    throw new Error("Landing page draft must be a non-null object");
  }
  const o = cloneJson(input) as Record<string, unknown>;
  const slug = normalizeSlug(String(o.slug ?? ""));
  o.slug = slug;
  o.id = slug;
  o.source = "zenithmind";
  o.contentType = "landing_page";

  const seo = o.seo;
  if (seo && typeof seo === "object") {
    const s = seo as Record<string, unknown>;
    if (typeof s.metaTitle === "string") s.metaTitle = trimString(s.metaTitle);
    if (typeof s.metaDescription === "string") {
      s.metaDescription = trimString(s.metaDescription);
    }
    const cp = typeof s.canonicalPath === "string" ? trimString(s.canonicalPath) : "";
    const expected = `/${slug}`;
    if (!cp || cp !== expected) {
      s.canonicalPath = expected;
    }
  }

  const hero = o.hero;
  if (hero && typeof hero === "object") {
    const h = hero as Record<string, unknown>;
    for (const key of Object.keys(h)) {
      const v = h[key];
      if (typeof v === "string") h[key] = trimString(v);
    }
  }

  const kw = o.keyword;
  if (kw && typeof kw === "object") {
    const k = kw as Record<string, unknown>;
    if (typeof k.primary === "string") k.primary = trimString(k.primary);
  }

  if (Array.isArray(o.relatedArticleSlugs)) {
    o.relatedArticleSlugs = o.relatedArticleSlugs
      .map((x) => normalizeSlug(String(x)))
      .filter((x) => x.length > 0);
  }
  if (Array.isArray(o.relatedLandingPageSlugs)) {
    o.relatedLandingPageSlugs = o.relatedLandingPageSlugs
      .map((x) => normalizeSlug(String(x)))
      .filter((x) => x.length > 0);
  }

  if (typeof o.primaryLeadMagnetId === "string") {
    o.primaryLeadMagnetId = normalizeSlug(o.primaryLeadMagnetId);
  }
  if (Array.isArray(o.leadMagnetIds)) {
    o.leadMagnetIds = o.leadMagnetIds
      .map((x) => normalizeSlug(String(x)))
      .filter((x) => x.length > 0);
  }

  return o as LandingPageDraftInput;
}

/**
 * Normalizes lead magnet id (slug-safe) and light string trims.
 */
export function normalizeLeadMagnetDraft(input: unknown): LeadMagnetDraftInput {
  if (!input || typeof input !== "object") {
    throw new Error("Lead magnet draft must be a non-null object");
  }
  const o = cloneJson(input) as Record<string, unknown>;
  const id = normalizeSlug(String(o.id ?? ""));
  o.id = id;
  o.source = "zenithmind";

  for (const key of ["title", "subtitle", "description", "ctaLabel", "ghlTag"] as const) {
    if (typeof o[key] === "string") o[key] = trimString(o[key] as string);
  }

  return o as LeadMagnetDraftInput;
}

/** Normalize each batch array entry before Zod validation. */
export function normalizeZenithBatchBody(body: unknown): unknown {
  if (!body || typeof body !== "object") {
    return body;
  }
  const o = body as Record<string, unknown>;
  const out: Record<string, unknown> = { ...o };
  if (Array.isArray(o.leadMagnets)) {
    out.leadMagnets = o.leadMagnets.map((x) => normalizeLeadMagnetDraft(x));
  }
  if (Array.isArray(o.articles)) {
    out.articles = o.articles.map((x) => normalizeArticleDraft(x));
  }
  if (Array.isArray(o.landingPages)) {
    out.landingPages = o.landingPages.map((x) => normalizeLandingPageDraft(x));
  }
  return out;
}
