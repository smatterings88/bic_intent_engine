import Link from "next/link";

function slugToLabel(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function RelatedLandingArticlesBlock({ slugs }: { slugs: string[] }) {
  const unique = [...new Set(slugs)].filter(Boolean).slice(0, 8);
  if (!unique.length) return null;
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-4xl py-12 page-gutter md:py-14">
        <h2 className="font-serif text-2xl text-foreground">Related research</h2>
        <ul className="mt-6 space-y-3">
          {unique.map((slug) => (
            <li key={slug}>
              <Link
                href={`/articles/${slug}`}
                className="text-primary underline-offset-4 hover:underline"
              >
                {slugToLabel(slug)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
