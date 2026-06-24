"use client";

import type { ZenithPage } from "@/types/zenith-content";

export function ZenithValidationPanel({
  page,
  validation,
}: {
  page: ZenithPage;
  validation?: { ok: boolean; errors: string[]; warnings: string[] };
}) {
  const v = validation ?? { ok: true, errors: [], warnings: [] };
  const hasErrors = v.errors.length > 0;
  const hasWarnings = v.warnings.length > 0;

  return (
    <section className="rounded-lg border border-border bg-background p-4 shadow-sm">
      <h2 className="text-sm font-medium text-foreground">Publish readiness</h2>
      <div className="mt-3">
        {!hasErrors ? (
          <div className="rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-950">
            Ready to publish
            {page.status === "published" ? " (already published)" : ""}
          </div>
        ) : (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            Blocking validation errors
          </div>
        )}
        {hasWarnings ? (
          <div className="mt-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
            <p className="font-medium">Warnings</p>
            <ul className="mt-2 list-disc pl-5 text-xs">
              {v.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {hasErrors ? (
          <div className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            <p className="font-medium">Errors</p>
            <ul className="mt-2 list-disc pl-5 text-xs">
              {v.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
