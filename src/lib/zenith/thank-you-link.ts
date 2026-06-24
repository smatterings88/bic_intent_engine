import { normalizeSlug } from "@/lib/content/slug";
import { getPublicPathForZenithPage } from "@/lib/zenith/routes";
import type {
  ForensicDownloadSectionComponent,
  LeadFormComponent,
  ZenithComponent,
  ZenithPage,
  ZenithSlotConfig,
} from "@/types/zenith-content";

import { successBehaviorToThankYouPath } from "@/lib/zenith/slot-config";

import { resolveThankYouPageUrl } from "./lead-form-rules";

/** Strip "Thank You" prefix and slugify for cross-page title matching. */
export function thankYouTitleKey(title: string): string {
  const stripped = title
    .trim()
    .replace(/^thank\s*you\s*[\s:\-—–|]+\s*/i, "")
    .replace(/^thank\s*you\s*$/i, "");
  return normalizeSlug(stripped || title);
}

function thankYouSlugKey(lp: Pick<ZenithPage, "leadMagnetId" | "slug" | "title">): string {
  if (lp.leadMagnetId?.trim()) {
    return normalizeSlug(lp.leadMagnetId.trim());
  }
  return thankYouTitleKey(lp.title?.trim() || lp.slug);
}

export function defaultThankYouPathFromLandingPage(
  lp: Pick<ZenithPage, "leadMagnetId" | "title" | "slug">,
): string {
  return `/cta/thank-you-${thankYouSlugKey(lp)}`;
}

/** Find the thank-you `cta_page` in the same bulk batch that pairs with this landing page. */
export function findPairedThankYouPage(
  lp: ZenithPage,
  batch: ZenithPage[],
): ZenithPage | undefined {
  const explicitTitle = lp.thankYouPageTitle?.trim();
  if (explicitTitle) {
    const byTitle = batch.find(
      (p) =>
        (p.contentType === "cta_page" || p.contentType === "thank_you_page") &&
        p.title?.trim() === explicitTitle,
    );
    if (byTitle) return byTitle;
  }

  const lpKey = thankYouSlugKey(lp);

  for (const p of batch) {
    if (p.contentType !== "cta_page" && p.contentType !== "thank_you_page") continue;
    if (p.slug === `thank-you-${lp.slug}` || p.slug === `thank-you-${lpKey}`) return p;
    const tyKey = thankYouTitleKey(p.title?.trim() || p.slug);
    if (
      tyKey &&
      lpKey &&
      (tyKey === lpKey || lpKey.startsWith(`${tyKey}-`) || tyKey.startsWith(`${lpKey}-`))
    ) {
      return p;
    }
  }

  return undefined;
}

function setSlotThankYouUrl(thankYouPageUrl: string, slots: ZenithSlotConfig[] | undefined): void {
  for (const slot of slots ?? []) {
    if (slot.type !== "lead-form") continue;
    if (slot.successBehavior?.type === "redirect") continue;
    if (!resolveThankYouPageUrl(slot.thankYouPageUrl, slot.redirect)) {
      slot.thankYouPageUrl = thankYouPageUrl;
    }
  }
}

function setFormThankYouUrl(thankYouPageUrl: string, components: ZenithComponent[]): void {
  for (const c of components) {
    if (c.type === "lead-form") {
      const form = c as LeadFormComponent;
      if (!resolveThankYouPageUrl(form.thankYouPageUrl, form.redirect)) {
        form.thankYouPageUrl = thankYouPageUrl;
      }
    }
    if (c.type === "forensic-download-section") {
      const section = c as ForensicDownloadSectionComponent;
      if (
        section.form &&
        !resolveThankYouPageUrl(section.form.thankYouPageUrl, section.form.redirect)
      ) {
        section.form.thankYouPageUrl = thankYouPageUrl;
      }
    }
  }
}

/**
 * Fill missing `thankYouPageUrl` on landing_page forms.
 * - Same bulk batch: match `cta_page` by title (TY title ≈ LP title after stripping "Thank You").
 * - Single ingest / no match: default `/cta/thank-you-{titleKey}` from LP `title`.
 */
export function applyAutoThankYouPageUrls(pages: ZenithPage[]): void {
  const batch = pages;

  for (const page of pages) {
    if (page.contentType !== "landing_page") continue;

    const paired = findPairedThankYouPage(page, batch);
    const path = paired
      ? getPublicPathForZenithPage(paired)
      : defaultThankYouPathFromLandingPage(page);

    setFormThankYouUrl(path, page.components);
    setSlotThankYouUrl(path, page.slots);
  }
}

export function findLeadFormThankYouFromSlots(
  page: Pick<ZenithPage, "slots">,
  slotId: string,
): string | undefined {
  const slot = page.slots?.find((s) => s.slot === slotId && s.type === "lead-form");
  if (!slot) return undefined;
  return (
    successBehaviorToThankYouPath(slot.successBehavior) ??
    resolveThankYouPageUrl(slot.thankYouPageUrl, slot.redirect)
  );
}

/** Runtime fallback when stored page has no explicit form URL (e.g. older drafts). */
export function resolveThankYouPageUrlForLandingPage(
  page: ZenithPage,
  batchHint?: ZenithPage[],
): string | undefined {
  if (page.contentType !== "landing_page") return undefined;

  for (const c of page.components) {
    if (c.type === "lead-form") {
      const url = resolveThankYouPageUrl(
        (c as LeadFormComponent).thankYouPageUrl,
        (c as LeadFormComponent).redirect,
      );
      if (url) return url;
    }
    if (c.type === "forensic-download-section" && c.form) {
      const url = resolveThankYouPageUrl(c.form.thankYouPageUrl, c.form.redirect);
      if (url) return url;
    }
  }

  const paired = batchHint ? findPairedThankYouPage(page, batchHint) : undefined;
  if (paired) return getPublicPathForZenithPage(paired);
  return defaultThankYouPathFromLandingPage(page);
}
