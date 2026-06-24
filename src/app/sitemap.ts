import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/build-metadata";
import { listPublishedArticles } from "@/lib/articles/read";
import { listPublishedLandingPages } from "@/lib/landing-pages/read";
import { isReservedTopLevelSlug } from "@/lib/content/slug";

const STATIC_PATHS = [
  "/",
  "/about",
  "/research",
  "/programs",
  "/insights",
  "/contact",
  "/privacy",
  "/terms",
  "/where-deals-break",
  "/articles",
] as const;

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

  let withArticles = entries;
  try {
    const articles = await listPublishedArticles();
    const articleUrls: MetadataRoute.Sitemap = articles.map((a) => ({
      url: absoluteUrl(`/articles/${a.slug}`),
      lastModified: lastModFromTimestamps(a),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
    withArticles = [...entries, ...articleUrls];
  } catch {
    withArticles = entries;
  }

  try {
    const landings = await listPublishedLandingPages();
    const landingUrls: MetadataRoute.Sitemap = landings
      .filter((p) => !isReservedTopLevelSlug(p.slug))
      .map((p) => ({
        url: absoluteUrl(`/${p.slug}`),
        lastModified: lastModFromTimestamps(p),
        changeFrequency: "weekly" as const,
        priority: 0.85,
      }));
    return [...withArticles, ...landingUrls];
  } catch {
    return withArticles;
  }
}
