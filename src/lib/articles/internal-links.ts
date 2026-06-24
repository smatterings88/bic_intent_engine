import type { Article } from "@/types/article";
import type {
  InternalLinkReason,
  RotatingArticleLink,
  RotatingArticleLinkResult,
} from "@/types/internal-links";
import { createArticleRotationKey, deterministicShuffle } from "./rotation";

function normSlug(s: string): string {
  return s.trim().toLowerCase();
}

function normCluster(s: string): string {
  return s.trim().toLowerCase();
}

function linkFrom(article: Article, reason: InternalLinkReason): RotatingArticleLink {
  return {
    slug: article.slug,
    title: article.title,
    description: article.subtitle ?? article.seo?.metaDescription,
    reason,
  };
}

export function selectRotatingArticleLinks(args: {
  currentArticle: Article;
  allPublishedArticles: Article[];
  date?: Date;
}): RotatingArticleLinkResult {
  const { currentArticle, allPublishedArticles, date } = args;
  const when = date ?? new Date();
  const rotationKey = createArticleRotationKey(currentArticle.slug, when);

  const rawMax = currentArticle.internalLinking?.maxLinks ?? 6;
  const maxLinks = Math.max(1, Math.min(12, rawMax));

  const currentSlug = normSlug(currentArticle.slug);
  const excludedSlugs = new Set(
    (currentArticle.internalLinking?.excludedLinks ?? []).map(normSlug),
  );

  const bySlug = new Map<string, Article>();
  for (const a of allPublishedArticles) {
    if (a.status !== "published") continue;
    const k = normSlug(a.slug);
    if (k === currentSlug || excludedSlugs.has(k)) continue;
    bySlug.set(k, a);
  }

  const links: RotatingArticleLink[] = [];
  const used = new Set<string>();

  const pushBucket = (articles: Article[], reason: InternalLinkReason, seedSuffix: string) => {
    const unique = articles.filter((a) => !used.has(normSlug(a.slug)));
    const shuffled = deterministicShuffle(unique, rotationKey + seedSuffix);
    for (const a of shuffled) {
      if (links.length >= maxLinks) return;
      const k = normSlug(a.slug);
      if (used.has(k)) continue;
      used.add(k);
      links.push(linkFrom(a, reason));
    }
  };

  const currentPrimary = normCluster(currentArticle.internalLinking.primaryCluster);
  const relatedSet = new Set(
    (currentArticle.internalLinking.relatedClusters ?? []).map(normCluster).filter(Boolean),
  );

  const requiredArticles = (currentArticle.internalLinking.requiredLinks ?? [])
    .map((s) => bySlug.get(normSlug(s)))
    .filter((a): a is Article => Boolean(a));

  pushBucket(requiredArticles, "required", ":required");

  const sameCluster = [...bySlug.values()].filter(
    (a) => normCluster(a.internalLinking.primaryCluster) === currentPrimary,
  );
  pushBucket(sameCluster, "same_cluster", ":same_cluster");

  const relatedCluster = [...bySlug.values()].filter((a) => {
    const np = normCluster(a.internalLinking.primaryCluster);
    return np !== currentPrimary && relatedSet.has(np);
  });
  pushBucket(relatedCluster, "related_cluster", ":related_cluster");

  const explicitSlugs = new Set((currentArticle.relatedArticleSlugs ?? []).map(normSlug));
  const explicit = [...bySlug.values()].filter((a) => explicitSlugs.has(normSlug(a.slug)));
  pushBucket(explicit, "explicit_related", ":explicit_related");

  const fallback = [...bySlug.values()].filter((a) => !used.has(normSlug(a.slug)));
  pushBucket(fallback, "fallback", ":fallback");

  return {
    selectedAt: when.toISOString(),
    rotationKey,
    links,
  };
}
