import type { Article } from "@/types/article";

function isoDate(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

const SCHEMA_LABELS: Record<Article["schema"]["type"], string> = {
  Article: "Article",
  BlogPosting: "Brief",
  FAQPage: "FAQ",
};

/** Eyebrow for homepage / list cards, e.g. "Brief · 2026". */
export function formatArticlePublicationTag(article: Article): string {
  const kind = SCHEMA_LABELS[article.schema.type] ?? "Article";
  const dateStr = isoDate(article.publishedAt) ?? isoDate(article.updatedAt);
  if (!dateStr) return kind;
  const year = new Date(dateStr).getFullYear();
  return Number.isFinite(year) ? `${kind} · ${year}` : kind;
}

export function articleListSummary(article: Article): string {
  const fromSeo = article.seo.metaDescription?.trim();
  if (fromSeo) return fromSeo;
  const fromIntro = article.article.intro?.trim();
  if (fromIntro) return fromIntro;
  return article.subtitle?.trim() ?? "";
}
