import type { TimestampLike } from "./content";

export type Submission = {
  id: string;
  userId?: string;
  email?: string;
  name?: string;

  transcriptText?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;

  sourcePage?: string;
  landingPageSlug?: string;

  status: "submitted" | "processing" | "completed" | "failed";

  createdAt: TimestampLike;
  updatedAt: TimestampLike;
};
