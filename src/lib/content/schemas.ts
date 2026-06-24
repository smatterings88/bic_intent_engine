import { z } from "zod";

import { sanitizeGhlTagList } from "@/lib/ghl/tag-strategy";
import { SLUG_REGEX } from "./slug";

export const contentStatusSchema = z.enum(["draft", "review", "published", "archived"]);

export const contentSourceSchema = z.enum(["zenithmind", "manual"]);

export const searchIntentSchema = z.enum([
  "informational",
  "commercial",
  "transactional",
  "navigational",
]);

export const schemaTypeSchema = z.enum(["Article", "BlogPosting", "FAQPage", "WebPage"]);

export const campaignTypeSchema = z.enum([
  "seo",
  "google_ad_grant",
  "webinar",
  "lead_magnet",
  "upload_flow",
]);

export const leadMagnetDeliveryTypeSchema = z.enum([
  "pdf",
  "email",
  "webinar",
  "demo",
  "checklist",
]);

export const nextStepTypeSchema = z.enum([
  "download",
  "webinar",
  "upload",
  "book_call",
  "sherpa_offer",
]);

export const rotationStrategySchema = z.enum(["cluster", "keyword", "mixed"]);

const slugStringSchema = z
  .string()
  .min(1)
  .regex(SLUG_REGEX, "Slug must be lowercase letters, digits, and single hyphens between segments");

export const keywordSetSchema = z.object({
  primary: z.string().min(1),
  secondary: z.array(z.string()),
  longTail: z.array(z.string()),
  searchIntent: searchIntentSchema,
});

export const seoFieldsSchema = z.object({
  metaTitle: z.string().min(1).max(70),
  metaDescription: z.string().min(1).max(170),
  canonicalPath: z
    .string()
    .min(1)
    .refine((p) => p.startsWith("/"), "canonicalPath must start with /"),
  noindex: z.boolean().optional(),
});

export const faqItemSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

export const aeoFieldsSchema = z.object({
  answerBlock: z.string().min(40),
  faqs: z.array(faqItemSchema).min(1),
});

const landingKeywordSearchIntentSchema = z.enum(["commercial", "transactional", "informational"]);

const articleKeywordSchema = z.object({
  primary: z.string().min(1),
  secondary: z.array(z.string()),
  longTail: z.array(z.string()),
  searchIntent: searchIntentSchema,
});

const articleBodySchema = z.object({
  intro: z.string().min(10),
  sections: z
    .array(
      z.object({
        heading: z.string().min(1),
        body: z.string().min(1),
      }),
    )
    .min(1),
  conclusion: z.string().min(10),
});

const internalLinkingSchema = z.object({
  primaryCluster: z.string().min(1),
  relatedClusters: z.array(z.string()),
  requiredLinks: z.array(slugStringSchema).optional(),
  excludedLinks: z.array(slugStringSchema).optional(),
  rotationStrategy: rotationStrategySchema,
  maxLinks: z.number().int().min(1).max(12),
});

const articleCoreSchema = z.object({
  id: z.string().min(1),
  source: contentSourceSchema,
  contentType: z.literal("article"),
  status: contentStatusSchema,
  slug: slugStringSchema,
  title: z.string().min(1),
  subtitle: z.string().optional(),
  keyword: articleKeywordSchema,
  seo: seoFieldsSchema,
  aeo: aeoFieldsSchema,
  article: articleBodySchema,
  internalLinking: internalLinkingSchema,
  relatedLandingPageSlug: slugStringSchema.optional(),
  leadMagnetId: z.string().min(1).optional(),
  relatedArticleSlugs: z.array(slugStringSchema),
  schema: z.object({
    type: z.enum(["Article", "BlogPosting", "FAQPage"]),
  }),
});

export const articleSchema = articleCoreSchema.extend({
  createdAt: z.unknown(),
  updatedAt: z.unknown(),
  publishedAt: z.unknown().optional(),
});

export const articleDraftInputSchema = articleCoreSchema.extend({
  createdAt: z.unknown().optional(),
  updatedAt: z.unknown().optional(),
  publishedAt: z.unknown().optional(),
});

const heroSchema = z.object({
  eyebrow: z.string().min(1),
  headline: z.string().min(1),
  subheadline: z.string().min(1),
  primaryCtaLabel: z.string().min(1),
  primaryCtaHref: z.string().min(1),
  secondaryCtaLabel: z.string().min(1).optional(),
  secondaryCtaHref: z.string().min(1).optional(),
});

const landingSectionSchema = z.object({
  heading: z.string().min(1),
  body: z.string().min(1),
  bullets: z.array(z.string()).optional(),
});

const proofItemSchema = z.object({
  stat: z.string().optional(),
  explanation: z.string().optional(),
  sourceLabel: z.string().optional(),
});

const ghlTagStrategySchema = z
  .object({
    mode: z.enum(["merge", "replace", "suppress"]),
    tags: z.array(z.string()).optional(),
  })
  .transform((val) => {
    if (val.mode === "suppress") {
      return { mode: "suppress" as const };
    }
    const tags = sanitizeGhlTagList(val.tags);
    return { mode: val.mode, tags: tags.length ? tags : undefined };
  });

const landingCoreSchema = z.object({
  id: z.string().min(1),
  source: contentSourceSchema,
  contentType: z.literal("landing_page"),
  status: contentStatusSchema,
  slug: slugStringSchema,
  campaignType: campaignTypeSchema,
  keyword: z.object({
    primary: z.string().min(1),
    secondary: z.array(z.string()),
    longTail: z.array(z.string()),
    adGroups: z.array(z.string()).optional(),
    searchIntent: landingKeywordSearchIntentSchema,
  }),
  seo: seoFieldsSchema,
  hero: heroSchema,
  aeo: aeoFieldsSchema,
  sections: z.array(landingSectionSchema).min(1),
  proof: z.array(proofItemSchema).optional(),
  primaryLeadMagnetId: z.string().min(1),
  leadMagnetIds: z.array(z.string().min(1)).min(1),
  conversion: z.object({
    formType: z.enum(["lead_magnet", "webinar", "upload", "demo"]),
    ghlTags: z.array(z.string()),
    ghlTagStrategy: ghlTagStrategySchema.optional(),
    thankYouMessage: z.string().min(1),
    nextStep: nextStepTypeSchema,
  }),
  relatedArticleSlugs: z.array(slugStringSchema),
  relatedLandingPageSlugs: z.array(slugStringSchema),
  schema: z.object({
    type: z.enum(["WebPage", "FAQPage", "Article"]),
  }),
});

export const landingPageSchema = landingCoreSchema
  .extend({
    createdAt: z.unknown(),
    updatedAt: z.unknown(),
    publishedAt: z.unknown().optional(),
  })
  .refine((d) => d.leadMagnetIds.includes(d.primaryLeadMagnetId), {
    message: "primaryLeadMagnetId must be included in leadMagnetIds",
    path: ["primaryLeadMagnetId"],
  });

export const landingPageDraftInputSchema = landingCoreSchema
  .extend({
    createdAt: z.unknown().optional(),
    updatedAt: z.unknown().optional(),
    publishedAt: z.unknown().optional(),
  })
  .refine((d) => d.leadMagnetIds.includes(d.primaryLeadMagnetId), {
    message: "primaryLeadMagnetId must be included in leadMagnetIds",
    path: ["primaryLeadMagnetId"],
  });

const leadMagnetSectionSchema = z.object({
  title: z.string().min(1),
  body: z.string().optional(),
  items: z.array(z.string()).optional(),
});

const leadMagnetCoreSchema = z.object({
  id: slugStringSchema,
  source: contentSourceSchema,
  status: contentStatusSchema,
  title: z.string().min(1),
  subtitle: z.string().min(1),
  description: z.string().min(10),
  ctaLabel: z.string().min(1),
  deliveryType: leadMagnetDeliveryTypeSchema,
  ghlTag: z.string().min(1),
  fileUrl: z.string().url().optional(),
  sections: z.array(leadMagnetSectionSchema).optional(),
});

export const leadMagnetSchema = leadMagnetCoreSchema.extend({
  createdAt: z.unknown(),
  updatedAt: z.unknown(),
  publishedAt: z.unknown().optional(),
});

export const leadMagnetDraftInputSchema = leadMagnetCoreSchema.extend({
  createdAt: z.unknown().optional(),
  updatedAt: z.unknown().optional(),
  publishedAt: z.unknown().optional(),
});

export const zenithArticlePayloadSchema = z.object({
  article: articleDraftInputSchema,
});

export const zenithLandingPagePayloadSchema = z.object({
  landingPage: landingPageDraftInputSchema,
});

export const zenithLeadMagnetPayloadSchema = z.object({
  leadMagnet: leadMagnetDraftInputSchema,
});

export const zenithBatchPayloadSchema = z.object({
  articles: z.array(articleDraftInputSchema).optional(),
  landingPages: z.array(landingPageDraftInputSchema).optional(),
  leadMagnets: z.array(leadMagnetDraftInputSchema).optional(),
});

export const leadSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  sourcePage: z.string().min(1),
  landingPageSlug: slugStringSchema.optional(),
  articleSlug: slugStringSchema.optional(),
  leadMagnetId: z.string().min(1).optional(),
  utm: z.object({
    source: z.string().optional(),
    medium: z.string().optional(),
    campaign: z.string().optional(),
    term: z.string().optional(),
    content: z.string().optional(),
  }),
  ghl: z.object({
    contactId: z.string().optional(),
    status: z.enum(["pending", "found", "created", "updated", "tagged", "failed"]),
    tagsApplied: z.array(z.string()),
    lastSyncedAt: z.unknown().optional(),
    error: z.string().optional(),
  }),
  createdAt: z.unknown(),
  updatedAt: z.unknown(),
});

export const submissionSchema = z.object({
  id: z.string().min(1),
  userId: z.string().optional(),
  email: z.string().email().optional(),
  name: z.string().optional(),
  transcriptText: z.string().optional(),
  fileUrl: z.string().url().optional(),
  fileName: z.string().optional(),
  fileType: z.string().optional(),
  sourcePage: z.string().optional(),
  landingPageSlug: slugStringSchema.optional(),
  status: z.enum(["submitted", "processing", "completed", "failed"]),
  createdAt: z.unknown(),
  updatedAt: z.unknown(),
});

export const breakdownSchema = z.object({
  id: z.string().min(1),
  submissionId: z.string().min(1),
  userId: z.string().optional(),
  summary: z.string().min(10),
  keyFailureMoments: z
    .array(
      z.object({
        label: z.string().min(1),
        explanation: z.string().min(1),
        evidence: z.string().optional(),
        correctedMove: z.string().optional(),
      }),
    )
    .min(1),
  score: z.number().min(0).max(100).optional(),
  recommendedNextStep: z.string().min(1),
  createdAt: z.unknown(),
});
