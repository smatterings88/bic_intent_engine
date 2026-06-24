import type {
  AeoFields,
  ContentSource,
  ContentStatus,
  RotationStrategy,
  SearchIntent,
  TimestampLike,
} from "./content";

export type Article = {
  id: string;
  source: ContentSource;
  contentType: "article";
  status: ContentStatus;

  slug: string;
  title: string;
  subtitle?: string;

  keyword: {
    primary: string;
    secondary: string[];
    longTail: string[];
    searchIntent: SearchIntent;
  };

  seo: {
    metaTitle: string;
    metaDescription: string;
    canonicalPath: string;
    noindex?: boolean;
  };

  aeo: AeoFields;

  article: {
    intro: string;
    sections: {
      heading: string;
      body: string;
    }[];
    conclusion: string;
  };

  internalLinking: {
    primaryCluster: string;
    relatedClusters: string[];
    requiredLinks?: string[];
    excludedLinks?: string[];
    rotationStrategy: RotationStrategy;
    maxLinks: number;
  };

  relatedLandingPageSlug?: string;
  leadMagnetId?: string;
  relatedArticleSlugs: string[];

  schema: {
    type: "Article" | "BlogPosting" | "FAQPage";
  };

  createdAt: TimestampLike;
  updatedAt: TimestampLike;
  publishedAt?: TimestampLike;
};

/** Incoming or generated article payloads before server timestamps are applied */
export type ArticleDraftInput = Omit<Article, "createdAt" | "updatedAt" | "publishedAt"> & {
  createdAt?: TimestampLike;
  updatedAt?: TimestampLike;
  publishedAt?: TimestampLike;
};
