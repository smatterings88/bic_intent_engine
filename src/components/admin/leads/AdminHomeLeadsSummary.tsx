"use client";

import { useCallback, useEffect, useState } from "react";

import Link from "next/link";

import { useAuth } from "@/components/auth/AuthProvider";
import { fetchAdminLeads } from "@/lib/admin/lead-client-actions";
import type { LeadAdminListItem, LeadAdminSummary } from "@/types/admin-leads";

import { LeadSummaryCards } from "./LeadSummaryCards";

export function AdminHomeLeadsSummary() {
  const { user, loading: authLoading } = useAuth();
  const [summary, setSummary] = useState<LeadAdminSummary | null>(null);
  const [recent, setRecent] = useState<LeadAdminListItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const data = await fetchAdminLeads(token, undefined, { summaryOnly: true, recent: 5 });
      setSummary(data.summary ?? null);
      setRecent(data.recentLeads ?? []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setSummary(null);
      setRecent([]);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading || !user) return;
    void load();
  }, [authLoading, user, load]);

  if (authLoading || !user) {
    return null;
  }

  return (
    <section className="mt-10 border-t border-border pt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl text-foreground">Leads</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Failed GHL syncs and recent opt-ins from landing pages.
          </p>
        </div>
        <Link
          href="/app/admin/leads"
          className="rounded-md border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Open lead dashboard
        </Link>
      </div>
      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
      <div className="mt-4">
        <LeadSummaryCards summary={summary} />
      </div>
      <div className="mt-6">
        <h3 className="text-sm font-medium text-foreground">Recent opt-ins</h3>
        {recent.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No recent leads yet.</p>
        ) : (
          <ul className="mt-2 space-y-2 text-sm">
            {recent.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/60 pb-2"
              >
                <span className="font-mono text-xs text-muted-foreground">{r.createdAt}</span>
                <span className="min-w-0 flex-1 truncate">{r.email}</span>
                <Link href={`/app/admin/leads/${r.id}`} className="shrink-0 text-primary underline">
                  View
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
