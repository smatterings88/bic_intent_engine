/** Lifecycle for articles, landing pages, lead magnets, etc. */
export type ContentStatus = "draft" | "review" | "published" | "archived";

/** @deprecated Use ContentStatus */
export type ArticleStatus = ContentStatus;

/** Where structured content originated */
export type ContentSource = "zenithmind" | "manual";

/** Primary search intent classification */
export type SearchIntent = "informational" | "commercial" | "transactional" | "navigational";

/** JSON-LD / structured data primary type hint */
export type SchemaType = "Article" | "BlogPosting" | "FAQPage" | "WebPage";

export type CampaignType = "seo" | "google_ad_grant" | "webinar" | "lead_magnet" | "upload_flow";

export type LeadMagnetDeliveryType = "pdf" | "email" | "webinar" | "demo" | "checklist";

export type NextStepType = "download" | "webinar" | "upload" | "book_call" | "sherpa_offer";

/** How to pick internal cross-links between articles */
export type RotationStrategy = "cluster" | "keyword" | "mixed";

/** Placeholder until Firestore Timestamp normalization is centralized */
export type TimestampLike = unknown;

/** Core keyword bundle (articles; landing pages extend in their own type) */
export type KeywordSet = {
  primary: string;
  secondary: string[];
  longTail: string[];
  searchIntent: SearchIntent;
};

export type SeoFields = {
  metaTitle: string;
  metaDescription: string;
  canonicalPath: string;
  noindex?: boolean;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type AeoFields = {
  answerBlock: string;
  faqs: FaqItem[];
};

/** Internal or editorial link reference (e.g. for rotations later) */
export type RelatedLink = {
  slug: string;
  title?: string;
};

export type UtmFields = {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
};
