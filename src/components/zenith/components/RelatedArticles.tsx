import Link from "next/link";

import type { RelatedZenithCard } from "@/lib/zenith/related";

export function RelatedArticlesSection({ items }: { items: RelatedZenithCard[] }) {
  if (!items?.length) return null;
  return (
    <section
      className="my-14 border-t border-slate-200 pt-10"
      aria-labelledby="zenith-related-heading"
    >
      <h2 id="zenith-related-heading" className="font-serif text-2xl font-semibold text-slate-900">
        Related Reading
      </h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.slug}>
            <Link
              href={item.publicUrl}
              className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {item.contentType.replace(/_/g, " ")}
              </span>
              <h3 className="mt-2 font-serif text-lg font-semibold text-slate-900">{item.title}</h3>
              {item.description ? (
                <p className="mt-2 line-clamp-3 text-sm text-slate-600">{item.description}</p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
