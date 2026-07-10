import type { Article } from "@/types/article";

import { formatPublishedLabel } from "@/lib/content/format-publish-date";
import { getSiteGuideBySlug } from "@/lib/site-guides";

function resolvePublishedLabel(article: Article): string | null {
  if (typeof article.publishedAt === "string" && article.publishedAt) {
    return formatPublishedLabel(article.publishedAt);
  }
  const guide = getSiteGuideBySlug(article.slug);
  if (guide) {
    return formatPublishedLabel(guide.publishedAt);
  }
  return null;
}

export function ArticleHeader({ article }: { article: Article }) {
  const publishedLabel = resolvePublishedLabel(article);

  return (
    <header className="border-b border-border bg-gradient-to-b from-muted/30 to-background">
      <div className="mx-auto max-w-4xl py-14 page-gutter md:py-20">
        <div className="eyebrow text-muted-foreground">Article</div>
        {publishedLabel ? (
          <p className="mt-3 text-sm text-muted-foreground">{publishedLabel}</p>
        ) : null}
        <h1 className="mt-4 font-serif text-3xl leading-[1.12] text-foreground sm:text-4xl md:text-5xl">
          {article.title}
        </h1>
        {article.subtitle ? (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {article.subtitle}
          </p>
        ) : null}
        <p className="mt-5 text-sm text-muted-foreground">
          <span className="font-medium text-foreground/85">Primary topic:</span>{" "}
          {article.keyword.primary}
        </p>
      </div>
    </header>
  );
}
