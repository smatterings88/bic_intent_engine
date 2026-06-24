import "server-only";

import type { DocumentData, Timestamp } from "firebase-admin/firestore";
import { ensureFirebaseAdmin } from "@/lib/firebase/admin";
import { CONTENT_COLLECTIONS } from "@/lib/content/constants";

const LIST_LIMIT = 50;

function serializeValue(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as Timestamp).toDate === "function"
  ) {
    return (value as Timestamp).toDate().toISOString();
  }
  if (Array.isArray(value)) {
    return value.map((v) => serializeValue(v));
  }
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = serializeValue(v);
    }
    return out;
  }
  return value;
}

function serializeDoc(id: string, data: DocumentData): Record<string, unknown> {
  const flat = { ...data, id };
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(flat)) {
    out[k] = serializeValue(v);
  }
  return out;
}

async function queryLatest(
  collection: string,
  orderField: "updatedAt" | "createdAt",
): Promise<Record<string, unknown>[]> {
  const { adminDb } = ensureFirebaseAdmin();
  try {
    const snap = await adminDb
      .collection(collection)
      .orderBy(orderField, "desc")
      .limit(LIST_LIMIT)
      .get();
    return snap.docs.map((d) => serializeDoc(d.id, d.data()));
  } catch {
    const snap = await adminDb.collection(collection).limit(LIST_LIMIT).get();
    const rows = snap.docs.map((d) => serializeDoc(d.id, d.data()));
    rows.sort((a, b) => {
      const ta = String(a[orderField] ?? a.createdAt ?? "");
      const tb = String(b[orderField] ?? b.createdAt ?? "");
      return tb.localeCompare(ta);
    });
    return rows.slice(0, LIST_LIMIT);
  }
}

export async function listArticlesForAdmin(): Promise<Record<string, unknown>[]> {
  return queryLatest(CONTENT_COLLECTIONS.articles, "updatedAt");
}

export async function listLandingPagesForAdmin(): Promise<Record<string, unknown>[]> {
  return queryLatest(CONTENT_COLLECTIONS.landingPages, "updatedAt");
}

export async function listLeadMagnetsForAdmin(): Promise<Record<string, unknown>[]> {
  return queryLatest(CONTENT_COLLECTIONS.leadMagnets, "updatedAt");
}

export async function listZenithIngestionsForAdmin(): Promise<Record<string, unknown>[]> {
  return queryLatest(CONTENT_COLLECTIONS.zenithIngestions, "createdAt");
}
