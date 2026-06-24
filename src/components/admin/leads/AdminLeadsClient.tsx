"use client";

import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { fetchAdminLeads } from "@/lib/admin/lead-client-actions";
import type {
  LeadAdminFilterInput,
  LeadAdminListItem,
  LeadAdminSummary,
} from "@/types/admin-leads";

import { LeadFilters } from "./LeadFilters";
import { LeadSummaryCards } from "./LeadSummaryCards";
import { LeadTable } from "./LeadTable";

function normalizeFilters(f: LeadAdminFilterInput): LeadAdminFilterInput {
  const out: LeadAdminFilterInput = {};
  if (f.ghlStatus?.trim()) out.ghlStatus = f.ghlStatus.trim();
  if (f.landingPageSlug?.trim()) out.landingPageSlug = f.landingPageSlug.trim();
  if (f.leadMagnetId?.trim()) out.leadMagnetId = f.leadMagnetId.trim();
  if (f.campaignType?.trim()) out.campaignType = f.campaignType.trim();
  return out;
}

export function AdminLeadsClient() {
  const { user, loading: authLoading } = useAuth();
  const [filters, setFilters] = useState<LeadAdminFilterInput>({});
  const [leads, setLeads] = useState<LeadAdminListItem[]>([]);
  const [summary, setSummary] = useState<LeadAdminSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const normalized = normalizeFilters(filters);
      const data = await fetchAdminLeads(
        token,
        Object.keys(normalized).length ? normalized : undefined,
      );
      setLeads(data.leads);
      setSummary(data.summary ?? null);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setLeads([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [user, filters]);

  useEffect(() => {
    if (authLoading) return;
    void load();
  }, [authLoading, load]);

  if (authLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }
  if (!user) {
    return <p className="text-sm text-muted-foreground">Sign in required.</p>;
  }

  return (
    <div className="space-y-6">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <LeadSummaryCards summary={summary} />
      <div>
        <h2 className="text-sm font-medium text-foreground">Filters</h2>
        <div className="mt-2">
          <LeadFilters value={filters} onChange={setFilters} />
        </div>
      </div>
      {loading ? <p className="text-sm text-muted-foreground">Loading leads…</p> : null}
      {!loading && !error ? (
        <div>
          <LeadTable leads={leads} />
          {leads.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No leads match these filters.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
