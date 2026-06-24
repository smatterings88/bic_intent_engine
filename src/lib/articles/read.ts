import "server-only";

import type { DocumentData, Timestamp } from "firebase-admin/firestore";
import { ensureFirebaseAdmin } from "@/lib/firebase/admin";
import { CONTENT_COLLECTIONS } from "@/lib/content/constants";
import { assertValidSlug } from "@/lib/content/slug";
import type { Article } from "@/types/article";

const MAX_LIST = 100;
const MAX_STATIC_SLUGS = 500;

function tryAdminDb() {
  try {
    return ensureFirebaseAdmin().adminDb;
  } catch {
    return null;
  }
}

function isTimestamp(value: unknown): value is Timestamp {
  return (
    typeof value === "object" && value !== null && typeof (value as Timestamp).toDate === "function"
  );
}

/** Recursively convert Firestore Timestamps to ISO strings for Next.js serialization. */
export function deepSerializeFirestore(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }
  if (isTimestamp(value)) {
    return value.toDate().toISOString();
  }
  if (Array.isArray(value)) {
    return value.map((v) => deepSerializeFirestore(v));
  }
  if (typeof value === "object" && value.constructor === Object) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = deepSerializeFirestore(v);
    }
    return out;
  }
  return value;
}

function mapDocToArticle(slug: string, data: DocumentData): Article {
  const raw = deepSerializeFirestore({ ...data, slug: data.slug ?? slug }) as Record<
    string,
    unknown
  >;
  return raw as unknown as Article;
}

/**
 * Returns null if Admin is not configured, slug is invalid, doc missing, or status !== published.
 */
export async function getPublishedArticleBySlug(slug: string): Promise<Article | null> {
  try {
    assertValidSlug(slug);
  } catch {
    return null;
  }
  const adminDb = tryAdminDb();
  if (!adminDb) {
    return null;
  }
  const snap = await adminDb.collection(CONTENT_COLLECTIONS.articles).doc(slug).get();
  if (!snap.exists) {
    return null;
  }
  const data = snap.data() ?? {};
  if (data.status !== "published") {
    return null;
  }
  return mapDocToArticle(slug, data);
}

/** Any status (including draft). Null if missing or Admin unavailable. */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    assertValidSlug(slug);
  } catch {
    return null;
  }
  const adminDb = tryAdminDb();
  if (!adminDb) {
    return null;
  }
  const snap = await adminDb.collection(CONTENT_COLLECTIONS.articles).doc(slug).get();
  if (!snap.exists) {
    return null;
  }
  return mapDocToArticle(slug, snap.data() ?? {});
}

/**
 * Published articles for server-side internal link selection (Admin SDK).
 * Alias of {@link listPublishedArticles}; kept for call-site clarity.
 */
export async function listPublishedArticlesForInternalLinks(): Promise<Article[]> {
  return listPublishedArticles();
}

export async function listPublishedArticles(): Promise<Article[]> {
  const adminDb = tryAdminDb();
  if (!adminDb) {
    return [];
  }
  try {
    const snap = await adminDb
      .collection(CONTENT_COLLECTIONS.articles)
      .where("status", "==", "published")
      .orderBy("updatedAt", "desc")
      .limit(MAX_LIST)
      .get();
    return snap.docs.map((d) => mapDocToArticle(d.id, d.data() ?? {}));
  } catch {
    const snap = await adminDb.collection(CONTENT_COLLECTIONS.articles).limit(MAX_LIST).get();
    return snap.docs
      .filter((d) => (d.data()?.status as string | undefined) === "published")
      .map((d) => mapDocToArticle(d.id, d.data() ?? {}));
  }
}

export async function listPublishedArticleSlugs(): Promise<{ slug: string }[]> {
  const articles = await listPublishedArticles();
  return articles.slice(0, MAX_STATIC_SLUGS).map((a) => ({ slug: a.slug }));
}

/** Most recently updated published articles (same ordering as {@link listPublishedArticles}). */
export async function listRecentPublishedArticles(limit = 3): Promise<Article[]> {
  const articles = await listPublishedArticles();
  return articles.slice(0, Math.max(0, limit));
}
