import { isValidSlug, normalizeSlug } from "@/lib/content/slug";
import { parseGhlTagStrategy } from "@/lib/ghl/tag-strategy";
import {
  parseArtifactBoxRows,
  parseBeforeAfterCol,
  parseBeforeAfterRows,
  parseCaseFileExchanges,
  parseEvidenceSignals,
  parseForensicArtifact,
  parseForensicDownloadForm,
  parseLayerDiagram,
  parseMicroProof,
  parseMoments,
  parseWhyMissBlocks,
  parseSherpaNameplate,
  parseSherpaOps,
  parseStatBlock,
  parseSummaryRows,
  parseToolStrip,
  parseVerdictRows,
} from "@/lib/zenith/parse-variant-fields";
import {
  applyLandingPageLeadFormDefaults,
  validateLandingPageLeadForms,
} from "@/lib/zenith/lead-form-rules";
import { applyAutoThankYouPageUrls } from "@/lib/zenith/thank-you-link";
import {
  parseRenderMode,
  parseZenithHtmlSnippet,
  parseZenithSlots,
  validateHtmlSlotsAlignment,
} from "@/lib/zenith/parse-html-fields";
import { parseZenithPageLayout } from "@/lib/zenith/page-layout";
import {
  ZENITH_COMPONENT_TYPES,
  ZENITH_CONTENT_TYPES,
  ZENITH_OG_TEMPLATES,
  type OgImageTemplate,
  type BodySectionComponent,
  type ComparisonTableComponent,
  type PageHeroComponent,
  type ResearchCalloutComponent,
  type TranscriptBlockComponent,
  type HtmlSectionComponent,
  type ZenithComponent,
  type ZenithContentType,
  type ZenithCta,
  type ZenithOgImage,
  type ZenithPage,
  type ZenithPageRenderMode,
  type ZenithPageStatus,
  type ZenithSeo,
} from "@/types/zenith-content";

const COMPONENT_SET = new Set<string>(ZENITH_COMPONENT_TYPES as unknown as string[]);
const CONTENT_SET = new Set<string>(ZENITH_CONTENT_TYPES);
const OG_TEMPLATE_SET = new Set<string>(ZENITH_OG_TEMPLATES);

/** @see normalizeSlug in `@/lib/content/slug` — re-exported for Zenith helpers per Phase 11 spec */
export { normalizeSlug } from "@/lib/content/slug";

export function sanitizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const v of value) {
    if (typeof v === "string") {
      const t = v.trim();
      if (t) out.push(t);
    }
  }
  return out;
}

export function isUrlSafeSlug(slug: string): boolean {
  return isValidSlug(slug);
}

export function isValidZenithComponentType(type: unknown): boolean {
  return typeof type === "string" && COMPONENT_SET.has(type);
}

function parseCta(raw: unknown): ZenithCta | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const label = typeof o.label === "string" ? o.label.trim() : "";
  const destination = typeof o.destination === "string" ? o.destination.trim() : "";
  if (!label || !destination) return undefined;
  return { label, destination };
}

function validateComponent(
  raw: unknown,
  errors: string[],
  index: number,
  pageSlug?: string,
): ZenithComponent | null {
  if (!raw || typeof raw !== "object") {
    errors.push(`components[${index}] must be an object`);
    return null;
  }
  const o = raw as Record<string, unknown>;
  const type = o.type;
  if (!isValidZenithComponentType(type)) {
    errors.push(`components[${index}]: unknown or missing type`);
    return null;
  }
  switch (type) {
    case "aeo-answer-block": {
      if (typeof o.answer !== "string" || !o.answer.trim()) {
        errors.push(`components[${index}] aeo-answer-block requires answer`);
        return null;
      }
      return { type, answer: o.answer.trim() };
    }
    case "faq-section": {
      if (!Array.isArray(o.faqs) || o.faqs.length === 0) {
        errors.push(`components[${index}] faq-section requires faqs array`);
        return null;
      }
      const faqs: { question: string; answer: string }[] = [];
      for (const f of o.faqs) {
        if (!f || typeof f !== "object") continue;
        const q = (f as { question?: unknown }).question;
        const a = (f as { answer?: unknown }).answer;
        if (typeof q === "string" && typeof a === "string" && q.trim() && a.trim()) {
          faqs.push({ question: q.trim(), answer: a.trim() });
        }
      }
      if (!faqs.length) {
        errors.push(`components[${index}] faq-section requires valid faqs`);
        return null;
      }
      return { type, faqs };
    }
    case "lead-form": {
      if (typeof o.variant !== "string" || !o.variant.trim()) {
        errors.push(`components[${index}] lead-form requires variant`);
        return null;
      }
      if (typeof o.destination !== "string" || !o.destination.trim()) {
        errors.push(`components[${index}] lead-form requires destination`);
        return null;
      }
      const ghlTagStrategy = parseGhlTagStrategy(o.ghlTagStrategy);
      const legacyGhlTags = ghlTagStrategy ? [] : sanitizeStringArray(o.ghlTags);
      return {
        type,
        variant: o.variant.trim(),
        destination: o.destination.trim(),
        headline: typeof o.headline === "string" ? o.headline : undefined,
        description: typeof o.description === "string" ? o.description : undefined,
        ctaText: typeof o.ctaText === "string" ? o.ctaText : undefined,
        fields: sanitizeStringArray(o.fields),
        ghlTags: legacyGhlTags.length ? legacyGhlTags : undefined,
        ghlTagStrategy,
        thankYouMessage: typeof o.thankYouMessage === "string" ? o.thankYouMessage : undefined,
        thankYouPageUrl:
          typeof o.thankYouPageUrl === "string"
            ? o.thankYouPageUrl.trim() || undefined
            : typeof o.redirect === "string"
              ? o.redirect.trim() || undefined
              : undefined,
        redirect:
          typeof o.redirect === "string" && o.redirect.trim() ? o.redirect.trim() : undefined,
        acceptedFileTypes: sanitizeStringArray(o.acceptedFileTypes),
      };
    }
    case "transcript-block": {
      const variant = typeof o.variant === "string" ? o.variant : undefined;
      const caseEx = parseCaseFileExchanges(o.exchanges);
      const legacyEx = Array.isArray(o.exchanges)
        ? (o.exchanges as Array<{ speaker: string; line: string }>)
        : undefined;
      const hasTs = typeof o.timestamp === "string" && o.timestamp.trim();
      const exCount = caseEx?.length ?? legacyEx?.length ?? 0;
      const sig = Array.isArray(o.signals) ? o.signals.length : 0;
      const caseLabel = typeof o.caseLabel === "string" && o.caseLabel.trim();
      const summary = parseSummaryRows(o.summary);
      if (!hasTs && !exCount && !sig && !caseLabel && !summary?.length) {
        errors.push(`components[${index}] transcript-block needs timestamp, exchanges, or signals`);
        return null;
      }
      return {
        type,
        variant,
        timestamp: typeof o.timestamp === "string" ? o.timestamp : undefined,
        caseLabel: typeof o.caseLabel === "string" ? o.caseLabel : undefined,
        verdictBadge: typeof o.verdictBadge === "string" ? o.verdictBadge : undefined,
        attribution: typeof o.attribution === "string" ? o.attribution : undefined,
        exchanges: variant === "case-file" && caseEx?.length ? caseEx : legacyEx,
        summary: summary as TranscriptBlockComponent["summary"],
        signals: Array.isArray(o.signals)
          ? (o.signals as Array<{ label: string; description?: string }>)
          : undefined,
        verdict: typeof o.verdict === "string" ? o.verdict : undefined,
      };
    }
    case "page-hero":
      return {
        type,
        eyebrow: typeof o.eyebrow === "string" ? o.eyebrow : undefined,
        headline: typeof o.headline === "string" ? o.headline : undefined,
        headlineHighlight:
          typeof o.headlineHighlight === "string" ? o.headlineHighlight : undefined,
        subheadline: typeof o.subheadline === "string" ? o.subheadline : undefined,
        bullets: sanitizeStringArray(o.bullets),
        microcopy: typeof o.microcopy === "string" ? o.microcopy : undefined,
        microProof: parseMicroProof(o.microProof),
        primaryCta: parseCta(o.primaryCta),
        secondaryCta: parseCta(o.secondaryCta),
        forensicArtifact: parseForensicArtifact(o.forensicArtifact),
        tools: parseToolStrip(o.tools) as PageHeroComponent["tools"],
        sbiBadge: typeof o.sbiBadge === "string" ? o.sbiBadge : undefined,
        proofLine: typeof o.proofLine === "string" ? o.proofLine : undefined,
        variant: typeof o.variant === "string" ? o.variant : undefined,
      };
    case "body-section":
      return {
        type,
        variant: typeof o.variant === "string" ? o.variant : undefined,
        heading: typeof o.heading === "string" ? o.heading : undefined,
        body: typeof o.body === "string" ? o.body : undefined,
        bullets: sanitizeStringArray(o.bullets),
        emphasis:
          o.emphasis === null ? null : typeof o.emphasis === "string" ? o.emphasis : undefined,
        kicker: typeof o.kicker === "string" ? o.kicker : undefined,
        stat: parseStatBlock(o.stat),
        fileLabel: typeof o.fileLabel === "string" ? o.fileLabel : undefined,
        fileBadge: typeof o.fileBadge === "string" ? o.fileBadge : undefined,
        paragraphs: sanitizeStringArray(o.paragraphs),
        verdictRows: parseVerdictRows(o.verdictRows) as BodySectionComponent["verdictRows"],
        diagram: parseLayerDiagram(o.diagram),
        label: typeof o.label === "string" ? o.label : undefined,
        nameplate: parseSherpaNameplate(o.nameplate),
        ops: parseSherpaOps(o.ops) as BodySectionComponent["ops"],
        closingLine: typeof o.closingLine === "string" ? o.closingLine : undefined,
      };
    case "signal-breakdown": {
      const variant = typeof o.variant === "string" ? o.variant : undefined;
      const evidence = parseEvidenceSignals(o.signals);
      const legacy = Array.isArray(o.signals)
        ? (o.signals as Array<{ label: string; detail?: string }>)
        : undefined;
      return {
        type,
        variant,
        intro: typeof o.intro === "string" ? o.intro : undefined,
        heading: typeof o.heading === "string" ? o.heading : undefined,
        subheading: typeof o.subheading === "string" ? o.subheading : undefined,
        signals: variant === "evidence-cards" && evidence?.length ? evidence : legacy,
      };
    }
    case "inline-cta":
      return {
        type,
        variant: typeof o.variant === "string" ? o.variant : undefined,
        headline: typeof o.headline === "string" ? o.headline : undefined,
        subtext: typeof o.subtext === "string" ? o.subtext : undefined,
        body: typeof o.body === "string" ? o.body : undefined,
        cta: parseCta(o.cta),
      };
    case "footer-cta":
      return {
        type,
        variant: typeof o.variant === "string" ? o.variant : undefined,
        headline: typeof o.headline === "string" ? o.headline : undefined,
        body: typeof o.body === "string" ? o.body : undefined,
        cta: parseCta(o.cta),
      };
    case "credibility-bar": {
      const text = typeof o.text === "string" ? o.text.trim() : "";
      if (!text) {
        errors.push(`components[${index}] credibility-bar requires text`);
        return null;
      }
      return {
        type,
        variant: typeof o.variant === "string" ? o.variant : undefined,
        text,
        emphasis: sanitizeStringArray(o.emphasis),
      };
    }
    case "moment-list": {
      const moments = parseMoments(o.moments);
      if (!moments?.length) {
        errors.push(
          `components[${index}] moment-list requires moments with at least one title or description`,
        );
        return null;
      }
      return {
        type,
        variant: typeof o.variant === "string" ? o.variant : undefined,
        kicker: typeof o.kicker === "string" ? o.kicker : undefined,
        heading: typeof o.heading === "string" ? o.heading : undefined,
        subheading: typeof o.subheading === "string" ? o.subheading : undefined,
        moments,
      };
    }
    case "why-miss-section": {
      const heading = typeof o.heading === "string" ? o.heading.trim() : "";
      const blocks = parseWhyMissBlocks(o.blocks);
      if (!heading && !blocks?.length) {
        errors.push(`components[${index}] why-miss-section requires heading or blocks`);
        return null;
      }
      return {
        type,
        variant: typeof o.variant === "string" ? o.variant : undefined,
        kicker: typeof o.kicker === "string" ? o.kicker : undefined,
        heading: heading || undefined,
        blocks,
        closing: typeof o.closing === "string" ? o.closing : undefined,
      };
    }
    case "forensic-download-section": {
      const heading = typeof o.heading === "string" ? o.heading.trim() : "";
      const form = parseForensicDownloadForm(o.form);
      const cardRaw = o.card;
      let card: import("@/types/zenith-content").ForensicDownloadSectionComponent["card"];
      if (cardRaw && typeof cardRaw === "object") {
        const c = cardRaw as Record<string, unknown>;
        card = {
          eyebrow: typeof c.eyebrow === "string" ? c.eyebrow : undefined,
          title: typeof c.title === "string" ? c.title : undefined,
          subtitle: typeof c.subtitle === "string" ? c.subtitle : undefined,
          previewTitle: typeof c.previewTitle === "string" ? c.previewTitle : undefined,
          previewDetail: typeof c.previewDetail === "string" ? c.previewDetail : undefined,
          caseLabel: typeof c.caseLabel === "string" ? c.caseLabel : undefined,
          nextStep: typeof c.nextStep === "string" ? c.nextStep : undefined,
          privacy: typeof c.privacy === "string" ? c.privacy : undefined,
        };
      }
      if (!heading && !card && !form) {
        errors.push(
          `components[${index}] forensic-download-section requires heading, card, or form`,
        );
        return null;
      }
      if (o.form && !form) {
        errors.push(`components[${index}] forensic-download-section form requires destination`);
        return null;
      }
      return {
        type,
        variant: typeof o.variant === "string" ? o.variant : undefined,
        id: typeof o.id === "string" ? o.id : undefined,
        kicker: typeof o.kicker === "string" ? o.kicker : undefined,
        heading: heading || undefined,
        paragraphs: sanitizeStringArray(o.paragraphs),
        tension: typeof o.tension === "string" ? o.tension : undefined,
        legalNote: typeof o.legalNote === "string" ? o.legalNote : undefined,
        card,
        form,
      };
    }
    case "lead-magnet-callout":
      return {
        type,
        slug: typeof o.slug === "string" ? o.slug : undefined,
        title: typeof o.title === "string" ? o.title : undefined,
        description: typeof o.description === "string" ? o.description : undefined,
        ctaText: typeof o.ctaText === "string" ? o.ctaText : undefined,
        destination: typeof o.destination === "string" ? o.destination : undefined,
      };
    case "quote-block":
      return {
        type,
        variant: typeof o.variant === "string" ? o.variant : undefined,
        quote: typeof o.quote === "string" ? o.quote : undefined,
        attribution: typeof o.attribution === "string" ? o.attribution : undefined,
        speakerLabel: typeof o.speakerLabel === "string" ? o.speakerLabel : undefined,
        reviewLabel: typeof o.reviewLabel === "string" ? o.reviewLabel : undefined,
        reviewLine: typeof o.reviewLine === "string" ? o.reviewLine : undefined,
        theme: typeof o.theme === "string" ? o.theme : undefined,
      };
    case "research-callout": {
      const rows = parseArtifactBoxRows(o.rows);
      return {
        type,
        variant: typeof o.variant === "string" ? o.variant : undefined,
        claim: typeof o.claim === "string" ? o.claim : undefined,
        context: typeof o.context === "string" ? o.context : undefined,
        caveat: typeof o.caveat === "string" ? o.caveat : undefined,
        rows: rows as ResearchCalloutComponent["rows"],
      };
    }
    case "speaker-block":
      return {
        type,
        name: typeof o.name === "string" ? o.name : undefined,
        title: typeof o.title === "string" ? o.title : undefined,
        bio: typeof o.bio === "string" ? o.bio : undefined,
        photoUrl: typeof o.photoUrl === "string" ? o.photoUrl : undefined,
      };
    case "webinar-urgency-block":
      return {
        type,
        eventDate: typeof o.eventDate === "string" ? o.eventDate : undefined,
        seatsRemaining: typeof o.seatsRemaining === "number" ? o.seatsRemaining : null,
        message: typeof o.message === "string" ? o.message : undefined,
        cta: parseCta(o.cta),
      };
    case "comparison-table": {
      const variant = typeof o.variant === "string" ? o.variant : undefined;
      const flatRows = parseBeforeAfterRows(o.rows);
      return {
        type,
        variant,
        caption: typeof o.caption === "string" ? o.caption : undefined,
        heading: typeof o.heading === "string" ? o.heading : undefined,
        columns: sanitizeStringArray(o.columns),
        rows:
          variant === "before-after" && flatRows?.length
            ? undefined
            : Array.isArray(o.rows)
              ? (o.rows as string[][])
              : undefined,
        colA: parseBeforeAfterCol(o.colA),
        colB: parseBeforeAfterCol(o.colB),
        flatRows: flatRows as ComparisonTableComponent["flatRows"],
      };
    }
    case "html-section": {
      const html = parseZenithHtmlSnippet(o.html, errors, `components[${index}].html`, {
        pageSlug,
      });
      if (!html?.sanitizedBody) {
        errors.push(`components[${index}]: html.body is required for html-section`);
        return null;
      }
      return {
        type,
        variant: typeof o.variant === "string" ? o.variant : undefined,
        html,
        slots: parseZenithSlots(o.slots, errors, []),
      } as HtmlSectionComponent;
    }
    default: {
      errors.push(`components[${index}]: unsupported type ${String(type)}`);
      return null;
    }
  }
}

function normalizeOgImage(raw: unknown, errors: string[]): ZenithOgImage {
  if (!raw || typeof raw !== "object") {
    errors.push("ogImage is required");
    return {};
  }
  const o = raw as Record<string, unknown>;
  const cdnUrl = typeof o.cdnUrl === "string" && o.cdnUrl.trim() ? o.cdnUrl.trim() : undefined;
  const templateRaw = typeof o.template === "string" ? o.template.trim() : undefined;
  const template =
    templateRaw && OG_TEMPLATE_SET.has(templateRaw) ? (templateRaw as OgImageTemplate) : undefined;
  if (!cdnUrl && !template) {
    errors.push("ogImage must include cdnUrl or a valid template");
  }
  if (templateRaw && !template) {
    errors.push(`Invalid ogImage.template: ${templateRaw}`);
  }
  return {
    cdnUrl,
    template,
    headline: typeof o.headline === "string" ? o.headline : undefined,
    subhead: typeof o.subhead === "string" ? o.subhead : undefined,
    signal: typeof o.signal === "string" ? o.signal : undefined,
  };
}

function normalizeSeo(raw: unknown): ZenithSeo {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  return {
    metaTitle: typeof o.metaTitle === "string" ? o.metaTitle : undefined,
    metaDescription: typeof o.metaDescription === "string" ? o.metaDescription : undefined,
    canonicalPath: typeof o.canonicalPath === "string" ? o.canonicalPath : undefined,
    noindex: typeof o.noindex === "boolean" ? o.noindex : undefined,
    ogTitle: typeof o.ogTitle === "string" ? o.ogTitle : undefined,
    ogDescription: typeof o.ogDescription === "string" ? o.ogDescription : undefined,
  };
}

type ZenithParseMode = "ingest" | "document";

export type ValidateZenithPageOptions = {
  /** Bulk ingest: skip landing thank-you checks until `applyAutoThankYouPageUrls` runs on the full batch. */
  deferLandingThankYou?: boolean;
};

function validateZenithPageCore(
  payload: unknown,
  mode: ZenithParseMode,
  options?: ValidateZenithPageOptions,
): {
  ok: boolean;
  errors: string[];
  warnings: string[];
  normalized?: ZenithPage;
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!payload || typeof payload !== "object") {
    return { ok: false, errors: ["Payload must be an object"], warnings: [] };
  }
  const p = payload as Record<string, unknown>;

  if (p.source !== "zenithmind") {
    errors.push('source must be exactly "zenithmind"');
  }
  const ct = p.contentType;
  if (typeof ct !== "string" || !CONTENT_SET.has(ct)) {
    errors.push("contentType must be a supported Zenith content type");
  }
  const slugRaw = typeof p.slug === "string" ? p.slug : "";
  const slug = normalizeSlug(slugRaw.replace(/^\/+|\/+$/g, ""));
  if (!slug || !isUrlSafeSlug(slug)) {
    errors.push("slug is required and must be URL-safe");
  }
  const id =
    typeof p.id === "string" && p.id.trim()
      ? normalizeSlug(p.id.trim().replace(/^\/+|\/+$/g, ""))
      : slug;

  let status: ZenithPageStatus = "draft";
  if (mode === "document") {
    const st = p.status;
    if (st === "published") {
      status = "published";
    } else if (st === "draft" || st === undefined || st === null) {
      status = "draft";
    } else {
      errors.push("status must be draft or published");
    }
  }

  const html = parseZenithHtmlSnippet(p.html, errors, "page", { pageSlug: slug });
  const slots = parseZenithSlots(p.slots, errors, warnings);
  const layout = parseZenithPageLayout(p.layout, errors, "page");
  const renderMode: ZenithPageRenderMode = parseRenderMode(p.renderMode, Boolean(html));

  if (layout?.hideGlobalFooter && renderMode !== "html_snippet") {
    warnings.push(
      "layout.hideGlobalFooter only applies to renderMode html_snippet; flag will be ignored",
    );
  }

  const componentsRaw = p.components;
  const components: ZenithComponent[] = [];
  if (Array.isArray(componentsRaw)) {
    componentsRaw.forEach((c, i) => {
      const parsed = validateComponent(c, errors, i, slug);
      if (parsed) {
        components.push(parsed);
      }
    });
    if (componentsRaw.length > 0 && components.length !== componentsRaw.length) {
      errors.push("Every component must validate successfully");
    }
  } else if (renderMode === "components") {
    errors.push("components must be an array");
  }

  if (renderMode === "components" || renderMode === "hybrid") {
    if (!components.length) {
      errors.push("components must be a non-empty array for renderMode components or hybrid");
    }
  }
  if (renderMode === "html_snippet" || renderMode === "hybrid") {
    if (!html?.sanitizedBody) {
      errors.push("html.body is required for renderMode html_snippet or hybrid");
    }
    validateHtmlSlotsAlignment(html, slots, errors, warnings);
  }
  if (renderMode === "html_snippet" && components.length > 0) {
    warnings.push(
      "html_snippet page includes components[]; they are ignored unless renderMode is hybrid",
    );
  }

  const seo = normalizeSeo(p.seo);
  const ogImage = normalizeOgImage(p.ogImage, errors);

  const contentType = ct as ZenithContentType;
  const pageTitle = typeof p.title === "string" ? p.title.trim() : undefined;
  const thankYouPageTitle =
    typeof p.thankYouPageTitle === "string" ? p.thankYouPageTitle.trim() : undefined;
  const leadMagnetId = typeof p.leadMagnetId === "string" ? p.leadMagnetId.trim() : undefined;

  if (components.length > 0 && CONTENT_SET.has(ct as string)) {
    applyLandingPageLeadFormDefaults(contentType, components);
  }

  if (contentType === "landing_page" && !options?.deferLandingThankYou) {
    applyAutoThankYouPageUrls([
      {
        id: id!,
        source: "zenithmind",
        contentType,
        status,
        slug: slug!,
        title: pageTitle,
        thankYouPageTitle,
        leadMagnetId,
        seo,
        ogImage,
        renderMode,
        html,
        slots: slots.length ? slots : undefined,
        components,
        componentSpecVersion: "1.2",
      },
    ]);
    validateLandingPageLeadForms(contentType, components, errors, {
      slots,
      renderMode,
      html,
    });
  }

  if (contentType === "landing_page" && slots.length) {
    for (const slot of slots) {
      if (slot.type === "lead-form") {
        slot.fields = ["name", "email"];
      }
    }
  }

  if (errors.length) {
    return { ok: false, errors, warnings };
  }

  const normalized: ZenithPage = {
    id: id!,
    source: "zenithmind",
    contentType,
    status: mode === "ingest" ? "draft" : status,
    slug: slug!,
    title: pageTitle,
    thankYouPageTitle,
    seo,
    ogImage,
    keyword:
      p.keyword && typeof p.keyword === "object"
        ? (p.keyword as Record<string, unknown>)
        : undefined,
    leadMagnetId,
    relatedArticleSlugs: sanitizeStringArray(p.relatedArticleSlugs),
    schema:
      p.schema && typeof p.schema === "object" ? (p.schema as Record<string, unknown>) : undefined,
    ghlTagStrategy: parseGhlTagStrategy(p.ghlTagStrategy),
    renderMode,
    html,
    slots: slots.length ? slots : undefined,
    layout,
    components,
    componentSpecVersion: "1.2",
    submittedBy: typeof p.submittedBy === "string" ? p.submittedBy : "zenithmind",
    version: typeof p.version === "number" ? p.version : undefined,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    publishedAt: p.publishedAt,
    lastSubmittedAt: p.lastSubmittedAt,
  };

  return { ok: true, errors: [], warnings, normalized };
}

/** Validates a stored or merged page; preserves `draft` / `published` when valid. */
export function validateZenithPageDocument(
  payload: unknown,
  options?: ValidateZenithPageOptions,
): {
  ok: boolean;
  errors: string[];
  normalized?: ZenithPage;
} {
  return validateZenithPageCore(payload, "document", options);
}

/** ZenithMind ingestion: same shape checks; response status is always forced to `draft`. */
export function validateZenithPagePayload(
  payload: unknown,
  options?: ValidateZenithPageOptions,
): {
  ok: boolean;
  errors: string[];
  warnings?: string[];
  normalized?: ZenithPage;
} {
  const r = validateZenithPageCore(payload, "ingest", options);
  if (!r.ok || !r.normalized) {
    return { ok: r.ok, errors: r.errors, warnings: r.warnings };
  }
  return {
    ok: true,
    errors: [],
    warnings: r.warnings,
    normalized: {
      ...r.normalized,
      status: "draft",
      submittedBy: r.normalized.submittedBy ?? "zenithmind",
    },
  };
}
