import type { ZenithPage } from "@/types/zenith-content";

import { siteConfig } from "@/lib/site";

export function getBaseUrl(): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (site) return site.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;
  return "http://localhost:3000";
}

export function buildAbsoluteUrl(path: string): string {
  const base = getBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

/** Public URL path for a published Zenith page (matches existing site conventions). */
export function getPublicPathForZenithPage(
  page: Pick<ZenithPage, "contentType" | "slug"> & { seo?: ZenithPage["seo"] },
): string {
  const slug = page.slug;
  switch (page.contentType) {
    case "article":
      return `/articles/${slug}`;
    case "landing_page":
    case "thank_you_page":
      return `/${slug}`;
    case "lead_magnet_page":
      return `/guides/${slug}`;
    case "webinar_page":
      return `/webinars/${slug}`;
    case "cta_page":
      return `/cta/${slug}`;
    case "research_page":
      return `/research/${slug}`;
    default:
      return `/${slug}`;
  }
}

export function getPreviewPathForZenithPage(page: Pick<ZenithPage, "slug">): string {
  return `/preview/${page.slug}`;
}

export function getCanonicalPathForZenithPage(page: ZenithPage): string {
  const raw = page.seo?.canonicalPath?.trim();
  if (raw && raw.length > 0) {
    const p = raw.startsWith("/") ? raw : `/${raw}`;
    if (!p.includes("..")) {
      return p;
    }
  }
  return getPublicPathForZenithPage(page);
}

export function canonicalPathFromSiteUrl(path: string): string {
  const base = siteConfig.url.replace(/\/$/, "");
  if (path.startsWith(base)) {
    return path.slice(base.length) || "/";
  }
  return path.startsWith("/") ? path : `/${path}`;
}
