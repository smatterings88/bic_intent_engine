import { z } from "zod";

import { SLUG_REGEX } from "@/lib/content/slug";

const slugField = z
  .string()
  .min(1)
  .regex(SLUG_REGEX, "Slug must be lowercase letters, digits, and single hyphens between segments")
  .transform((s) => s.trim());

const looseOptional = z
  .string()
  .optional()
  .transform((s) => {
    const t = s?.trim();
    return t ? t : undefined;
  });

export const landingPageOptInSchema = z.object({
  email: z
    .string()
    .email()
    .transform((s) => s.trim().toLowerCase()),
  firstName: looseOptional,
  lastName: looseOptional,
  phone: z
    .string()
    .optional()
    .transform((s) => {
      const t = s?.trim();
      return t ? t : undefined;
    }),
  landingPageSlug: slugField,
  leadMagnetId: looseOptional,
  sourcePage: z
    .string()
    .min(1)
    .max(500)
    .transform((s) => s.trim())
    .refine((s) => s.startsWith("/"), "sourcePage must start with /"),
  campaignType: looseOptional,
  /** Ignored for GHL sync — tags come from the published landing page `conversion` config only. */
  ghlTags: z.array(z.string().max(200)).max(50).optional(),
  utm: z
    .object({
      source: looseOptional,
      medium: looseOptional,
      campaign: looseOptional,
      term: looseOptional,
      content: looseOptional,
    })
    .optional(),
});

export type LandingPageOptInInput = z.infer<typeof landingPageOptInSchema>;
