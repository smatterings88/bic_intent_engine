import { absoluteUrl } from "@/lib/build-metadata";
import { toIsoDateOnly } from "@/lib/content/format-publish-date";
import { siteConfig } from "@/lib/site";
import { getSiteGuideBySlug } from "@/lib/site-guides";
import type { Article } from "@/types/article";

function articlePageUrl(article: Article): string {
  const path = article.seo.canonicalPath.startsWith("/")
    ? article.seo.canonicalPath
    : `/${article.seo.canonicalPath}`;
  return absoluteUrl(path);
}

function iso(value: unknown): string | undefined {
  const parsed = toIsoDateOnly(value);
  if (parsed) return parsed;
  return typeof value === "string" ? value : undefined;
}

function resolveArticleDates(article: Article): { datePublished?: string; dateModified?: string } {
  const pub = iso(article.publishedAt);
  const mod = iso(article.updatedAt);
  if (pub) {
    return { datePublished: pub, dateModified: mod ?? pub };
  }
  const guide = getSiteGuideBySlug(article.slug);
  if (guide) {
    const guidePub = toIsoDateOnly(guide.publishedAt);
    const guideMod = guide.updatedAt ? toIsoDateOnly(guide.updatedAt) : guidePub;
    return guidePub ? { datePublished: guidePub, dateModified: guideMod ?? guidePub } : {};
  }
  return {};
}

export function buildArticleJsonLd(article: Article): Record<string, unknown> {
  const url = articlePageUrl(article);
  const schemaType = article.schema.type === "BlogPosting" ? "BlogPosting" : "Article";
  const publisher = {
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url.replace(/\/$/, ""),
  };
  const out: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": schemaType,
    headline: article.title,
    description: article.seo.metaDescription,
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    publisher,
    author: {
      "@type": "Organization",
      name: siteConfig.name,
    },
    ...resolveArticleDates(article),
  };
  return out;
}

export function buildArticleFaqJsonLd(article: Article): Record<string, unknown> | null {
  const faqs = article.aeo?.faqs;
  if (!faqs?.length) {
    return null;
  }
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}

export function buildArticleBreadcrumbJsonLd(article: Article): Record<string, unknown> {
  const home = siteConfig.url.replace(/\/$/, "");
  const articlesIndex = absoluteUrl("/articles");
  const self = articlePageUrl(article);
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${home}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Articles",
        item: articlesIndex,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: self,
      },
    ],
  };
}
