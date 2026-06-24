import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/site/PageHeader";
import { buildPageMetadata } from "@/lib/build-metadata";
import { listPublishedArticles } from "@/lib/articles/read";

/** ISR interval in seconds — keep in sync with `DEFAULT_ARTICLE_REVALIDATE_SECONDS` in `src/lib/content/constants.ts`. */
export const revalidate = 3600;

export const metadata: Metadata = buildPageMetadata({
  title: "Articles | Sales Breakdown Institute",
  description:
    "Published research and analysis from the Sales Breakdown Institute—where sales conversations break down, and what the evidence says about improving outcomes.",
  path: "/articles",
});

export default async function ArticlesIndexPage() {
  const articles = await listPublishedArticles();
  return (
    <>
      <PageHeader
        eyebrow="Research"
        title="Articles"
        lede="Independent, evidence-oriented pieces on sales performance, conversation failure modes, and practical takeaways for teams."
      />
      <div className="mx-auto max-w-4xl py-14 page-gutter sm:py-16">
        {articles.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 bg-muted/25 p-8 text-center">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Published articles will appear here once they are available in the content system.
            </p>
          </div>
        ) : (
          <ul className="space-y-6 border-t border-border pt-8 sm:space-y-8 sm:pt-10">
            {articles.map((a) => (
              <li
                key={a.slug}
                className="surface-card border-border/70 p-5 transition-shadow duration-200 hover:shadow-md sm:p-6"
              >
                <Link
                  href={`/articles/${a.slug}`}
                  className="font-serif text-xl text-foreground underline-offset-4 transition-colors duration-200 hover:underline"
                >
                  {a.title}
                </Link>
                {a.subtitle ? (
                  <p className="mt-2 text-sm text-muted-foreground">{a.subtitle}</p>
                ) : null}
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {a.seo.metaDescription}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground/80">Topic:</span> {a.keyword.primary}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
