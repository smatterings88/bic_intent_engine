import "server-only";

import type { GhlCreateContactInput, GhlOptInSyncInput, GhlOptInSyncResult } from "@/types/ghl";

import { siteConfig } from "@/lib/site";
import { normalizeGhlTags } from "./tags";
import { syncContactWithTags } from "./sync-contact";
import { resolveGhlTags } from "./tag-strategy";

export function buildLandingPageOptInDefaultTags(
  input: Pick<GhlOptInSyncInput, "landingPageSlug" | "leadMagnetId" | "campaignType">,
): string[] {
  const tags: string[] = [
    "sbi --> opted in",
    `sbi landing page --> ${input.landingPageSlug.trim()}`,
  ];
  if (input.leadMagnetId?.trim()) {
    tags.push(`sbi lead magnet --> ${input.leadMagnetId.trim()}`);
  }
  if (input.campaignType?.trim()) {
    tags.push(`sbi campaign --> ${input.campaignType.trim()}`);
  }
  return normalizeGhlTags(tags);
}

export function buildLandingPageOptInTags(input: GhlOptInSyncInput): string[] {
  const defaultTags = buildLandingPageOptInDefaultTags(input);

  if (input.ghlTagStrategy) {
    return resolveGhlTags({
      defaultTags,
      pageStrategy: input.ghlTagStrategy,
    });
  }

  if (input.ghlTags?.length) {
    return resolveGhlTags({
      defaultTags,
      pageStrategy: { mode: "merge", tags: input.ghlTags },
    });
  }

  return defaultTags;
}

/**
 * Upsert GHL contact by email, merge tags, return structured result. Throws on hard failures.
 */
export async function syncLandingPageOptInToGhl(
  input: GhlOptInSyncInput,
): Promise<GhlOptInSyncResult> {
  const tags = buildLandingPageOptInTags(input);
  const createInput: GhlCreateContactInput = {
    email: input.email.trim(),
    firstName: input.firstName?.trim(),
    lastName: input.lastName?.trim(),
    phone: input.phone?.trim(),
    source: siteConfig.name,
  };

  const synced = await syncContactWithTags(createInput, tags);

  return {
    status: "tagged",
    contactId: synced.contactId ?? undefined,
    mode: synced.mode,
    tagsApplied: synced.tagsApplied,
  };
}
