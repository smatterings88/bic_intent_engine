import { getOgImageTemplateForContentType } from "@/lib/zenith/og";
import { validateLandingPageLeadForms } from "@/lib/zenith/lead-form-rules";
import { getPageRenderMode } from "@/lib/zenith/render-mode";
import type {
  ZenithComponent,
  ZenithContentType,
  ZenithOgImage,
  ZenithPage,
  ZenithSeo,
} from "@/types/zenith-content";

function hasType(components: ZenithComponent[], t: string): boolean {
  return components.some((c) => c.type === t);
}

function countType(components: ZenithComponent[], t: string): number {
  return components.filter((c) => c.type === t).length;
}

function componentField(
  type: string,
  field: string,
  components: ZenithComponent[],
): string | undefined {
  const match = components.find((c) => c.type === type);
  if (!match) return undefined;
  const value = (match as Record<string, unknown>)[field];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

/** Derive a meta description from page content when SEO fields are empty. */
export function resolvePublishMetaDescription(page: ZenithPage): string | undefined {
  const fromSeo = page.seo?.metaDescription?.trim() || page.seo?.ogDescription?.trim();
  if (fromSeo) return fromSeo;

  const components = page.components ?? [];
  const aeo = componentField("aeo-answer-block", "answer", components);
  if (aeo) return aeo.length > 320 ? `${aeo.slice(0, 317)}…` : aeo;

  const heroSub = componentField("page-hero", "subheadline", components);
  if (heroSub) return heroSub;

  const body = componentField("body-section", "body", components);
  if (body) return body.length > 320 ? `${body.slice(0, 317)}…` : body;

  return undefined;
}

/** Ensure OG can be generated (matches runtime `/api/og/[slug]` behavior). */
export function resolvePublishOgImage(page: ZenithPage): ZenithOgImage {
  const existing = page.ogImage ?? {};
  if (existing.cdnUrl?.trim() || existing.template) {
    return existing;
  }
  return {
    ...existing,
    template: getOgImageTemplateForContentType(page.contentType),
    headline: existing.headline?.trim() || page.title?.trim() || undefined,
  };
}

/** Fill publish-safe SEO/OG defaults without changing components. */
export function prepareZenithPageForPublish(page: ZenithPage): ZenithPage {
  const metaDescription = resolvePublishMetaDescription(page);
  const seo: ZenithSeo = {
    ...page.seo,
    metaTitle: page.seo?.metaTitle?.trim() || page.title?.trim() || undefined,
  };
  if (metaDescription) {
    if (!seo.metaDescription?.trim()) seo.metaDescription = metaDescription;
    if (!seo.ogDescription?.trim()) seo.ogDescription = metaDescription;
  }

  return {
    ...page,
    seo,
    ogImage: resolvePublishOgImage(page),
  };
}

function publishAutoFillWarnings(original: ZenithPage, prepared: ZenithPage): string[] {
  const warnings: string[] = [];
  const hadMeta = Boolean(
    original.seo?.metaDescription?.trim() || original.seo?.ogDescription?.trim(),
  );
  const hasMeta = Boolean(
    prepared.seo?.metaDescription?.trim() || prepared.seo?.ogDescription?.trim(),
  );
  if (!hadMeta && hasMeta) {
    warnings.push("metaDescription will be auto-filled from page content on publish");
  }
  const hadOg = Boolean(original.ogImage?.cdnUrl?.trim() || original.ogImage?.template);
  if (!hadOg && prepared.ogImage?.template) {
    warnings.push(`ogImage template will default to "${prepared.ogImage.template}" on publish`);
  }
  return warnings;
}

export function validateZenithPageForPublish(page: ZenithPage): {
  ok: boolean;
  errors: string[];
  warnings: string[];
  prepared?: ZenithPage;
} {
  const prepared = prepareZenithPageForPublish(page);
  const errors: string[] = [];
  const warnings = publishAutoFillWarnings(page, prepared);

  const renderMode = getPageRenderMode(page);
  const hasHtml = Boolean(page.html?.sanitizedBody?.trim() || page.html?.body?.trim());
  const hasComponents = Boolean(page.components?.length);
  const c = page.components ?? [];

  if (renderMode === "components" && !hasComponents) {
    errors.push("components must be non-empty");
  }
  if (renderMode === "html_snippet" && !hasHtml) {
    errors.push("html.body is required to publish html_snippet pages");
  }
  if (renderMode === "hybrid" && !hasComponents) {
    errors.push("hybrid pages require a non-empty components array");
  }
  if (
    renderMode === "hybrid" &&
    hasComponents &&
    !hasHtml &&
    !c.some((comp) => comp.type === "html-section")
  ) {
    errors.push("hybrid pages require html.body or at least one html-section component");
  }

  if (!prepared.title?.trim()) {
    errors.push("title is required to publish");
  }

  const metaOk = Boolean(prepared.seo?.metaTitle?.trim() || prepared.title?.trim());
  if (!metaOk) {
    errors.push("seo.metaTitle or title is required to publish");
  }

  const descOk = Boolean(
    prepared.seo?.metaDescription?.trim() || prepared.seo?.ogDescription?.trim(),
  );
  if (!descOk) {
    errors.push(
      "seo.metaDescription or seo.ogDescription is required to publish (add SEO fields or an aeo-answer-block / page-hero / body-section with text)",
    );
  }

  const ogOk = Boolean(prepared.ogImage?.cdnUrl?.trim() || prepared.ogImage?.template);
  if (!ogOk) {
    errors.push("ogImage must have cdnUrl or template to publish");
  }

  const ct = page.contentType as ZenithContentType;

  const requireTypes = (types: string[], label: string) => {
    for (const t of types) {
      if (!hasType(c, t)) {
        errors.push(`${label}: missing required component "${t}"`);
      }
    }
  };

  switch (ct) {
    case "article":
      requireTypes(
        ["aeo-answer-block", "body-section", "transcript-block", "faq-section", "footer-cta"],
        "article",
      );
      if (countType(c, "inline-cta") !== 3) {
        warnings.push("article should include exactly 3 inline-cta components");
      }
      break;
    case "landing_page":
      if (renderMode === "html_snippet") {
        if (!page.slots?.some((s) => s.type === "lead-form")) {
          errors.push("landing_page html_snippet requires at least one lead-form slot");
        }
        validateLandingPageLeadForms("landing_page", c, errors, page);
      } else {
        requireTypes(
          [
            "page-hero",
            "aeo-answer-block",
            "body-section",
            "lead-form",
            "faq-section",
            "footer-cta",
          ],
          "landing_page",
        );
        validateLandingPageLeadForms("landing_page", c, errors, page);
      }
      break;
    case "thank_you_page":
      if (renderMode === "html_snippet") {
        if (!hasHtml) {
          errors.push("thank_you_page html_snippet requires html.body");
        }
      } else {
        requireTypes(["page-hero"], "thank_you_page");
      }
      if (page.seo?.noindex !== true) {
        warnings.push("thank_you_page should usually have seo.noindex true");
      }
      break;
    case "lead_magnet_page":
      requireTypes(["page-hero", "body-section", "lead-form"], "lead_magnet_page");
      break;
    case "webinar_page":
      requireTypes(
        ["page-hero", "body-section", "lead-form", "speaker-block", "webinar-urgency-block"],
        "webinar_page",
      );
      break;
    case "cta_page":
      requireTypes(["page-hero", "lead-form"], "cta_page");
      break;
    case "research_page":
      requireTypes(["body-section", "transcript-block"], "research_page");
      break;
    default:
      errors.push("Unknown contentType");
  }

  return { ok: errors.length === 0, errors, warnings, prepared };
}
