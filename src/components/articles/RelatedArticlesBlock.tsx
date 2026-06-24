import Link from "next/link";

import type { RotatingArticleLinkResult } from "@/types/internal-links";

function slugToLabel(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function RelatedArticlesBlock({
  rotatingLinks,
  slugs,
  currentSlug,
  slugFallbackLimit = 6,
}: {
  rotatingLinks?: RotatingArticleLinkResult;
  slugs: string[];
  currentSlug: string;
  /** Cap for legacy `relatedArticleSlugs` fallback (matches `internalLinking.maxLinks`). */
  slugFallbackLimit?: number;
}) {
  const cap = Math.max(1, Math.min(12, slugFallbackLimit));

  if (rotatingLinks?.links?.length) {
    return (
      <section className="border-t border-border">
        <div className="mx-auto max-w-4xl py-12 page-gutter md:py-14">
          <h2 className="font-serif text-2xl text-foreground sm:text-[1.65rem]">
            Related research
          </h2>
          <ul className="mt-8 space-y-4 md:mt-10">
            {rotatingLinks.links.map((link) => (
              <li key={link.slug}>
                <div className="surface-card border-border/70 p-4 transition-shadow duration-200 hover:shadow-md sm:p-5">
                  <Link
                    href={`/articles/${link.slug}`}
                    className="font-medium text-foreground underline-offset-4 transition-colors duration-200 hover:text-primary hover:underline"
                    data-internal-link-reason={link.reason}
                  >
                    {link.title}
                  </Link>
                  {link.description ? (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {link.description}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  const unique = [...new Set(slugs)].filter((s) => s && s !== currentSlug).slice(0, cap);
  if (!unique.length) return null;

  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-4xl py-12 page-gutter md:py-14">
        <h2 className="font-serif text-2xl text-foreground sm:text-[1.65rem]">Related research</h2>
        <ul className="mt-8 space-y-3 md:mt-10">
          {unique.map((slug) => (
            <li key={slug}>
              <div className="surface-card border-border/70 p-4 transition-shadow duration-200 hover:shadow-md sm:p-5">
                <Link
                  href={`/articles/${slug}`}
                  className="font-medium text-foreground underline-offset-4 transition-colors duration-200 hover:text-primary hover:underline"
                >
                  {slugToLabel(slug)}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
