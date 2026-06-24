import type { OgImageTemplate, ZenithContentType, ZenithPage } from "@/types/zenith-content";

import { buildAbsoluteUrl, getBaseUrl } from "@/lib/zenith/routes";

export function getOgImageTemplateForContentType(contentType: ZenithContentType): OgImageTemplate {
  switch (contentType) {
    case "article":
    case "landing_page":
      return "forensic-article";
    case "lead_magnet_page":
      return "lead-magnet";
    case "webinar_page":
      return "webinar-event";
    case "research_page":
      return "research-report";
    case "cta_page":
    case "thank_you_page":
      return "cta-upload";
    default:
      return "forensic-article";
  }
}

export function resolveOgImageTemplate(page: ZenithPage): OgImageTemplate {
  if (page.ogImage?.template) {
    return page.ogImage.template;
  }
  return getOgImageTemplateForContentType(page.contentType);
}

/**
 * Absolute URL for OG image: CDN wins; else on-demand `/api/og/[slug]`; else generic default.
 */
export function getOgImageUrlForPage(page: ZenithPage, baseUrl?: string): string {
  const base = (baseUrl ?? getBaseUrl()).replace(/\/$/, "");
  const cdn = page.ogImage?.cdnUrl?.trim();
  if (cdn) {
    if (cdn.startsWith("http://") || cdn.startsWith("https://")) {
      return cdn;
    }
    if (cdn.startsWith("/")) {
      return buildAbsoluteUrl(cdn);
    }
    return `${base}/${cdn.replace(/^\//, "")}`;
  }
  if (page.ogImage?.template) {
    return `${base}/api/og/${encodeURIComponent(page.slug)}`;
  }
  return `${base}/api/og/default`;
}
