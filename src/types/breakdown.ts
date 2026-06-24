import type { TimestampLike } from "./content";

export type Breakdown = {
  id: string;
  submissionId: string;
  userId?: string;

  summary: string;

  keyFailureMoments: {
    label: string;
    explanation: string;
    evidence?: string;
    correctedMove?: string;
  }[];

  score?: number;
  recommendedNextStep: string;

  createdAt: TimestampLike;
};
