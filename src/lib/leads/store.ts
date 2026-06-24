import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import { ensureFirebaseAdmin } from "@/lib/firebase/admin";
import { CONTENT_COLLECTIONS } from "@/lib/content/constants";
import type { GhlOptInSyncResult } from "@/types/ghl";

import type { LandingPageOptInInput } from "./schemas";

export async function createLeadRecord(input: LandingPageOptInInput): Promise<{ leadId: string }> {
  const { adminDb } = ensureFirebaseAdmin();
  const ref = adminDb.collection(CONTENT_COLLECTIONS.leads).doc();
  const leadId = ref.id;

  await ref.set({
    id: leadId,
    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName,
    phone: input.phone,
    sourcePage: input.sourcePage,
    landingPageSlug: input.landingPageSlug,
    leadMagnetId: input.leadMagnetId,
    campaignType: input.campaignType,
    utm: {
      source: input.utm?.source,
      medium: input.utm?.medium,
      campaign: input.utm?.campaign,
      term: input.utm?.term,
      content: input.utm?.content,
    },
    ghl: {
      status: "pending",
      tagsApplied: [],
    },
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return { leadId };
}

export async function updateLeadGhlSync(
  leadId: string,
  ghlResult: GhlOptInSyncResult,
): Promise<void> {
  const { adminDb } = ensureFirebaseAdmin();
  await adminDb
    .collection(CONTENT_COLLECTIONS.leads)
    .doc(leadId)
    .set(
      {
        ghl: {
          status: ghlResult.status,
          contactId: ghlResult.contactId ?? null,
          tagsApplied: ghlResult.tagsApplied,
          lastSyncedAt: FieldValue.serverTimestamp(),
          error: null,
        },
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
}

export async function markLeadGhlSyncFailed(leadId: string, error: unknown): Promise<void> {
  const { adminDb } = ensureFirebaseAdmin();
  const message = error instanceof Error ? error.message : String(error);
  await adminDb
    .collection(CONTENT_COLLECTIONS.leads)
    .doc(leadId)
    .set(
      {
        ghl: {
          status: "failed",
          tagsApplied: [],
          error: message.slice(0, 2000),
          lastSyncedAt: FieldValue.serverTimestamp(),
        },
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
}
