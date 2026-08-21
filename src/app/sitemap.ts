import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/build-metadata";
import { listPublishedArticles } from "@/lib/articles/read";
import { listPublishedLandingPages } from "@/lib/landing-pages/read";
import { isReservedTopLevelSlug } from "@/lib/content/slug";
import { listPublishedZenithSlugsByContentType } from "@/lib/zenith/firestore";
import { getPublicPathForZenithPage } from "@/lib/zenith/routes";
import type { ZenithContentType } from "@/types/zenith-content";

const STATIC_PATHS = [
  "/",
  "/about",
  "/learning-areas",
  "/resources",
  "/contact",
  "/privacy",
  "/terms",
  "/articles",
] as const;

/**
 * Indexed Zenith types. Omits cta_page and thank_you_page (post-conversion)
 * and research_page (/research/:slug permanently redirects to /articles/:slug,
 * and no research route exists, so those URLs would 301 into a 404).
 */
const SITEMAP_ZENITH_CONTENT_TYPES = [
  "article",
  "landing_page",
  "lead_magnet_page",
  "webinar_page",
] as const satisfies readonly ZenithContentType[];

function staticSitemapEntries(): MetadataRoute.Sitemap {
  const now = new Date();
  return STATIC_PATHS.map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: path === "/" ? ("weekly" as const) : ("monthly" as const),
    priority: path === "/" ? 1 : 0.7,
  }));
}

function lastModFromTimestamps(row: { updatedAt?: unknown; publishedAt?: unknown }): Date {
  const last =
    typeof row.updatedAt === "string"
      ? new Date(row.updatedAt)
      : typeof row.publishedAt === "string"
        ? new Date(row.publishedAt)
        : new Date();
  return last;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = staticSitemapEntries();

  const legacyArticleSlugs = new Set<string>();
  let withArticles = entries;
  try {
    const articles = await listPublishedArticles();
    for (const a of articles) {
      legacyArticleSlugs.add(a.slug);
    }
    const articleUrls: MetadataRoute.Sitemap = articles.map((a) => ({
      url: absoluteUrl(`/articles/${a.slug}`),
      lastModified: lastModFromTimestamps(a),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
    withArticles = [...entries, ...articleUrls];
  } catch (error) {
    console.error("[sitemap] listPublishedArticles() failed", error);
    withArticles = entries;
  }

  const legacyLandingSlugs = new Set<string>();
  let withLandings = withArticles;
  try {
    const landings = await listPublishedLandingPages();
    for (const p of landings) {
      legacyLandingSlugs.add(p.slug);
    }
    const landingUrls: MetadataRoute.Sitemap = landings
      .filter((p) => !isReservedTopLevelSlug(p.slug))
      .map((p) => ({
        url: absoluteUrl(`/${p.slug}`),
        lastModified: lastModFromTimestamps(p),
        changeFrequency: "weekly" as const,
        priority: 0.85,
      }));
    withLandings = [...withArticles, ...landingUrls];
  } catch (error) {
    console.error("[sitemap] listPublishedLandingPages() failed", error);
    withLandings = withArticles;
  }

  try {
    const zenithByType = await Promise.all(
      SITEMAP_ZENITH_CONTENT_TYPES.map(async (contentType) => ({
        contentType,
        pages: await listPublishedZenithSlugsByContentType(contentType),
      })),
    );

    const zenithUrls: MetadataRoute.Sitemap = [];
    for (const { contentType, pages } of zenithByType) {
      for (const page of pages) {
        if (contentType === "article" && legacyArticleSlugs.has(page.slug)) {
          continue;
        }
        if (contentType === "landing_page") {
          if (legacyLandingSlugs.has(page.slug) || isReservedTopLevelSlug(page.slug)) {
            continue;
          }
        }
        // listPublishedZenithSlugsByContentType returns { slug } only — seo.noindex
        // is not available without fetching every zenithPages document.
        // The list helper also omits updatedAt/publishedAt, so lastmod is now.
        const path = getPublicPathForZenithPage({ contentType, slug: page.slug });
        zenithUrls.push({
          url: absoluteUrl(path),
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: contentType === "landing_page" ? 0.85 : 0.8,
        });
      }
    }

    return [...withLandings, ...zenithUrls];
  } catch (error) {
    console.error("[sitemap] listPublishedZenithSlugsByContentType() failed", error);
    return withLandings;
  }
}
