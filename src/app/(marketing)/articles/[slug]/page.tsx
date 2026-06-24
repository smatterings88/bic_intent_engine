import { notFound } from "next/navigation";

import { ArticleTemplate } from "@/components/articles/ArticleTemplate";
import { ZenithPageRenderer } from "@/components/zenith/ZenithPageRenderer";
import { selectRotatingArticleLinks } from "@/lib/articles/internal-links";
import { buildArticleMetadata } from "@/lib/articles/metadata";
import {
  getPublishedArticleBySlug,
  listPublishedArticleSlugs,
  listPublishedArticlesForInternalLinks,
} from "@/lib/articles/read";
import { isValidSlug } from "@/lib/content/slug";
import {
  getPublishedZenithPageBySlug,
  listPublishedZenithSlugsByContentType,
} from "@/lib/zenith/firestore";
import { buildZenithPageMetadata } from "@/lib/zenith/metadata";
import { getRelatedPublishedZenithPages } from "@/lib/zenith/related";
import { getBaseUrl } from "@/lib/zenith/routes";
import type { RotatingArticleLinkResult } from "@/types/internal-links";

/** ISR interval in seconds — keep in sync with `DEFAULT_ARTICLE_REVALIDATE_SECONDS` in `src/lib/content/constants.ts`. */
export const revalidate = 3600;

export async function generateStaticParams() {
  const legacy = await listPublishedArticleSlugs();
  const zenith = await listPublishedZenithSlugsByContentType("article");
  const seen = new Set(legacy.map((x) => x.slug));
  return [...legacy, ...zenith.filter((z) => !seen.has(z.slug))];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isValidSlug(slug)) {
    return {
      title: "Article | Sales Breakdown Institute",
      robots: { index: false, follow: false },
    };
  }
  const article = await getPublishedArticleBySlug(slug);
  if (article) {
    return buildArticleMetadata(article);
  }
  const zenith = await getPublishedZenithPageBySlug(slug);
  if (zenith && zenith.contentType === "article") {
    return buildZenithPageMetadata(zenith);
  }
  return {
    title: "Article | Sales Breakdown Institute",
    robots: { index: false, follow: false },
  };
}

export default async function PublicArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isValidSlug(slug)) {
    notFound();
  }
  const article = await getPublishedArticleBySlug(slug);
  if (article) {
    let rotatingLinks: RotatingArticleLinkResult | undefined;
    try {
      const allPublished = await listPublishedArticlesForInternalLinks();
      rotatingLinks = selectRotatingArticleLinks({
        currentArticle: article,
        allPublishedArticles: allPublished,
      });
      if (!rotatingLinks.links.length) {
        rotatingLinks = undefined;
      }
    } catch {
      rotatingLinks = undefined;
    }

    return <ArticleTemplate article={article} rotatingLinks={rotatingLinks} />;
  }

  const zenith = await getPublishedZenithPageBySlug(slug);
  if (!zenith || zenith.contentType !== "article") {
    notFound();
  }
  const relatedCards = await getRelatedPublishedZenithPages(zenith.relatedArticleSlugs ?? []);
  return (
    <ZenithPageRenderer
      page={zenith}
      mode="public"
      relatedCards={relatedCards}
      baseUrl={getBaseUrl()}
    />
  );
}
