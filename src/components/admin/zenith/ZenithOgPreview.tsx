"use client";

import { useState } from "react";

import type { ZenithPage } from "@/types/zenith-content";

export function ZenithOgPreview({ page }: { page: ZenithPage }) {
  const og = page.ogImage ?? {};
  const ogUrl = `/api/og/${encodeURIComponent(page.slug)}`;
  const [imgErr, setImgErr] = useState(false);

  return (
    <section className="rounded-lg border border-border bg-background p-4 shadow-sm">
      <h2 className="text-sm font-medium text-foreground">Open Graph</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <div className="rounded-md border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">cdnUrl:</span>{" "}
              {og.cdnUrl?.trim() ? og.cdnUrl : "—"}
            </p>
            <p className="mt-1">
              <span className="font-medium text-foreground">template:</span>{" "}
              {og.template?.trim() ? og.template : "—"}
            </p>
            <p className="mt-1">
              <span className="font-medium text-foreground">headline:</span>{" "}
              {og.headline?.trim() ? og.headline : "—"}
            </p>
            <p className="mt-1">
              <span className="font-medium text-foreground">subhead:</span>{" "}
              {og.subhead?.trim() ? og.subhead : "—"}
            </p>
            <p className="mt-1">
              <span className="font-medium text-foreground">signal:</span>{" "}
              {og.signal?.trim() ? og.signal : "—"}
            </p>
            {og.cdnUrl?.trim() ? (
              <p className="mt-2 rounded bg-emerald-50 px-2 py-1 text-emerald-900">
                Using CDN override
              </p>
            ) : null}
            {og.template?.trim() ? (
              <p className="mt-2 rounded bg-slate-50 px-2 py-1 text-slate-900">
                Generated from template: {og.template}
              </p>
            ) : null}
          </div>
        </div>
        <div>
          <div className="rounded-md border border-border bg-background p-2">
            {imgErr ? (
              <p className="p-3 text-sm text-muted-foreground">Could not load OG image.</p>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={ogUrl}
                alt="Open Graph preview"
                className="h-auto w-full rounded"
                onError={() => setImgErr(true)}
              />
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Preview URL: <code className="rounded bg-muted px-1">{ogUrl}</code>
          </p>
        </div>
      </div>
    </section>
  );
}
