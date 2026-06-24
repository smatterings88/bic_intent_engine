import "server-only";

import { FieldValue, type Firestore, type Timestamp } from "firebase-admin/firestore";
import type { z } from "zod";

import { CONTENT_COLLECTIONS } from "@/lib/content/constants";
import { getArticlePath, getLandingPagePath, getLeadMagnetPath } from "@/lib/content/paths";
import type { articleDraftInputSchema, landingPageDraftInputSchema } from "@/lib/content/schemas";
import { ensureFirebaseAdmin } from "@/lib/firebase/admin";
import type { ArticleDraftInput } from "@/types/article";
import type { ContentStatus } from "@/types/content";
import type { LandingPageDraftInput } from "@/types/landing-page";
import type { LeadMagnetDraftInput } from "@/types/lead-magnet";
import type { ZenithContentType, ZenithIngestionStatus } from "@/types/zenith";

type ArticleDraftParsed = z.infer<typeof articleDraftInputSchema>;
type LandingDraftParsed = z.infer<typeof landingPageDraftInputSchema>;

/**
 * ZenithMind must never auto-publish: if the model sends `published`, we store `review`
 * so a human/admin publish step can happen later. Default is `draft` unless `review` is explicit.
 */
export function coerceZenithContentStatus(status: ContentStatus | undefined): ContentStatus {
  if (status === "review") return "review";
  if (status === "published") return "review";
  if (status === "archived") return "archived";
  return "draft";
}

export type CreateZenithIngestionArgs = {
  id: string;
  contentType: ZenithContentType;
  status: ZenithIngestionStatus;
  rawPayload: unknown;
  targetCollection?: string;
  targetId?: string;
  validationErrors?: string[];
};

export async function createZenithIngestionRecord(args: CreateZenithIngestionArgs): Promise<void> {
  const { adminDb } = ensureFirebaseAdmin();
  await adminDb
    .collection(CONTENT_COLLECTIONS.zenithIngestions)
    .doc(args.id)
    .set({
      id: args.id,
      source: "zenithmind",
      contentType: args.contentType,
      status: args.status,
      rawPayload: args.rawPayload,
      ...(args.targetCollection ? { targetCollection: args.targetCollection } : {}),
      ...(args.targetId ? { targetId: args.targetId } : {}),
      ...(args.validationErrors?.length ? { validationErrors: args.validationErrors } : {}),
      createdAt: FieldValue.serverTimestamp(),
    });
}

function stripTimestamps<
  T extends { createdAt?: unknown; updatedAt?: unknown; publishedAt?: unknown },
>(doc: T): Omit<T, "createdAt" | "updatedAt" | "publishedAt"> {
  const { createdAt, updatedAt, publishedAt, ...rest } = doc;
  void createdAt;
  void updatedAt;
  void publishedAt;
  return rest;
}

async function resolveCreatedAt(
  adminDb: Firestore,
  collection: string,
  docId: string,
): Promise<Timestamp | ReturnType<typeof FieldValue.serverTimestamp>> {
  const snap = await adminDb.collection(collection).doc(docId).get();
  const prev = snap.data()?.createdAt;
  if (prev && typeof (prev as Timestamp).toMillis === "function") {
    return prev as Timestamp;
  }
  return FieldValue.serverTimestamp();
}

async function writeArticleDocument(article: ArticleDraftParsed): Promise<{
  slug: string;
  path: string;
  status: ContentStatus;
}> {
  const { adminDb } = ensureFirebaseAdmin();
  const coerced: ArticleDraftInput = {
    ...stripTimestamps(article),
    source: "zenithmind",
    contentType: "article",
    status: coerceZenithContentStatus(article.status),
  };
  const slug = coerced.slug;
  const createdAt = await resolveCreatedAt(adminDb, CONTENT_COLLECTIONS.articles, slug);
  await adminDb
    .collection(CONTENT_COLLECTIONS.articles)
    .doc(slug)
    .set(
      {
        ...coerced,
        createdAt,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: false },
    );
  return { slug, path: getArticlePath(slug), status: coerced.status };
}

async function writeLandingPageDocument(landingPage: LandingDraftParsed): Promise<{
  slug: string;
  path: string;
  status: ContentStatus;
}> {
  const { adminDb } = ensureFirebaseAdmin();
  const coerced: LandingPageDraftInput = {
    ...stripTimestamps(landingPage),
    source: "zenithmind",
    contentType: "landing_page",
    status: coerceZenithContentStatus(landingPage.status),
  };
  const slug = coerced.slug;
  const createdAt = await resolveCreatedAt(adminDb, CONTENT_COLLECTIONS.landingPages, slug);
  await adminDb
    .collection(CONTENT_COLLECTIONS.landingPages)
    .doc(slug)
    .set(
      {
        ...coerced,
        createdAt,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: false },
    );
  return { slug, path: getLandingPagePath(slug), status: coerced.status };
}

async function writeLeadMagnetDocument(leadMagnet: LeadMagnetDraftInput): Promise<{
  id: string;
  path: string;
  status: ContentStatus;
}> {
  const { adminDb } = ensureFirebaseAdmin();
  const coerced: LeadMagnetDraftInput = {
    ...stripTimestamps(leadMagnet),
    source: "zenithmind",
    status: coerceZenithContentStatus(leadMagnet.status),
  };
  const id = coerced.id;
  const createdAt = await resolveCreatedAt(adminDb, CONTENT_COLLECTIONS.leadMagnets, id);
  await adminDb
    .collection(CONTENT_COLLECTIONS.leadMagnets)
    .doc(id)
    .set(
      {
        ...coerced,
        createdAt,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: false },
    );
  return { id, path: getLeadMagnetPath(id), status: coerced.status };
}

export async function saveArticleDraftFromZenith(args: {
  article: ArticleDraftParsed;
  rawPayload: unknown;
}): Promise<{ slug: string; ingestionId: string; path: string; status: ContentStatus }> {
  const { adminDb } = ensureFirebaseAdmin();
  const coerced: ArticleDraftInput = {
    ...stripTimestamps(args.article),
    source: "zenithmind",
    contentType: "article",
    status: coerceZenithContentStatus(args.article.status),
  };
  const slug = coerced.slug;
  const ingestionId = adminDb.collection(CONTENT_COLLECTIONS.zenithIngestions).doc().id;
  const createdAt = await resolveCreatedAt(adminDb, CONTENT_COLLECTIONS.articles, slug);

  const articleRef = adminDb.collection(CONTENT_COLLECTIONS.articles).doc(slug);
  const ingestRef = adminDb.collection(CONTENT_COLLECTIONS.zenithIngestions).doc(ingestionId);

  const batch = adminDb.batch();
  batch.set(articleRef, {
    ...coerced,
    createdAt,
    updatedAt: FieldValue.serverTimestamp(),
  });
  batch.set(ingestRef, {
    id: ingestionId,
    source: "zenithmind",
    contentType: "article" satisfies ZenithContentType,
    status: "saved" satisfies ZenithIngestionStatus,
    rawPayload: args.rawPayload,
    targetCollection: CONTENT_COLLECTIONS.articles,
    targetId: slug,
    createdAt: FieldValue.serverTimestamp(),
  });
  await batch.commit();

  return {
    slug,
    ingestionId,
    path: getArticlePath(slug),
    status: coerced.status,
  };
}

export async function saveLandingPageDraftFromZenith(args: {
  landingPage: LandingDraftParsed;
  rawPayload: unknown;
}): Promise<{ slug: string; ingestionId: string; path: string; status: ContentStatus }> {
  const { adminDb } = ensureFirebaseAdmin();
  const coerced: LandingPageDraftInput = {
    ...stripTimestamps(args.landingPage),
    source: "zenithmind",
    contentType: "landing_page",
    status: coerceZenithContentStatus(args.landingPage.status),
  };
  const slug = coerced.slug;
  const ingestionId = adminDb.collection(CONTENT_COLLECTIONS.zenithIngestions).doc().id;
  const createdAt = await resolveCreatedAt(adminDb, CONTENT_COLLECTIONS.landingPages, slug);

  const pageRef = adminDb.collection(CONTENT_COLLECTIONS.landingPages).doc(slug);
  const ingestRef = adminDb.collection(CONTENT_COLLECTIONS.zenithIngestions).doc(ingestionId);

  const batch = adminDb.batch();
  batch.set(pageRef, {
    ...coerced,
    createdAt,
    updatedAt: FieldValue.serverTimestamp(),
  });
  batch.set(ingestRef, {
    id: ingestionId,
    source: "zenithmind",
    contentType: "landing_page" satisfies ZenithContentType,
    status: "saved" satisfies ZenithIngestionStatus,
    rawPayload: args.rawPayload,
    targetCollection: CONTENT_COLLECTIONS.landingPages,
    targetId: slug,
    createdAt: FieldValue.serverTimestamp(),
  });
  await batch.commit();

  return {
    slug,
    ingestionId,
    path: getLandingPagePath(slug),
    status: coerced.status,
  };
}

export async function saveLeadMagnetDraftFromZenith(args: {
  leadMagnet: LeadMagnetDraftInput;
  rawPayload: unknown;
}): Promise<{ id: string; ingestionId: string; path: string; status: ContentStatus }> {
  const { adminDb } = ensureFirebaseAdmin();
  const coerced: LeadMagnetDraftInput = {
    ...stripTimestamps(args.leadMagnet),
    source: "zenithmind",
    status: coerceZenithContentStatus(args.leadMagnet.status),
  };
  const id = coerced.id;
  const ingestionId = adminDb.collection(CONTENT_COLLECTIONS.zenithIngestions).doc().id;
  const createdAt = await resolveCreatedAt(adminDb, CONTENT_COLLECTIONS.leadMagnets, id);

  const lmRef = adminDb.collection(CONTENT_COLLECTIONS.leadMagnets).doc(id);
  const ingestRef = adminDb.collection(CONTENT_COLLECTIONS.zenithIngestions).doc(ingestionId);

  const batch = adminDb.batch();
  batch.set(lmRef, {
    ...coerced,
    createdAt,
    updatedAt: FieldValue.serverTimestamp(),
  });
  batch.set(ingestRef, {
    id: ingestionId,
    source: "zenithmind",
    contentType: "lead_magnet" satisfies ZenithContentType,
    status: "saved" satisfies ZenithIngestionStatus,
    rawPayload: args.rawPayload,
    targetCollection: CONTENT_COLLECTIONS.leadMagnets,
    targetId: id,
    createdAt: FieldValue.serverTimestamp(),
  });
  await batch.commit();

  return {
    id,
    ingestionId,
    path: getLeadMagnetPath(id),
    status: coerced.status,
  };
}

export type BatchItemResult =
  | { ok: true; slug?: string; id?: string; path: string; status: ContentStatus }
  | { ok: false; index: number; message: string };

export async function saveZenithBatch(args: {
  rawPayload: unknown;
  leadMagnets: LeadMagnetDraftInput[];
  articles: ArticleDraftParsed[];
  landingPages: LandingDraftParsed[];
}): Promise<{
  ingestionId: string;
  results: {
    leadMagnets: BatchItemResult[];
    articles: BatchItemResult[];
    landingPages: BatchItemResult[];
  };
  errors: string[];
}> {
  const { adminDb } = ensureFirebaseAdmin();
  const ingestionId = adminDb.collection(CONTENT_COLLECTIONS.zenithIngestions).doc().id;
  const results = {
    leadMagnets: [] as BatchItemResult[],
    articles: [] as BatchItemResult[],
    landingPages: [] as BatchItemResult[],
  };
  const errors: string[] = [];

  for (let i = 0; i < args.leadMagnets.length; i++) {
    try {
      const r = await writeLeadMagnetDocument(args.leadMagnets[i]);
      results.leadMagnets.push({
        ok: true,
        id: r.id,
        path: r.path,
        status: r.status,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`leadMagnets[${i}]: ${msg}`);
      results.leadMagnets.push({ ok: false, index: i, message: msg });
    }
  }

  for (let i = 0; i < args.articles.length; i++) {
    try {
      const r = await writeArticleDocument(args.articles[i]);
      results.articles.push({
        ok: true,
        slug: r.slug,
        path: r.path,
        status: r.status,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`articles[${i}]: ${msg}`);
      results.articles.push({ ok: false, index: i, message: msg });
    }
  }

  for (let i = 0; i < args.landingPages.length; i++) {
    try {
      const r = await writeLandingPageDocument(args.landingPages[i]);
      results.landingPages.push({
        ok: true,
        slug: r.slug,
        path: r.path,
        status: r.status,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`landingPages[${i}]: ${msg}`);
      results.landingPages.push({ ok: false, index: i, message: msg });
    }
  }

  const anySuccess =
    results.leadMagnets.some((x) => x.ok) ||
    results.articles.some((x) => x.ok) ||
    results.landingPages.some((x) => x.ok);

  await createZenithIngestionRecord({
    id: ingestionId,
    contentType: "batch",
    status: anySuccess ? "saved" : "failed",
    rawPayload: args.rawPayload,
    targetCollection: CONTENT_COLLECTIONS.zenithIngestions,
    targetId: ingestionId,
    validationErrors: errors.length ? errors : undefined,
  });

  return { ingestionId, results, errors };
}
