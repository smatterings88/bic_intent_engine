export type ZenithContentType =
  | "article"
  | "landing_page"
  | "lead_magnet_page"
  | "webinar_page"
  | "cta_page"
  | "thank_you_page"
  | "research_page";

/** How page body is rendered. Default / omitted = `components` (legacy structured JSON). */
export type ZenithPageRenderMode = "components" | "html_snippet" | "hybrid";

export type ZenithSuccessBehavior =
  | {
      type: "redirect";
      targetType: "thank_you_page";
      targetSlug: string;
    }
  | {
      type: "inline_message";
      message: string;
    };

export type ZenithHtmlFramework = "bootstrap" | "plain" | "custom" | (string & {});

export type ZenithHtmlSnippet = {
  framework?: ZenithHtmlFramework;
  /** Raw HTML from ZenithMind (ingest only; prefer sanitizedBody at render). */
  body?: string;
  /** Sanitized HTML stored at ingest. */
  sanitizedBody?: string;
  /** Page-specific CSS from ZenithMind (ingest only; use sanitizedCss at render). No &lt;style&gt; in body. */
  css?: string;
  /** Scoped, sanitized CSS stored at ingest. */
  sanitizedCss?: string;
};

export type ZenithSlotConfig = {
  slot: string;
  type: "lead-form" | "cta";
  variant?: string;
  destination?: string;
  headline?: string;
  description?: string;
  ctaText?: string;
  fields?: string[];
  successBehavior?: ZenithSuccessBehavior;
  ghlTagStrategy?: GhlTagStrategy;
  ghlTags?: string[];
  thankYouMessage?: string;
  thankYouPageUrl?: string;
  redirect?: string;
  /** CTA slot only */
  label?: string;
  href?: string;
};

export type ZenithRelationship = {
  from: string;
  to: string;
  type: "form_success_redirect";
  slot: string;
};

export type ZenithPageLayout = {
  /** When true on `html_snippet` pages, suppresses the global SBI marketing footer. */
  hideGlobalFooter?: boolean;
};

export type ZenithBatchPayload = {
  source: "zenithmind";
  batchId?: string;
  items: ZenithPage[];
  relationships?: ZenithRelationship[];
};

export type ZenithPageStatus = "draft" | "published";

export type OgImageTemplate =
  | "forensic-article"
  | "webinar-event"
  | "lead-magnet"
  | "research-report"
  | "cta-upload";

export type ZenithOgImage = {
  cdnUrl?: string;
  template?: OgImageTemplate;
  headline?: string;
  subhead?: string;
  signal?: string;
};

export type ZenithSeo = {
  metaTitle?: string;
  metaDescription?: string;
  canonicalPath?: string;
  noindex?: boolean;
  ogTitle?: string;
  ogDescription?: string;
};

export type ZenithCta = {
  label: string;
  destination: string;
};

export type GhlTagStrategyMode = "merge" | "replace" | "suppress";

export type GhlTagStrategy = {
  mode: GhlTagStrategyMode;
  tags?: string[];
};

export type ForensicArtifactExchange = {
  timestamp?: string;
  speaker?: string;
  line: string;
  highlight?: string;
  marker?: string;
  markerTone?: "green" | "amber" | "red" | "deepRed" | string;
  annotation?: string;
};

export type ForensicWaveformBar = {
  tone?: "green" | "amber" | "red" | "deepRed" | "g" | "a" | "r" | "rr" | string;
  height?: number;
};

export type ForensicArtifact = {
  caseId?: string;
  status?: string;
  waveform?: ForensicWaveformBar[];
  driftPositionPercent?: number;
  driftLabel?: string;
  timestamps?: string[];
  exchanges?: ForensicArtifactExchange[];
  verdictLabel?: string;
  verdict?: string;
  footer?: string;
};

export type PageHeroMicroProof = {
  buyerLabel?: string;
  buyerLine?: string;
  analysisLabel?: string;
  analysisLine?: string;
};

export type PageHeroComponent = {
  type: "page-hero";
  eyebrow?: string;
  headline?: string;
  headlineHighlight?: string;
  subheadline?: string;
  bullets?: string[];
  microcopy?: string;
  microProof?: PageHeroMicroProof;
  primaryCta?: ZenithCta;
  secondaryCta?: ZenithCta;
  forensicArtifact?: ForensicArtifact;
  tools?: Array<{ name: string; detail?: string }>;
  sbiBadge?: string;
  proofLine?: string;
  variant?: "default" | "minimal" | "webinar" | "forensic-navy" | "tool-strip" | string;
};

export type AeoAnswerBlockComponent = {
  type: "aeo-answer-block";
  answer: string;
};

export type BodySectionStat = {
  premise?: string;
  number?: string;
  consequence?: string;
};

export type BodySectionLayerDiagram = {
  recordingLayer?: { icon?: string; label?: string; tools?: string; outputs?: string };
  interpretationLayer?: { icon?: string; label?: string; tools?: string; outputs?: string };
  caption?: string;
};

export type BodySectionComponent = {
  type: "body-section";
  variant?: "stat-callout" | "story-file" | "layer-diagram" | "sherpa-bridge" | string;
  heading?: string;
  body?: string;
  bullets?: string[];
  emphasis?: "callout" | null | string;
  kicker?: string;
  stat?: BodySectionStat;
  fileLabel?: string;
  fileBadge?: string;
  paragraphs?: string[];
  verdictRows?: Array<{ label: string; value: string }>;
  diagram?: BodySectionLayerDiagram;
  label?: string;
  nameplate?: { name?: string; descriptor?: string; scope?: string[] };
  ops?: Array<{ label: string; value: string }>;
  closingLine?: string;
};

export type TranscriptCaseFileMarker = {
  type?: string;
  label?: string;
  description?: string;
  note?: string;
};

export type TranscriptCaseFileExchange = {
  timestamp?: string;
  salesperson?: string;
  buyer?: string;
  marker?: TranscriptCaseFileMarker;
};

export type TranscriptBlockComponent = {
  type: "transcript-block";
  variant?: "case-file" | string;
  timestamp?: string;
  caseLabel?: string;
  verdictBadge?: string;
  attribution?: string;
  exchanges?: Array<{ speaker: string; line: string } | TranscriptCaseFileExchange>;
  summary?: Array<{ label: string; value: string; highlight?: boolean }>;
  signals?: Array<{ label: string; description?: string }>;
  verdict?: "deal-alive" | "deal-shifted" | "deal-dead" | string;
};

export type SignalBreakdownComponent = {
  type: "signal-breakdown";
  variant?: "evidence-cards" | string;
  intro?: string;
  heading?: string;
  subheading?: string;
  signals?: Array<
    { label: string; detail?: string } | { number?: string; label: string; description?: string }
  >;
};

export type InlineCtaComponent = {
  type: "inline-cta";
  variant?: "urgency" | "outcome" | "full-block" | string;
  headline?: string;
  subtext?: string;
  body?: string;
  cta?: ZenithCta;
};

export type FaqSectionComponent = {
  type: "faq-section";
  faqs: Array<{ question: string; answer: string }>;
};

export type LeadFormComponent = {
  type: "lead-form";
  variant: "lead-magnet-capture" | "call-upload" | "webinar-signup" | "contact" | string;
  headline?: string;
  description?: string;
  ctaText?: string;
  destination: string;
  fields?: string[];
  /** @deprecated Prefer `ghlTagStrategy`. Merged into defaults when no component strategy is set. */
  ghlTags?: string[];
  ghlTagStrategy?: GhlTagStrategy;
  thankYouMessage?: string;
  /** After submit + GHL sync, redirect here (path e.g. `/cta/ty-slug` or absolute URL). Required for `landing_page`. */
  thankYouPageUrl?: string;
  /** @deprecated Use `thankYouPageUrl`. */
  redirect?: string;
  acceptedFileTypes?: string[];
};

export type FooterCtaComponent = {
  type: "footer-cta";
  variant?: "forensic-final" | string;
  headline?: string;
  body?: string;
  cta?: ZenithCta;
};

export type CredibilityBarComponent = {
  type: "credibility-bar";
  variant?: "forensic" | string;
  text?: string;
  emphasis?: string[];
};

export type MomentListComponent = {
  type: "moment-list";
  variant?: "forensic-moments" | string;
  kicker?: string;
  heading?: string;
  subheading?: string;
  moments?: Array<{
    number?: string;
    timestamp?: string;
    title?: string;
    description?: string;
    snippet?: string;
    signal?: string;
  }>;
};

export type WhyMissSectionComponent = {
  type: "why-miss-section";
  variant?: "forensic" | string;
  kicker?: string;
  heading?: string;
  blocks?: Array<{
    number?: string;
    title?: string;
    body?: string;
  }>;
  closing?: string;
};

export type ForensicDownloadSectionComponent = {
  type: "forensic-download-section";
  variant?: "evidence-file" | string;
  id?: string;
  kicker?: string;
  heading?: string;
  paragraphs?: string[];
  tension?: string;
  legalNote?: string;
  card?: {
    eyebrow?: string;
    title?: string;
    subtitle?: string;
    previewTitle?: string;
    previewDetail?: string;
    caseLabel?: string;
    nextStep?: string;
    privacy?: string;
  };
  form?: {
    destination: string;
    ctaText?: string;
    fields?: string[];
    ghlTags?: string[];
    ghlTagStrategy?: GhlTagStrategy;
    thankYouPageUrl?: string;
    /** @deprecated Use `thankYouPageUrl`. */
    redirect?: string;
    source?: string;
    variant?: string;
    thankYouMessage?: string;
  };
};

export type LeadMagnetCalloutComponent = {
  type: "lead-magnet-callout";
  slug?: string;
  title?: string;
  description?: string;
  ctaText?: string;
  destination?: string;
};

export type QuoteBlockComponent = {
  type: "quote-block";
  variant?: "micro-proof" | string;
  quote?: string;
  attribution?: string;
  speakerLabel?: string;
  reviewLabel?: string;
  reviewLine?: string;
  theme?: "light" | "dark" | string;
};

export type ResearchCalloutComponent = {
  type: "research-callout";
  variant?: "artifact-box" | string;
  claim?: string;
  context?: string;
  caveat?: string;
  rows?: Array<{ key: string; value: string; style?: string }>;
};

export type SpeakerBlockComponent = {
  type: "speaker-block";
  name?: string;
  title?: string;
  bio?: string;
  photoUrl?: string;
};

export type WebinarUrgencyBlockComponent = {
  type: "webinar-urgency-block";
  eventDate?: string;
  seatsRemaining?: number | null;
  message?: string;
  cta?: ZenithCta;
};

export type HtmlSectionComponent = {
  type: "html-section";
  variant?: string;
  html: ZenithHtmlSnippet;
  slots?: ZenithSlotConfig[];
};

export type ComparisonTableComponent = {
  type: "comparison-table";
  variant?: "before-after" | string;
  caption?: string;
  heading?: string;
  columns?: string[];
  rows?: string[][];
  colA?: { label?: string; style?: string };
  colB?: { label?: string; style?: string };
  flatRows?: Array<{ a: string; b: string }>;
};

export type ZenithComponent =
  | PageHeroComponent
  | AeoAnswerBlockComponent
  | BodySectionComponent
  | TranscriptBlockComponent
  | SignalBreakdownComponent
  | InlineCtaComponent
  | FaqSectionComponent
  | LeadFormComponent
  | FooterCtaComponent
  | CredibilityBarComponent
  | MomentListComponent
  | WhyMissSectionComponent
  | ForensicDownloadSectionComponent
  | LeadMagnetCalloutComponent
  | QuoteBlockComponent
  | ResearchCalloutComponent
  | SpeakerBlockComponent
  | WebinarUrgencyBlockComponent
  | ComparisonTableComponent
  | HtmlSectionComponent;

export type ZenithPage = {
  id: string;
  source: "zenithmind";
  contentType: ZenithContentType;
  status: ZenithPageStatus;
  slug: string;
  title?: string;
  seo: ZenithSeo;
  ogImage: ZenithOgImage;
  keyword?: Record<string, unknown>;
  leadMagnetId?: string;
  /**
   * Optional: exact `title` of the paired `cta_page` thank-you page in the same bulk ingest.
   * When unset, the server matches TY pages by title key (TY title without "Thank You" ≈ LP title).
   */
  thankYouPageTitle?: string;
  relatedArticleSlugs?: string[];
  schema?: Record<string, unknown>;
  /** @default "components" */
  renderMode?: ZenithPageRenderMode;
  html?: ZenithHtmlSnippet;
  /** App-controlled form/CTA slots for html_snippet / hybrid pages. */
  slots?: ZenithSlotConfig[];
  /** Display flags (e.g. hide global footer when Zenith HTML includes its own). */
  layout?: ZenithPageLayout;
  components: ZenithComponent[];
  /** Applies to all lead-forms on the page unless a form defines its own `ghlTagStrategy`. */
  ghlTagStrategy?: GhlTagStrategy;
  componentSpecVersion: "1.2";
  createdAt?: unknown;
  updatedAt?: unknown;
  publishedAt?: unknown;
  lastSubmittedAt?: unknown;
  submittedBy?: string;
  version?: number;
};

export const ZENITH_CONTENT_TYPES: ZenithContentType[] = [
  "article",
  "landing_page",
  "lead_magnet_page",
  "webinar_page",
  "cta_page",
  "thank_you_page",
  "research_page",
];

export const ZENITH_PAGE_RENDER_MODES: ZenithPageRenderMode[] = [
  "components",
  "html_snippet",
  "hybrid",
];

export const ZENITH_OG_TEMPLATES: OgImageTemplate[] = [
  "forensic-article",
  "webinar-event",
  "lead-magnet",
  "research-report",
  "cta-upload",
];

export const ZENITH_COMPONENT_TYPES = [
  "page-hero",
  "aeo-answer-block",
  "body-section",
  "transcript-block",
  "signal-breakdown",
  "inline-cta",
  "faq-section",
  "lead-form",
  "footer-cta",
  "credibility-bar",
  "moment-list",
  "why-miss-section",
  "forensic-download-section",
  "lead-magnet-callout",
  "quote-block",
  "research-callout",
  "speaker-block",
  "webinar-urgency-block",
  "comparison-table",
  "html-section",
] as const;
