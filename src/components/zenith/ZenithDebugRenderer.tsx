import type { ZenithComponent, ZenithPage } from "@/types/zenith-content";

import {
  getBaseUrl,
  getPreviewPathForZenithPage,
  getPublicPathForZenithPage,
} from "@/lib/zenith/routes";
import { getOgImageUrlForPage } from "@/lib/zenith/og";

function summarizeComponent(c: ZenithComponent): string {
  switch (c.type) {
    case "aeo-answer-block":
      return c.answer.slice(0, 120) + (c.answer.length > 120 ? "…" : "");
    case "body-section":
      return [c.heading, c.body?.slice(0, 80)].filter(Boolean).join(" — ");
    case "lead-form":
      return `${c.variant} → ${c.destination}`;
    case "faq-section":
      return `${c.faqs.length} FAQ(s)`;
    case "inline-cta":
      return c.headline ?? c.cta?.label ?? "";
    case "transcript-block":
      return c.timestamp ?? "transcript";
    default:
      return "";
  }
}

export function ZenithDebugRenderer({ page }: { page: ZenithPage }) {
  const base = getBaseUrl();
  const ogUrl = getOgImageUrlForPage(page, base);
  const publicPath = getPublicPathForZenithPage(page);
  const previewPath = getPreviewPathForZenithPage(page);

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 text-slate-100">
      <header className="space-y-2 border-b border-slate-700 pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
          Zenith v1.2 · debug renderer
        </p>
        <h1 className="text-3xl font-bold text-white">{page.title ?? page.slug}</h1>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-200">
            {page.contentType}
          </span>
          <span
            className={`rounded-full px-3 py-1 ${
              page.status === "published"
                ? "bg-emerald-900/60 text-emerald-200"
                : "bg-amber-900/50 text-amber-100"
            }`}
          >
            {page.status}
          </span>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-300">/{page.slug}</span>
        </div>
      </header>

      <section className="rounded-lg border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-300">
        <p className="font-medium text-slate-200">Resolved URLs</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>OG: {ogUrl}</li>
          <li>Public path: {publicPath}</li>
          <li>Preview path: {previewPath}</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Components ({page.components.length})</h2>
        <ol className="space-y-4">
          {page.components.map((c, i) => {
            const summary = summarizeComponent(c);
            return (
              <li
                key={`${c.type}-${i}`}
                className="rounded-lg border border-slate-700 bg-slate-950/80 p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm text-sky-300">
                    {i + 1}. {c.type}
                  </span>
                  <span className="h-2 w-16 rounded bg-slate-800" aria-hidden />
                </div>
                {summary ? <p className="mt-2 text-sm text-slate-400">{summary}</p> : null}
                <div className="mt-3 h-16 rounded-md bg-slate-800/80" aria-hidden />
              </li>
            );
          })}
        </ol>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-white">JSON (admin preview)</h2>
        <pre className="max-h-[420px] overflow-auto rounded-lg border border-slate-700 bg-black/40 p-4 text-xs text-slate-300">
          {JSON.stringify(page, null, 2)}
        </pre>
      </section>
    </div>
  );
}
