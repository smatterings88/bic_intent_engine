import type {
  ContentSource,
  ContentStatus,
  LeadMagnetDeliveryType,
  TimestampLike,
} from "./content";

export type LeadMagnet = {
  id: string;
  source: ContentSource;
  status: ContentStatus;

  title: string;
  subtitle: string;
  description: string;

  ctaLabel: string;

  deliveryType: LeadMagnetDeliveryType;

  ghlTag: string;

  fileUrl?: string;

  sections?: {
    title: string;
    body?: string;
    items?: string[];
  }[];

  createdAt: TimestampLike;
  updatedAt: TimestampLike;
  publishedAt?: TimestampLike;
};

export type LeadMagnetDraftInput = Omit<LeadMagnet, "createdAt" | "updatedAt" | "publishedAt"> & {
  createdAt?: TimestampLike;
  updatedAt?: TimestampLike;
  publishedAt?: TimestampLike;
};
