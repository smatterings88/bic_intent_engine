import type { Metadata } from "next";

import { absoluteUrl, defaultOpenGraphExtras } from "@/lib/build-metadata";
import { siteConfig } from "@/lib/site";
import type { Article } from "@/types/article";

function articlePageUrl(article: Article): string {
  const path = article.seo.canonicalPath.startsWith("/")
    ? article.seo.canonicalPath
    : `/${article.seo.canonicalPath}`;
  return absoluteUrl(path);
}

export function buildArticleMetadata(article: Article): Metadata {
  const url = articlePageUrl(article);
  const robots: Metadata["robots"] = article.seo.noindex
    ? { index: false, follow: false }
    : { index: true, follow: true };

  const publishedTime = typeof article.publishedAt === "string" ? article.publishedAt : undefined;
  const modifiedTime = typeof article.updatedAt === "string" ? article.updatedAt : undefined;

  return {
    metadataBase: new URL(siteConfig.url),
    title: article.seo.metaTitle,
    description: article.seo.metaDescription,
    alternates: {
      canonical: url,
    },
    robots,
    openGraph: {
      ...defaultOpenGraphExtras(),
      type: "article",
      title: article.seo.metaTitle,
      description: article.seo.metaDescription,
      url,
      siteName: siteConfig.name,
      locale: "en_US",
      publishedTime,
      modifiedTime,
    },
    twitter: {
      card: "summary",
      title: article.seo.metaTitle,
      description: article.seo.metaDescription,
      images: [siteConfig.openGraphImagePath],
    },
  };
}
