import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import { deepSerializeFirestore } from "@/lib/articles/read";
import { CONTENT_COLLECTIONS } from "@/lib/content/constants";
import { hasServerFirebaseConfig } from "@/lib/env";
import { isValidSlug } from "@/lib/content/slug";
import { ensureFirebaseAdmin } from "@/lib/firebase/admin";
import { prepareZenithPageForPublish } from "@/lib/zenith/publishValidation";
import { revalidateZenithPagePaths } from "@/lib/zenith/revalidate";
import { validateZenithPageDocument } from "@/lib/zenith/validation";
import type { ZenithContentType, ZenithPage, ZenithPageStatus } from "@/types/zenith-content";

function serializeZenithPage(data: Record<string, unknown>): ZenithPage {
  return deepSerializeFirestore(data) as unknown as ZenithPage;
}

export async function saveZenithDraftPage(
  page: ZenithPage,
  options?: { submittedBy?: string },
): Promise<{ mode: "created" | "updated"; page: ZenithPage }> {
  const { adminDb } = ensureFirebaseAdmin();
  const ref = adminDb.collection(CONTENT_COLLECTIONS.zenithPages).doc(page.slug);
  const snap = await ref.get();
  const now = FieldValue.serverTimestamp();
  const submittedBy = options?.submittedBy ?? page.submittedBy ?? "zenithmind";
  const nextVersion = snap.exists
    ? Number((snap.data() as { version?: number })?.version ?? 0) + 1
    : 1;
  const createdAt = snap.exists ? (snap.data() as { createdAt?: unknown }).createdAt : now;

  const payload = {
    ...page,
    status: "draft" as const,
    submittedBy,
    version: nextVersion,
    lastSubmittedAt: now,
    updatedAt: now,
    createdAt,
  };

  await ref.set(payload, { merge: false });
  const fresh = await ref.get();
  const saved = serializeZenithPage({
    ...(fresh.data() as Record<string, unknown>),
    slug: page.slug,
  });
  revalidateZenithPagePaths(saved);
  return {
    mode: snap.exists ? "updated" : "created",
    page: saved,
  };
}

export async function getZenithPageBySlug(slug: string): Promise<ZenithPage | null> {
  if (!isValidSlug(slug)) return null;
  const { adminDb } = ensureFirebaseAdmin();
  const snap = await adminDb.collection(CONTENT_COLLECTIONS.zenithPages).doc(slug).get();
  if (!snap.exists) return null;
  return serializeZenithPage({ ...(snap.data() as Record<string, unknown>), slug });
}

export async function getPublishedZenithPageBySlug(slug: string): Promise<ZenithPage | null> {
  const p = await getZenithPageBySlug(slug);
  if (!p || p.status !== "published") return null;
  return p;
}

export async function listZenithPages(filters?: {
  status?: ZenithPageStatus;
  contentType?: ZenithContentType;
  q?: string;
  limit?: number;
  cursor?: string;
}): Promise<{ pages: ZenithPage[]; nextCursor?: string }> {
  const { adminDb } = ensureFirebaseAdmin();
  const limit = Math.min(Math.max(1, filters?.limit ?? 30), 100);
  const col = adminDb.collection(CONTENT_COLLECTIONS.zenithPages);
  let snap;
  try {
    snap = await col.orderBy("updatedAt", "desc").limit(200).get();
  } catch {
    snap = await col.limit(200).get();
  }
  let rows = snap.docs.map((d) =>
    serializeZenithPage({ ...(d.data() as Record<string, unknown>), slug: d.id }),
  );
  rows.sort((a, b) => String(b.updatedAt ?? "").localeCompare(String(a.updatedAt ?? "")));
  if (filters?.status) {
    rows = rows.filter((p) => p.status === filters.status);
  }
  if (filters?.contentType) {
    rows = rows.filter((p) => p.contentType === filters.contentType);
  }
  if (filters?.q?.trim()) {
    const q = filters.q.trim().toLowerCase();
    rows = rows.filter(
      (p) =>
        p.slug.toLowerCase().includes(q) ||
        (p.title ?? "").toLowerCase().includes(q) ||
        (p.seo?.metaTitle ?? "").toLowerCase().includes(q),
    );
  }
  if (filters?.cursor) {
    const marker = filters.cursor;
    const idx = rows.findIndex((p) => `${String(p.updatedAt ?? "")}__${p.slug}` === marker);
    if (idx >= 0) {
      rows = rows.slice(idx + 1);
    }
  }
  let nextCursor: string | undefined;
  if (rows.length > limit) {
    const last = rows[limit - 1];
    nextCursor = `${String(last.updatedAt ?? "")}__${last.slug}`;
    rows = rows.slice(0, limit);
  }
  return { pages: rows, nextCursor };
}

export async function publishZenithPage(slug: string): Promise<ZenithPage> {
  const { adminDb } = ensureFirebaseAdmin();
  const ref = adminDb.collection(CONTENT_COLLECTIONS.zenithPages).doc(slug);
  const snap = await ref.get();
  if (!snap.exists) {
    throw new Error("Page not found");
  }
  const existing = serializeZenithPage({ ...(snap.data() as Record<string, unknown>), slug });
  const prepared = prepareZenithPageForPublish(existing);
  const now = FieldValue.serverTimestamp();
  const data = snap.data() as Record<string, unknown>;
  const publishedAt = data.publishedAt ?? now;
  await ref.set(
    {
      status: "published",
      publishedAt,
      updatedAt: now,
      seo: prepared.seo,
      ogImage: prepared.ogImage,
    },
    { merge: true },
  );
  const p = await getZenithPageBySlug(slug);
  if (!p) throw new Error("Page missing after publish");
  revalidateZenithPagePaths(p);
  return p;
}

export async function unpublishZenithPage(slug: string): Promise<ZenithPage> {
  const { adminDb } = ensureFirebaseAdmin();
  const ref = adminDb.collection(CONTENT_COLLECTIONS.zenithPages).doc(slug);
  const snap = await ref.get();
  if (!snap.exists) {
    throw new Error("Page not found");
  }
  await ref.set({ status: "draft", updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  const p = await getZenithPageBySlug(slug);
  if (!p) throw new Error("Page missing after unpublish");
  revalidateZenithPagePaths(p);
  return p;
}

export async function updateZenithPage(
  slug: string,
  patch: Partial<ZenithPage>,
): Promise<ZenithPage> {
  const existing = await getZenithPageBySlug(slug);
  if (!existing) {
    throw new Error("Page not found");
  }
  const rest: Partial<ZenithPage> = { ...patch };
  delete (rest as { source?: unknown }).source;
  delete (rest as { slug?: unknown }).slug;
  delete (rest as { id?: unknown }).id;
  const merged: ZenithPage = {
    ...existing,
    ...rest,
    source: "zenithmind",
    slug: existing.slug,
    id: existing.id,
    components: patch.components ?? existing.components,
    seo: patch.seo ? { ...existing.seo, ...patch.seo } : existing.seo,
    ogImage: patch.ogImage ? { ...existing.ogImage, ...patch.ogImage } : existing.ogImage,
  };
  const validated = validateZenithPageDocument(merged);
  if (!validated.ok || !validated.normalized) {
    throw new Error(validated.errors.join("; ") || "Invalid Zenith page after patch");
  }
  const toSave = validated.normalized;
  const { adminDb } = ensureFirebaseAdmin();
  await adminDb
    .collection(CONTENT_COLLECTIONS.zenithPages)
    .doc(slug)
    .set(
      {
        ...toSave,
        updatedAt: FieldValue.serverTimestamp(),
        version: (existing.version ?? 1) + 1,
      },
      { merge: true },
    );
  const p = await getZenithPageBySlug(slug);
  if (!p) throw new Error("Page missing after update");
  revalidateZenithPagePaths(p);
  return p;
}

export async function deleteZenithPage(slug: string): Promise<void> {
  const existing = await getZenithPageBySlug(slug);
  const { adminDb } = ensureFirebaseAdmin();
  await adminDb.collection(CONTENT_COLLECTIONS.zenithPages).doc(slug).delete();
  if (existing) {
    revalidateZenithPagePaths(existing);
  }
}

/** Slugs for published Zenith pages of a given type (for generateStaticParams merge). */
export async function listPublishedZenithSlugsByContentType(
  contentType: ZenithContentType,
): Promise<{ slug: string }[]> {
  if (!hasServerFirebaseConfig()) {
    return [];
  }
  const { pages } = await listZenithPages({ status: "published", contentType, limit: 500 });
  return pages.map((p) => ({ slug: p.slug }));
}
