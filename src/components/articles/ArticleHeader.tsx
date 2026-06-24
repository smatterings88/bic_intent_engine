import type { Article } from "@/types/article";

export function ArticleHeader({ article }: { article: Article }) {
  return (
    <header className="border-b border-border bg-gradient-to-b from-muted/30 to-background">
      <div className="mx-auto max-w-4xl py-14 page-gutter md:py-20">
        <div className="eyebrow text-muted-foreground">Article</div>
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
