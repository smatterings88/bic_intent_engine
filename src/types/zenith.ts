import type { TimestampLike } from "./content";
import type { ArticleDraftInput } from "./article";
import type { LandingPageDraftInput } from "./landing-page";
import type { LeadMagnetDraftInput } from "./lead-magnet";

export type ZenithContentType = "article" | "landing_page" | "lead_magnet" | "batch";

export type ZenithIngestionStatus = "received" | "validated" | "saved" | "failed";

export type ZenithIngestion = {
  id: string;
  source: "zenithmind";
  contentType: ZenithContentType;
  status: ZenithIngestionStatus;
  rawPayload: unknown;
  targetCollection?: string;
  targetId?: string;
  validationErrors?: string[];
  createdAt: TimestampLike;
};

/** Single article payload from ZenithMind (no HTTP layer in Phase 3) */
export type ZenithArticlePayload = {
  article: ArticleDraftInput;
};

export type ZenithLandingPagePayload = {
  landingPage: LandingPageDraftInput;
};

export type ZenithLeadMagnetPayload = {
  leadMagnet: LeadMagnetDraftInput;
};

export type ZenithBatchPayload = {
  articles?: ArticleDraftInput[];
  landingPages?: LandingPageDraftInput[];
  leadMagnets?: LeadMagnetDraftInput[];
};
