import Link from "next/link";

import { isReservedTopLevelSlug } from "@/lib/content/slug";

function slugToLabel(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function RelatedLandingPagesBlock({
  slugs,
  currentSlug,
}: {
  slugs: string[];
  currentSlug: string;
}) {
  const unique = [...new Set(slugs)]
    .filter((s) => s && s !== currentSlug && !isReservedTopLevelSlug(s))
    .slice(0, 8);
  if (!unique.length) return null;
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-4xl py-12 page-gutter md:py-14">
        <h2 className="font-serif text-2xl text-foreground">Related offers</h2>
        <ul className="mt-6 space-y-3">
          {unique.map((slug) => (
            <li key={slug}>
              <Link href={`/${slug}`} className="text-primary underline-offset-4 hover:underline">
                {slugToLabel(slug)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
