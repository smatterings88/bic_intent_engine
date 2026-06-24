"use client";

import type { ZenithComponent, ZenithPage } from "@/types/zenith-content";

function summarize(c: ZenithComponent): string {
  switch (c.type) {
    case "page-hero":
      return (c as { headline?: string }).headline?.slice(0, 90) ?? "";
    case "aeo-answer-block":
      return (c as { answer?: string }).answer?.slice(0, 90) ?? "";
    case "body-section":
      return (c as { heading?: string }).heading?.slice(0, 90) ?? "";
    case "transcript-block": {
      const t = c as { timestamp?: string; verdict?: string };
      return [t.timestamp, t.verdict].filter(Boolean).join(" · ");
    }
    case "inline-cta": {
      const x = c as { variant?: string; headline?: string };
      return [x.variant, x.headline?.slice(0, 60)].filter(Boolean).join(" · ");
    }
    case "faq-section":
      return `${((c as { faqs?: unknown[] }).faqs ?? []).length} FAQs`;
    case "credibility-bar":
      return (c as { text?: string }).text?.slice(0, 90) ?? "";
    case "moment-list":
      return `${((c as { moments?: unknown[] }).moments ?? []).length} moments`;
    case "why-miss-section":
      return (c as { heading?: string }).heading?.slice(0, 90) ?? "";
    case "forensic-download-section":
      return (c as { heading?: string }).heading?.slice(0, 90) ?? "";
    case "lead-form": {
      const x = c as { variant?: string; destination?: string };
      return [x.variant, x.destination].filter(Boolean).join(" · ");
    }
    case "footer-cta":
      return (c as { headline?: string }).headline?.slice(0, 90) ?? "";
    default:
      return "";
  }
}

export function ZenithComponentOverview({ page }: { page: ZenithPage }) {
  const list = Array.isArray(page.components) ? page.components : [];
  return (
    <section className="rounded-lg border border-border bg-background p-4 shadow-sm">
      <h2 className="text-sm font-medium text-foreground">Component overview</h2>
      <p className="mt-1 text-xs text-muted-foreground">{list.length} components</p>
      <ol className="mt-4 space-y-2">
        {list.map((c, idx) => (
          <li key={`${c.type}-${idx}`} className="rounded-md border border-border bg-muted/10 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-medium text-foreground">
                {idx + 1}. <code className="rounded bg-muted px-1">{c.type}</code>
              </p>
            </div>
            {summarize(c) ? (
              <p className="mt-2 text-sm text-muted-foreground">{summarize(c)}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
