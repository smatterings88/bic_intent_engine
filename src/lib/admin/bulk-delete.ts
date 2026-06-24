import "server-only";

import { revalidatePath } from "next/cache";

import { ensureFirebaseAdmin } from "@/lib/firebase/admin";
import { CONTENT_COLLECTIONS } from "@/lib/content/constants";
import {
  BULK_DELETE_TARGETS,
  type BulkDeleteResult,
  type BulkDeleteTarget,
} from "@/lib/admin/bulk-delete-types";

export {
  BULK_DELETE_TARGETS,
  type BulkDeleteResult,
  type BulkDeleteTarget,
} from "@/lib/admin/bulk-delete-types";

const BATCH_SIZE = 500;

const TARGET_COLLECTION: Record<BulkDeleteTarget, string> = {
  articles: CONTENT_COLLECTIONS.articles,
  landing_pages: CONTENT_COLLECTIONS.landingPages,
  lead_magnets: CONTENT_COLLECTIONS.leadMagnets,
  zenith_pages: CONTENT_COLLECTIONS.zenithPages,
};

async function countCollection(collectionPath: string): Promise<number> {
  const { adminDb } = ensureFirebaseAdmin();
  const snap = await adminDb.collection(collectionPath).count().get();
  return snap.data().count;
}

export async function getBulkDeleteCounts(): Promise<Record<BulkDeleteTarget, number>> {
  const entries = await Promise.all(
    BULK_DELETE_TARGETS.map(async (target) => {
      const count = await countCollection(TARGET_COLLECTION[target]);
      return [target, count] as const;
    }),
  );
  return Object.fromEntries(entries) as Record<BulkDeleteTarget, number>;
}

async function deleteAllInCollection(collectionPath: string): Promise<number> {
  const { adminDb } = ensureFirebaseAdmin();
  const col = adminDb.collection(collectionPath);
  let deleted = 0;

  while (true) {
    const snap = await col.limit(BATCH_SIZE).get();
    if (snap.empty) break;

    const batch = adminDb.batch();
    for (const doc of snap.docs) {
      batch.delete(doc.ref);
    }
    await batch.commit();
    deleted += snap.size;
  }

  return deleted;
}

export async function adminBulkDeleteContent(args: {
  targets: BulkDeleteTarget[];
}): Promise<BulkDeleteResult> {
  const uniqueTargets = [...new Set(args.targets)];
  const result: BulkDeleteResult = {
    articles: 0,
    landing_pages: 0,
    lead_magnets: 0,
    zenith_pages: 0,
  };

  for (const target of uniqueTargets) {
    result[target] = await deleteAllInCollection(TARGET_COLLECTION[target]);
  }

  revalidateAfterBulkDelete(uniqueTargets);
  return result;
}

function revalidateAfterBulkDelete(targets: BulkDeleteTarget[]): void {
  if (targets.includes("articles")) {
    revalidatePath("/articles");
    revalidatePath("/sitemap.xml");
  }
  if (targets.includes("landing_pages")) {
    revalidatePath("/sitemap.xml");
  }
  if (targets.includes("zenith_pages")) {
    revalidatePath("/guides");
    revalidatePath("/webinars");
    revalidatePath("/cta");
    revalidatePath("/research");
    revalidatePath("/sitemap.xml");
  }
}
