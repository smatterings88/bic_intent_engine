import type {
  AeoFields,
  CampaignType,
  ContentSource,
  ContentStatus,
  NextStepType,
  TimestampLike,
} from "./content";
import type { GhlTagStrategy } from "./zenith-content";

export type LandingPageKeywordSearchIntent = "commercial" | "transactional" | "informational";

export type LandingPage = {
  id: string;
  source: ContentSource;
  contentType: "landing_page";
  status: ContentStatus;

  slug: string;

  campaignType: CampaignType;

  keyword: {
    primary: string;
    secondary: string[];
    longTail: string[];
    adGroups?: string[];
    searchIntent: LandingPageKeywordSearchIntent;
  };

  seo: {
    metaTitle: string;
    metaDescription: string;
    canonicalPath: string;
    noindex?: boolean;
  };

  hero: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel?: string;
    secondaryCtaHref?: string;
  };

  aeo: AeoFields;

  sections: {
    heading: string;
    body: string;
    bullets?: string[];
  }[];

  proof?: {
    stat?: string;
    explanation?: string;
    sourceLabel?: string;
  }[];

  primaryLeadMagnetId: string;
  leadMagnetIds: string[];

  conversion: {
    formType: "lead_magnet" | "webinar" | "upload" | "demo";
    ghlTags: string[];
    ghlTagStrategy?: GhlTagStrategy;
    thankYouMessage: string;
    nextStep: NextStepType;
  };

  relatedArticleSlugs: string[];
  relatedLandingPageSlugs: string[];

  schema: {
    type: "WebPage" | "FAQPage" | "Article";
  };

  createdAt: TimestampLike;
  updatedAt: TimestampLike;
  publishedAt?: TimestampLike;
};

export type LandingPageDraftInput = Omit<LandingPage, "createdAt" | "updatedAt" | "publishedAt"> & {
  createdAt?: TimestampLike;
  updatedAt?: TimestampLike;
  publishedAt?: TimestampLike;
};
