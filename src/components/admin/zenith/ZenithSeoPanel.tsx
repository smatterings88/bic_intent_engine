"use client";

import type { ZenithPage } from "@/types/zenith-content";

function Field({ label, value, warn }: { label: string; value?: string; warn?: boolean }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={`mt-1 text-sm ${warn ? "text-amber-900" : "text-foreground"}`}>
        {value?.trim() ? value : "—"}
      </p>
    </div>
  );
}

export function ZenithSeoPanel({ page }: { page: ZenithPage }) {
  const seo = page.seo ?? {};
  const missingTitle = !seo.metaTitle?.trim();
  const missingDesc = !seo.metaDescription?.trim();
  const missingCanonical = !seo.canonicalPath?.trim();

  return (
    <section className="rounded-lg border border-border bg-background p-4 shadow-sm">
      <h2 className="text-sm font-medium text-foreground">SEO</h2>
      {(missingTitle || missingDesc || missingCanonical) && (
        <div className="mt-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
          <p className="font-medium">SEO warnings</p>
          <ul className="mt-2 list-disc pl-5 text-xs">
            {missingTitle ? <li>Missing meta title</li> : null}
            {missingDesc ? <li>Missing meta description</li> : null}
            {missingCanonical ? <li>Missing canonical path</li> : null}
          </ul>
        </div>
      )}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="metaTitle" value={seo.metaTitle} warn={missingTitle} />
        <Field label="canonicalPath" value={seo.canonicalPath} warn={missingCanonical} />
        <div className="md:col-span-2">
          <Field label="metaDescription" value={seo.metaDescription} warn={missingDesc} />
        </div>
        <Field label="noindex" value={seo.noindex ? "true" : "false"} />
        <Field label="ogTitle" value={seo.ogTitle} />
        <div className="md:col-span-2">
          <Field label="ogDescription" value={seo.ogDescription} />
        </div>
      </div>
    </section>
  );
}
