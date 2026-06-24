import type { ZenithContentType } from "@/types/zenith-content";

const LABELS: Record<string, string> = {
  article: "Article",
  landing_page: "Landing",
  lead_magnet_page: "Lead Magnet",
  webinar_page: "Webinar",
  cta_page: "CTA",
  thank_you_page: "Thank you",
  research_page: "Research",
};

const RENDER_MODE_LABELS: Record<string, string> = {
  components: "Components",
  html_snippet: "HTML",
  hybrid: "Hybrid",
};

export function ZenithContentTypeBadge({
  contentType,
}: {
  contentType: ZenithContentType | string;
}) {
  const key = String(contentType);
  const label = LABELS[key] ?? key;
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-background px-2 py-0.5 text-xs font-medium text-foreground">
      {label}
    </span>
  );
}

export function ZenithRenderModeBadge({ renderMode }: { renderMode?: string }) {
  const mode = renderMode ?? "components";
  const label = RENDER_MODE_LABELS[mode] ?? mode;
  return (
    <span className="inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700">
      {label}
    </span>
  );
}
