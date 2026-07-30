import type { ZenithPage } from "@/types/zenith-content";

/** Visible byline in LP2 layer diagram (html_snippet + components). */
const SBI_SHERPA_BYLINE = "Sales Breakdown Institute · Sherpa";

/** SEO + hero copy on `what-your-recordings-reveal`. */
export const SHERPA_RECORDINGS_META =
  "Fathom, Gong, and Otter capture the conversation. Sherpa reveals where the buyer stopped evaluating, where hesitation first appeared, and where the deal quietly changed.";

export const RECORDINGS_META_WITHOUT_SHERPA =
  "Fathom, Gong, and Otter capture the conversation. Sales Breakdown Institute reveals where the buyer stopped evaluating, where hesitation first appeared, and where the deal quietly changed.";

const FORENSIC_PAGE_SLUGS = new Set([
  "why-you-keep-losing-deals",
  "sales-objection-handling",
  "cold-call-script",
]);

export function stripSherpaFromString(value: string): string {
  let s = value;

  s = s.split(SBI_SHERPA_BYLINE).join("Sales Breakdown Institute");
  s = s.split("Business Impact Canada · Sherpa").join("Business Impact Canada");
  s = s.split(SHERPA_RECORDINGS_META).join(RECORDINGS_META_WITHOUT_SHERPA);
  s = s.replace(
    /Fathom, Gong, and Otter capture the conversation\.\s*Sherpa reveals/g,
    "Fathom, Gong, and Otter capture the conversation. Sales Breakdown Institute reveals",
  );
  s = s.replace(/\s·\s*Sherpa\b/g, "");

  if (s.trim() === "Sherpa Verdict") {
    return "";
  }

  return s;
}

function deepStripSherpa(value: unknown): unknown {
  if (typeof value === "string") {
    return stripSherpaFromString(value);
  }
  if (Array.isArray(value)) {
    return value.map(deepStripSherpa);
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value)) {
      out[key] = deepStripSherpa(child);
    }
    return out;
  }
  return value;
}

/** Remove Sherpa partner branding from published Zenith page payloads. */
export function sanitizeZenithPageSherpaBranding(page: ZenithPage): ZenithPage {
  const next = deepStripSherpa(page) as ZenithPage;

  if (page.slug === "what-your-recordings-reveal" && next.seo) {
    for (const key of ["metaDescription", "ogDescription"] as const) {
      const current = next.seo[key]?.trim();
      if (current?.includes("Sherpa")) {
        next.seo[key] = RECORDINGS_META_WITHOUT_SHERPA;
      }
    }
  }

  if (FORENSIC_PAGE_SLUGS.has(page.slug) && next.components?.length) {
    next.components = next.components.map((component) => {
      if (component.type !== "page-hero" || !("forensicArtifact" in component)) {
        return component;
      }
      const artifact = component.forensicArtifact;
      if (!artifact) return component;
      const label = artifact.verdictLabel?.trim();
      if (!label || label === "Sherpa Verdict") {
        return {
          ...component,
          forensicArtifact: { ...artifact, verdictLabel: undefined },
        };
      }
      return component;
    });
  }

  return next;
}
