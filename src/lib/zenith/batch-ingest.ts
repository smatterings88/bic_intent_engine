import "server-only";

import { isReservedTopLevelSlug } from "@/lib/content/slug";
import { applyAutoThankYouPageUrls } from "@/lib/zenith/thank-you-link";
import { applyBatchRelationships, validateSlotRedirectTargets } from "@/lib/zenith/slot-config";
import { validateLandingPageLeadForms } from "@/lib/zenith/lead-form-rules";
import { getPageRenderMode } from "@/lib/zenith/render-mode";
import { validateZenithPagePayload } from "@/lib/zenith/validation";
import type { ZenithPage, ZenithRelationship } from "@/types/zenith-content";

export type NormalizedBulkBody = {
  batchId?: string;
  pages: unknown[];
  relationships?: ZenithRelationship[];
};

export function normalizeZenithBulkRequestBody(body: unknown): NormalizedBulkBody | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;

  if (Array.isArray(o.items)) {
    return {
      batchId: typeof o.batchId === "string" ? o.batchId : undefined,
      pages: o.items,
      relationships: Array.isArray(o.relationships)
        ? (o.relationships as ZenithRelationship[])
        : undefined,
    };
  }
  if (Array.isArray(o.pages)) {
    return {
      batchId: typeof o.batchId === "string" ? o.batchId : undefined,
      pages: o.pages,
      relationships: Array.isArray(o.relationships)
        ? (o.relationships as ZenithRelationship[])
        : undefined,
    };
  }
  return null;
}

export type ParsedBulkEntry = {
  slug: string;
  page?: ZenithPage;
  errors: string[];
  warnings: string[];
};

export function parseAndValidateZenithBulkPages(pagesRaw: unknown[]): ParsedBulkEntry[] {
  const parsed: ParsedBulkEntry[] = [];

  for (const item of pagesRaw) {
    const slugGuess =
      item && typeof item === "object" && typeof (item as { slug?: unknown }).slug === "string"
        ? String((item as { slug: string }).slug)
        : "unknown-or-bad-slug";

    const v = validateZenithPagePayload(item, { deferLandingThankYou: true });
    if (!v.ok || !v.normalized) {
      parsed.push({ slug: slugGuess, errors: v.errors, warnings: v.warnings ?? [] });
      continue;
    }
    parsed.push({
      slug: v.normalized.slug,
      page: v.normalized,
      errors: [],
      warnings: v.warnings ?? [],
    });
  }

  const okPages = parsed.filter((p) => p.page && p.errors.length === 0).map((p) => p.page!);

  applyAutoThankYouPageUrls(okPages);

  for (const page of okPages) {
    if (page.contentType === "landing_page") {
      const pageErrors: string[] = [];
      validateLandingPageLeadForms(page.contentType, page.components, pageErrors, page);
      const entry = parsed.find((p) => p.page?.slug === page.slug);
      if (entry) {
        entry.errors.push(...pageErrors);
      }
    }
    const mode = getPageRenderMode(page);
    if (mode === "html_snippet" && !page.html?.sanitizedBody?.trim()) {
      const entry = parsed.find((p) => p.page?.slug === page.slug);
      entry?.errors.push(`${page.slug}: html_snippet requires sanitized html body`);
    }
  }

  return parsed;
}

export function finalizeBulkWithRelationships(
  parsed: ParsedBulkEntry[],
  relationships: ZenithRelationship[] | undefined,
): void {
  const okPages = parsed.filter((p) => p.page && p.errors.length === 0).map((p) => p.page!);
  const relErrors: string[] = [];
  const relWarnings: string[] = [];

  applyBatchRelationships(okPages, relationships, relErrors);
  validateSlotRedirectTargets(okPages, relErrors, relWarnings);

  if (relErrors.length) {
    for (const entry of parsed) {
      if (entry.page) {
        entry.errors.push(...relErrors);
      }
    }
  }
  if (relWarnings.length) {
    for (const entry of parsed) {
      if (entry.page) {
        entry.warnings.push(...relWarnings);
      }
    }
  }
}

export function validateBulkSlugsReserved(pages: ZenithPage[]): string | null {
  for (const p of pages) {
    if (p.contentType === "landing_page" || p.contentType === "thank_you_page") {
      if (isReservedTopLevelSlug(p.slug)) {
        return `Reserved slug: ${p.slug}`;
      }
    }
  }
  return null;
}
