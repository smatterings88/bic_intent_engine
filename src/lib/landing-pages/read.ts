import "server-only";

import type { DocumentData } from "firebase-admin/firestore";
import { deepSerializeFirestore } from "@/lib/articles/read";
import { ensureFirebaseAdmin } from "@/lib/firebase/admin";
import { CONTENT_COLLECTIONS } from "@/lib/content/constants";
import { assertValidSlug, isReservedTopLevelSlug } from "@/lib/content/slug";
import type { LandingPage } from "@/types/landing-page";

const MAX_LIST = 100;
const MAX_STATIC_SLUGS = 500;

function tryAdminDb() {
  try {
    return ensureFirebaseAdmin().adminDb;
  } catch {
    return null;
  }
}

function mapDocToLandingPage(slug: string, data: DocumentData): LandingPage {
  const raw = deepSerializeFirestore({ ...data, slug: data.slug ?? slug }) as Record<
    string,
    unknown
  >;
  return raw as unknown as LandingPage;
}

/** Any status. Null if Admin unavailable, invalid slug, reserved segment, or missing doc. */
export async function getLandingPageBySlug(slug: string): Promise<LandingPage | null> {
  try {
    assertValidSlug(slug);
  } catch {
    return null;
  }
  if (isReservedTopLevelSlug(slug)) {
    return null;
  }
  const adminDb = tryAdminDb();
  if (!adminDb) {
    return null;
  }
  const snap = await adminDb.collection(CONTENT_COLLECTIONS.landingPages).doc(slug).get();
  if (!snap.exists) {
    return null;
  }
  return mapDocToLandingPage(slug, snap.data() ?? {});
}

/**
 * Returns null if Admin is not configured, slug is invalid, reserved, doc missing,
 * or status !== published.
 */
export async function getPublishedLandingPageBySlug(slug: string): Promise<LandingPage | null> {
  try {
    assertValidSlug(slug);
  } catch {
    return null;
  }
  if (isReservedTopLevelSlug(slug)) {
    return null;
  }
  const adminDb = tryAdminDb();
  if (!adminDb) {
    return null;
  }
  const snap = await adminDb.collection(CONTENT_COLLECTIONS.landingPages).doc(slug).get();
  if (!snap.exists) {
    return null;
  }
  const data = snap.data() ?? {};
  if (data.status !== "published") {
    return null;
  }
  return mapDocToLandingPage(slug, data);
}

export async function listPublishedLandingPages(): Promise<LandingPage[]> {
  const adminDb = tryAdminDb();
  if (!adminDb) {
    return [];
  }
  let rows: LandingPage[] = [];
  try {
    const snap = await adminDb
      .collection(CONTENT_COLLECTIONS.landingPages)
      .where("status", "==", "published")
      .orderBy("updatedAt", "desc")
      .limit(MAX_LIST)
      .get();
    rows = snap.docs.map((d) => mapDocToLandingPage(d.id, d.data() ?? {}));
  } catch {
    const snap = await adminDb.collection(CONTENT_COLLECTIONS.landingPages).limit(MAX_LIST).get();
    rows = snap.docs
      .filter((d) => (d.data()?.status as string | undefined) === "published")
      .map((d) => mapDocToLandingPage(d.id, d.data() ?? {}));
  }
  return rows.filter((p) => !isReservedTopLevelSlug(p.slug));
}

export async function listPublishedLandingPageSlugs(): Promise<{ slug: string }[]> {
  const pages = await listPublishedLandingPages();
  return pages
    .filter((p) => !isReservedTopLevelSlug(p.slug))
    .slice(0, MAX_STATIC_SLUGS)
    .map((p) => ({ slug: p.slug }));
}
