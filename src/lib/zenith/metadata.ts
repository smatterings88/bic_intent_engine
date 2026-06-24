import type { Metadata } from "next";

import type { ZenithPage } from "@/types/zenith-content";

import { getCanonicalPathForZenithPage, getBaseUrl, buildAbsoluteUrl } from "@/lib/zenith/routes";
import { getOgImageUrlForPage } from "@/lib/zenith/og";

const FALLBACK_DESC =
  "Sales call forensics, deal signals, and practical breakdowns from the Sales Breakdown Institute.";

export function buildZenithPageMetadata(
  page: ZenithPage,
  baseUrl?: string,
  options?: { preview?: boolean },
): Metadata {
  const base = baseUrl ?? getBaseUrl();
  const resolvedOgImageUrl = getOgImageUrlForPage(page, base);
  const title = page.seo?.metaTitle?.trim() || page.title?.trim() || "Sales Breakdown Institute";
  const description =
    page.seo?.metaDescription?.trim() || page.seo?.ogDescription?.trim() || FALLBACK_DESC;
  const canonicalPath = getCanonicalPathForZenithPage(page);
  const canonical = buildAbsoluteUrl(canonicalPath);

  const isDraft = page.status === "draft";
  const noindexSeo = page.seo?.noindex === true;

  const robots =
    options?.preview || isDraft
      ? { index: false, follow: false as const }
      : noindexSeo
        ? { index: false, follow: true as const }
        : { index: true, follow: true as const };

  const ogTitle =
    page.seo?.ogTitle?.trim() || page.seo?.metaTitle?.trim() || page.title?.trim() || title;
  const ogDescription =
    page.seo?.ogDescription?.trim() || page.seo?.metaDescription?.trim() || description;

  return {
    title,
    description,
    alternates: { canonical },
    robots,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      images: [{ url: resolvedOgImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      images: [resolvedOgImageUrl],
    },
  };
}
