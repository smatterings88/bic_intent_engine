import type { ReactNode } from "react";

import type { ZenithPage } from "@/types/zenith-content";

export function ZenithArticleShell({ page, children }: { page: ZenithPage; children: ReactNode }) {
  return (
    <article className="mx-auto max-w-[760px] px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
      <header className="mb-8 border-b border-slate-200/80 pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1e3560]">Article</p>
        <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
          {page.title?.trim() || page.seo?.metaTitle || page.slug}
        </h1>
        {page.seo?.metaDescription?.trim() ? (
          <p className="mt-4 text-lg leading-relaxed text-slate-600">{page.seo.metaDescription}</p>
        ) : null}
      </header>
      {children}
    </article>
  );
}
