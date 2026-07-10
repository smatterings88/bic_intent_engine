import type { Metadata } from "next";
import Link from "next/link";

import { buildPageMetadata } from "@/lib/build-metadata";
import { formatPublishedLabel } from "@/lib/content/format-publish-date";
import { listPublishedArticles } from "@/lib/articles/read";
import { getSiteGuideArticlePath, SITE_GUIDES, type SiteGuide } from "@/lib/site-guides";

/** ISR interval in seconds — keep in sync with `DEFAULT_ARTICLE_REVALIDATE_SECONDS` in `src/lib/content/constants.ts`. */
export const revalidate = 3600;

export const metadata: Metadata = buildPageMetadata({
  title: "Blog — Business Impact Canada",
  description:
    "Free communication guides and articles for Canadian entrepreneurs — sales, marketing, leadership, and strategy. Nonprofit-backed, always free.",
  path: "/articles",
});

function GuideCard({ guide }: { guide: SiteGuide }) {
  return (
    <li className="surface-card border-border/70 p-5 transition-shadow duration-200 hover:shadow-md sm:p-6">
      <p className="text-xs font-medium uppercase tracking-wider text-primary">{guide.tag}</p>
      <Link
        href={getSiteGuideArticlePath(guide.slug)}
        className="mt-2 block font-serif text-xl text-foreground underline-offset-4 transition-colors duration-200 hover:underline"
      >
        {guide.title}
      </Link>
      <p className="mt-2 text-xs text-muted-foreground">
        {formatPublishedLabel(guide.publishedAt)}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-4">
        {guide.description}
      </p>
      <Link
        href={getSiteGuideArticlePath(guide.slug)}
        className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
      >
        Read article →
      </Link>
    </li>
  );
}

export default async function ArticlesIndexPage() {
  const firestoreArticles = await listPublishedArticles();
  const catalogSlugs = new Set(SITE_GUIDES.map((g) => g.slug));
  const extraArticles = firestoreArticles.filter((a) => !catalogSlugs.has(a.slug));

  return (
    <>
      <section className="bic-page-hero">
        <div className="site-container">
          <div className="bic-page-hero-inner">
            <p className="section-eyebrow">Blog</p>
            <h1>Free Communication Guides &amp; Articles</h1>
            <p>
              Practical guides on sales, marketing, leadership, and execution — published regularly
              and always free for Canadian entrepreneurs.
            </p>
          </div>
        </div>
      </section>

      <div className="site-container pb-20">
        <ul className="space-y-6 border-t border-border pt-10 sm:space-y-8">
          {SITE_GUIDES.map((guide) => (
            <GuideCard key={guide.slug} guide={guide} />
          ))}
        </ul>

        {extraArticles.length > 0 ? (
          <div className="mt-14 border-t border-border pt-10">
            <h2 className="font-serif text-2xl text-foreground">More from our research library</h2>
            <ul className="mt-6 space-y-6 sm:space-y-8">
              {extraArticles.map((a) => (
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
                  {typeof a.publishedAt === "string" ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatPublishedLabel(a.publishedAt)}
                    </p>
                  ) : null}
                  {a.subtitle ? (
                    <p className="mt-2 text-sm text-muted-foreground">{a.subtitle}</p>
                  ) : null}
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {a.seo.metaDescription}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </>
  );
}
