import type {
  LeadAdminDetail,
  LeadAdminFilterInput,
  LeadAdminListItem,
  LeadAdminSummary,
} from "@/types/admin-leads";

function buildQuery(filters?: LeadAdminFilterInput): string {
  const p = new URLSearchParams();
  if (!filters) return p.toString();
  if (filters.ghlStatus) p.set("ghlStatus", filters.ghlStatus);
  if (filters.landingPageSlug) p.set("landingPageSlug", filters.landingPageSlug);
  if (filters.leadMagnetId) p.set("leadMagnetId", filters.leadMagnetId);
  if (filters.campaignType) p.set("campaignType", filters.campaignType);
  return p.toString();
}

export type AdminLeadsListResponse = {
  ok: true;
  leads: LeadAdminListItem[];
  summary?: LeadAdminSummary;
  recentLeads?: LeadAdminListItem[];
};

export async function fetchAdminLeads(
  idToken: string,
  filters?: LeadAdminFilterInput,
  options?: { summaryOnly?: boolean; recent?: number },
): Promise<AdminLeadsListResponse> {
  const q = buildQuery(filters);
  const extra = new URLSearchParams(q);
  if (options?.summaryOnly) extra.set("summaryOnly", "1");
  if (options?.recent != null) extra.set("recent", String(options.recent));
  const qs = extra.toString();
  const url = qs ? `/api/admin/leads?${qs}` : "/api/admin/leads";
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  const json = (await res.json()) as {
    ok?: boolean;
    leads?: LeadAdminListItem[];
    summary?: LeadAdminSummary;
    recentLeads?: LeadAdminListItem[];
    error?: { message?: string };
  };
  if (!res.ok || !json.ok) {
    throw new Error(json.error?.message ?? res.statusText);
  }
  return {
    ok: true as const,
    leads: json.leads ?? [],
    summary: json.summary,
    recentLeads: json.recentLeads,
  };
}

export async function fetchAdminLead(idToken: string, leadId: string): Promise<LeadAdminDetail> {
  const res = await fetch(`/api/admin/leads/${encodeURIComponent(leadId)}`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  const json = (await res.json()) as {
    ok?: boolean;
    lead?: LeadAdminDetail;
    error?: { message?: string };
  };
  if (!res.ok || !json.ok || !json.lead) {
    throw new Error(json.error?.message ?? res.statusText);
  }
  return json.lead;
}

export async function retryLeadGhlSync(
  idToken: string,
  leadId: string,
): Promise<{
  ok: boolean;
  ghl?: { status?: string; contactId?: string; tagsApplied?: string[] };
  error?: string;
}> {
  const res = await fetch(`/api/admin/leads/${encodeURIComponent(leadId)}/retry-ghl`, {
    method: "POST",
    headers: { Authorization: `Bearer ${idToken}` },
  });
  const json = (await res.json()) as {
    ok?: boolean;
    ghl?: { status?: string; contactId?: string; tagsApplied?: string[] };
    error?: string | { message?: string };
  };
  const errMsg =
    typeof json.error === "string"
      ? json.error
      : json.error && typeof json.error === "object" && "message" in json.error
        ? String((json.error as { message?: string }).message)
        : undefined;
  return {
    ok: res.ok && json.ok === true,
    ghl: json.ghl,
    error: errMsg,
  };
}
