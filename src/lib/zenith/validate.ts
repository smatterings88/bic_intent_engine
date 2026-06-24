import { z } from "zod";

import {
  zenithArticlePayloadSchema,
  zenithBatchPayloadSchema,
  zenithLandingPagePayloadSchema,
  zenithLeadMagnetPayloadSchema,
} from "@/lib/content/schemas";
import {
  normalizeArticleDraft,
  normalizeLandingPageDraft,
  normalizeLeadMagnetDraft,
  normalizeZenithBatchBody,
} from "@/lib/zenith/normalize";

export type ZenithValidationOk<T> = { ok: true; data: T };
export type ZenithValidationErr = { ok: false; issues: z.ZodIssue[] };

export type ZenithValidationResult<T> = ZenithValidationOk<T> | ZenithValidationErr;

export function validateZenithArticlePayload(
  body: unknown,
): ZenithValidationResult<z.infer<typeof zenithArticlePayloadSchema>> {
  try {
    if (!body || typeof body !== "object" || !("article" in body)) {
      return {
        ok: false,
        issues: [
          {
            code: z.ZodIssueCode.custom,
            message: "Body must be an object with an `article` property",
            path: [],
          },
        ],
      };
    }
    const article = normalizeArticleDraft((body as { article: unknown }).article);
    return finalize(zenithArticlePayloadSchema.safeParse({ article }));
  } catch (e) {
    return normalizeCatch(e);
  }
}

export function validateZenithLandingPagePayload(
  body: unknown,
): ZenithValidationResult<z.infer<typeof zenithLandingPagePayloadSchema>> {
  try {
    if (!body || typeof body !== "object" || !("landingPage" in body)) {
      return {
        ok: false,
        issues: [
          {
            code: z.ZodIssueCode.custom,
            message: "Body must be an object with a `landingPage` property",
            path: [],
          },
        ],
      };
    }
    const landingPage = normalizeLandingPageDraft((body as { landingPage: unknown }).landingPage);
    return finalize(zenithLandingPagePayloadSchema.safeParse({ landingPage }));
  } catch (e) {
    return normalizeCatch(e);
  }
}

export function validateZenithLeadMagnetPayload(
  body: unknown,
): ZenithValidationResult<z.infer<typeof zenithLeadMagnetPayloadSchema>> {
  try {
    if (!body || typeof body !== "object" || !("leadMagnet" in body)) {
      return {
        ok: false,
        issues: [
          {
            code: z.ZodIssueCode.custom,
            message: "Body must be an object with a `leadMagnet` property",
            path: [],
          },
        ],
      };
    }
    const leadMagnet = normalizeLeadMagnetDraft((body as { leadMagnet: unknown }).leadMagnet);
    return finalize(zenithLeadMagnetPayloadSchema.safeParse({ leadMagnet }));
  } catch (e) {
    return normalizeCatch(e);
  }
}

export function validateZenithBatchPayload(
  body: unknown,
): ZenithValidationResult<z.infer<typeof zenithBatchPayloadSchema>> {
  try {
    const normalized = normalizeZenithBatchBody(body);
    return finalize(zenithBatchPayloadSchema.safeParse(normalized));
  } catch (e) {
    return normalizeCatch(e);
  }
}

function finalize<T>(result: z.SafeParseReturnType<unknown, T>): ZenithValidationResult<T> {
  if (result.success) {
    return { ok: true, data: result.data };
  }
  return { ok: false, issues: result.error.issues };
}

function normalizeCatch(e: unknown): ZenithValidationErr {
  const message = e instanceof Error ? e.message : String(e);
  return {
    ok: false,
    issues: [
      {
        code: z.ZodIssueCode.custom,
        message,
        path: [],
      },
    ],
  };
}
