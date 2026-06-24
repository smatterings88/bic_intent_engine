import type { TimestampLike } from "./content";

export type Lead = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;

  sourcePage: string;
  landingPageSlug?: string;
  articleSlug?: string;
  leadMagnetId?: string;
  /** Present for landing-page opt-ins (Phase 9). */
  campaignType?: string;

  utm: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };

  ghl: {
    contactId?: string;
    status: "pending" | "found" | "created" | "updated" | "tagged" | "failed";
    tagsApplied: string[];
    lastSyncedAt?: TimestampLike;
    error?: string;
  };

  createdAt: TimestampLike;
  updatedAt: TimestampLike;
};
