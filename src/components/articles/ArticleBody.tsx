import type { Article } from "@/types/article";

export function ArticleBody({ article }: { article: Article }) {
  const { intro, sections, conclusion } = article.article;
  return (
    <div className="mx-auto max-w-4xl space-y-12 py-12 page-gutter md:space-y-14 md:py-16">
      <p className="max-w-[65ch] text-lg leading-[1.75] text-foreground">{intro}</p>
      {sections.map((s) => (
        <section
          key={s.heading}
          className="max-w-[65ch] border-t border-border/80 pt-10 first:border-t-0 first:pt-0"
        >
          <h2 className="font-serif text-2xl text-foreground sm:text-[1.65rem]">{s.heading}</h2>
          <p className="mt-4 text-base leading-[1.75] text-muted-foreground">{s.body}</p>
        </section>
      ))}
      <section className="max-w-[65ch] border-t border-border/80 pt-10">
        <h2 className="font-serif text-2xl text-foreground sm:text-[1.65rem]">Conclusion</h2>
        <p className="mt-4 text-base leading-[1.75] text-muted-foreground">{conclusion}</p>
      </section>
    </div>
  );
}
