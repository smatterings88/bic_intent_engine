import "server-only";

import type { DocumentData } from "firebase-admin/firestore";

import { deepSerializeFirestore } from "@/lib/articles/read";
import { ensureFirebaseAdmin } from "@/lib/firebase/admin";
import { CONTENT_COLLECTIONS } from "@/lib/content/constants";
import type {
  LeadAdminDetail,
  LeadAdminFilterInput,
  LeadAdminListItem,
  LeadAdminSummary,
} from "@/types/admin-leads";

const LIST_LIMIT = 100;
const SUMMARY_SAMPLE = 500;

function toIso(v: unknown): string {
  if (typeof v === "string") return v;
  if (v != null && typeof v === "object" && "toDate" in v) {
    const fn = (v as { toDate?: () => Date }).toDate;
    if (typeof fn === "function") {
      try {
        return fn.call(v).toISOString();
      } catch {
        return "";
      }
    }
  }
  return "";
}

function mapLeadListItem(id: string, raw: Record<string, unknown>): LeadAdminListItem {
  const ghl = (raw.ghl as Record<string, unknown> | undefined) ?? {};
  const tags = ghl.tagsApplied;
  return {
    id,
    email: String(raw.email ?? ""),
    firstName: raw.firstName ? String(raw.firstName) : undefined,
    lastName: raw.lastName ? String(raw.lastName) : undefined,
    phone: raw.phone ? String(raw.phone) : undefined,
    sourcePage: String(raw.sourcePage ?? ""),
    landingPageSlug: raw.landingPageSlug ? String(raw.landingPageSlug) : undefined,
    leadMagnetId: raw.leadMagnetId ? String(raw.leadMagnetId) : undefined,
    campaignType: raw.campaignType ? String(raw.campaignType) : undefined,
    ghlStatus: String(ghl.status ?? "pending"),
    ghlContactId: ghl.contactId ? String(ghl.contactId) : undefined,
    tagsApplied: Array.isArray(tags) ? (tags as string[]).filter((t) => typeof t === "string") : [],
    createdAt: toIso(raw.createdAt),
    updatedAt: toIso(raw.updatedAt),
    ghlError: ghl.error ? String(ghl.error) : undefined,
  };
}

function mapLeadDetail(id: string, raw: Record<string, unknown>): LeadAdminDetail {
  const base = mapLeadListItem(id, raw);
  const utmRaw = (raw.utm as Record<string, unknown> | undefined) ?? {};
  return {
    ...base,
    utm: {
      source: utmRaw.source ? String(utmRaw.source) : undefined,
      medium: utmRaw.medium ? String(utmRaw.medium) : undefined,
      campaign: utmRaw.campaign ? String(utmRaw.campaign) : undefined,
      term: utmRaw.term ? String(utmRaw.term) : undefined,
      content: utmRaw.content ? String(utmRaw.content) : undefined,
    },
  };
}

function applyFilters(
  rows: LeadAdminListItem[],
  filters?: LeadAdminFilterInput,
): LeadAdminListItem[] {
  if (!filters) return rows;
  return rows.filter((r) => {
    if (filters.ghlStatus && r.ghlStatus !== filters.ghlStatus) return false;
    if (filters.landingPageSlug && r.landingPageSlug !== filters.landingPageSlug) return false;
    if (filters.leadMagnetId && r.leadMagnetId !== filters.leadMagnetId) return false;
    if (filters.campaignType && r.campaignType !== filters.campaignType) return false;
    return true;
  });
}

function parseLeadDoc(id: string, data: DocumentData): LeadAdminListItem {
  const d = { ...data } as Record<string, unknown>;
  const raw: Record<string, unknown> = {
    ...d,
    id,
    createdAt: toIso(d.createdAt),
    updatedAt: toIso(d.updatedAt),
    ghl: d.ghl != null && typeof d.ghl === "object" ? deepSerializeFirestore(d.ghl) : d.ghl,
    utm: d.utm != null && typeof d.utm === "object" ? deepSerializeFirestore(d.utm) : d.utm,
  };
  return mapLeadListItem(id, raw);
}

export async function listLeadsForAdmin(
  filters?: LeadAdminFilterInput,
): Promise<LeadAdminListItem[]> {
  const { adminDb } = ensureFirebaseAdmin();
  const col = adminDb.collection(CONTENT_COLLECTIONS.leads);
  let snap;
  try {
    snap = await col.orderBy("createdAt", "desc").limit(LIST_LIMIT).get();
  } catch {
    snap = await col.limit(LIST_LIMIT).get();
  }
  const rows = snap.docs.map((d) => parseLeadDoc(d.id, d.data() ?? {}));
  rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
  return applyFilters(rows, filters);
}

export async function listRecentLeadsForAdmin(limit: number): Promise<LeadAdminListItem[]> {
  const { adminDb } = ensureFirebaseAdmin();
  const col = adminDb.collection(CONTENT_COLLECTIONS.leads);
  const n = Math.min(Math.max(1, limit), 50);
  let snap;
  try {
    snap = await col.orderBy("createdAt", "desc").limit(n).get();
  } catch {
    snap = await col.limit(n).get();
  }
  const rows = snap.docs.map((d) => parseLeadDoc(d.id, d.data() ?? {}));
  rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
  return rows.slice(0, n);
}

export async function getLeadForAdmin(leadId: string): Promise<LeadAdminDetail | null> {
  const { adminDb } = ensureFirebaseAdmin();
  const snap = await adminDb.collection(CONTENT_COLLECTIONS.leads).doc(leadId).get();
  if (!snap.exists) {
    return null;
  }
  const d = { ...(snap.data() ?? {}) } as Record<string, unknown>;
  const raw: Record<string, unknown> = {
    ...d,
    id: leadId,
    createdAt: toIso(d.createdAt),
    updatedAt: toIso(d.updatedAt),
    ghl: d.ghl != null && typeof d.ghl === "object" ? deepSerializeFirestore(d.ghl) : d.ghl,
    utm: d.utm != null && typeof d.utm === "object" ? deepSerializeFirestore(d.utm) : d.utm,
  };
  return mapLeadDetail(leadId, raw);
}

export async function getLeadSummaryForAdmin(): Promise<LeadAdminSummary> {
  const { adminDb } = ensureFirebaseAdmin();
  const col = adminDb.collection(CONTENT_COLLECTIONS.leads);

  let totalLeads = 0;
  try {
    const agg = await col.count().get();
    totalLeads = agg.data().count;
  } catch {
    const snap = await col.limit(200).get();
    totalLeads = snap.size;
  }

  let sampleSnap;
  try {
    sampleSnap = await col.orderBy("createdAt", "desc").limit(SUMMARY_SAMPLE).get();
  } catch {
    sampleSnap = await col.limit(SUMMARY_SAMPLE).get();
  }
  const sample = sampleSnap.docs.map((d) => parseLeadDoc(d.id, d.data() ?? {}));
  sample.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));

  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const startIso = startOfDay.toISOString();

  let leadsToday = 0;
  let taggedLeads = 0;
  let failedGhlSyncs = 0;
  let pendingGhlSyncs = 0;
  const landingCounts = new Map<string, number>();
  const magnetCounts = new Map<string, number>();

  for (const r of sample) {
    if (r.createdAt >= startIso) {
      leadsToday += 1;
    }
    if (r.ghlStatus === "tagged") {
      taggedLeads += 1;
    }
    if (r.ghlStatus === "failed") {
      failedGhlSyncs += 1;
    }
    if (r.ghlStatus === "pending") {
      pendingGhlSyncs += 1;
    }
    if (r.landingPageSlug) {
      landingCounts.set(r.landingPageSlug, (landingCounts.get(r.landingPageSlug) ?? 0) + 1);
    }
    if (r.leadMagnetId) {
      magnetCounts.set(r.leadMagnetId, (magnetCounts.get(r.leadMagnetId) ?? 0) + 1);
    }
  }

  const topLanding = maxKey(landingCounts);
  const topMagnet = maxKey(magnetCounts);

  return {
    totalLeads,
    leadsToday,
    taggedLeads,
    failedGhlSyncs,
    pendingGhlSyncs,
    topLandingPageSlug: topLanding,
    topLeadMagnetId: topMagnet,
  };
}

function maxKey(m: Map<string, number>): string | undefined {
  let best: string | undefined;
  let n = 0;
  for (const [k, v] of m) {
    if (v > n) {
      n = v;
      best = k;
    }
  }
  return best;
}
