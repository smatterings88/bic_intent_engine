import "server-only";

import { FieldValue } from "firebase-admin/firestore";
import { ensureFirebaseAdmin } from "@/lib/firebase/admin";
import { CONTENT_COLLECTIONS } from "@/lib/content/constants";

export type AdminContentType = "article" | "landing_page" | "lead_magnet";

function collectionFor(ct: AdminContentType): string {
  switch (ct) {
    case "article":
      return CONTENT_COLLECTIONS.articles;
    case "landing_page":
      return CONTENT_COLLECTIONS.landingPages;
    case "lead_magnet":
      return CONTENT_COLLECTIONS.leadMagnets;
    default: {
      const _exhaustive: never = ct;
      return _exhaustive;
    }
  }
}

export async function adminPublishContent(args: {
  contentType: AdminContentType;
  id: string;
  actorUid: string;
}): Promise<void> {
  const { adminDb } = ensureFirebaseAdmin();
  const col = collectionFor(args.contentType);
  const ref = adminDb.collection(col).doc(args.id);
  const snap = await ref.get();
  if (!snap.exists) {
    throw new Error("Document not found");
  }
  const data = snap.data() ?? {};
  const updates: Record<string, unknown> = {
    status: "published",
    updatedAt: FieldValue.serverTimestamp(),
    reviewedByUid: args.actorUid,
    reviewedAt: FieldValue.serverTimestamp(),
  };
  if (data.publishedAt == null) {
    updates.publishedAt = FieldValue.serverTimestamp();
  }
  await ref.set(updates, { merge: true });
}

export async function adminUnpublishContent(args: {
  contentType: AdminContentType;
  id: string;
  actorUid: string;
}): Promise<void> {
  const { adminDb } = ensureFirebaseAdmin();
  const ref = adminDb.collection(collectionFor(args.contentType)).doc(args.id);
  const snap = await ref.get();
  if (!snap.exists) {
    throw new Error("Document not found");
  }
  await ref.set(
    {
      status: "review",
      updatedAt: FieldValue.serverTimestamp(),
      unpublishedByUid: args.actorUid,
      unpublishedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

export async function adminArchiveContent(args: {
  contentType: AdminContentType;
  id: string;
  actorUid: string;
}): Promise<void> {
  const { adminDb } = ensureFirebaseAdmin();
  const ref = adminDb.collection(collectionFor(args.contentType)).doc(args.id);
  const snap = await ref.get();
  if (!snap.exists) {
    throw new Error("Document not found");
  }
  await ref.set(
    {
      status: "archived",
      updatedAt: FieldValue.serverTimestamp(),
      archivedByUid: args.actorUid,
      archivedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}
