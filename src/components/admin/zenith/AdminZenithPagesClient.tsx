"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import {
  fetchAdminZenithPages,
  type AdminZenithPageListItem,
} from "@/lib/admin/zenith-client-actions";
import {
  ZenithPageFilters,
  type ZenithPageFilterValue,
} from "@/components/admin/zenith/ZenithPageFilters";
import { ZenithPageSummaryCards } from "@/components/admin/zenith/ZenithPageSummaryCards";
import { ZenithPagesTable } from "@/components/admin/zenith/ZenithPagesTable";

export function AdminZenithPagesClient() {
  const { user, loading: authLoading } = useAuth();
  const [pages, setPages] = useState<AdminZenithPageListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filters, setFilters] = useState<ZenithPageFilterValue>({
    status: "all",
    contentType: "all",
    q: "",
  });

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const data = await fetchAdminZenithPages(token, filters);
      setPages(data.pages);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPages([]);
    } finally {
      setLoading(false);
    }
  }, [user, filters]);

  useEffect(() => {
    if (authLoading) return;
    void load();
  }, [authLoading, load, refreshKey]);

  const filteredPages = useMemo(() => pages, [pages]);

  if (authLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }
  if (!user) {
    return <p className="text-sm text-muted-foreground">Sign in required.</p>;
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}
      <ZenithPageSummaryCards pages={filteredPages} />
      <div>
        <h2 className="text-sm font-medium text-foreground">Filters</h2>
        <div className="mt-2">
          <ZenithPageFilters
            value={filters}
            onChange={setFilters}
            onRefresh={() => setRefreshKey((k) => k + 1)}
            disabled={loading}
          />
        </div>
      </div>
      {loading ? <p className="text-sm text-muted-foreground">Loading Zenith pages…</p> : null}
      {!loading ? (
        <ZenithPagesTable pages={filteredPages} onRefresh={() => setRefreshKey((k) => k + 1)} />
      ) : null}
      {!loading && !error && filteredPages.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No Zenith pages yet. Submit content through <code>/api/zenith/content</code>.
        </p>
      ) : null}
    </div>
  );
}
