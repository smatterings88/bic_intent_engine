"use client";

import { useCallback, useEffect, useState } from "react";

import Link from "next/link";

import { useAuth } from "@/components/auth/AuthProvider";
import { fetchAdminLead } from "@/lib/admin/lead-client-actions";
import type { LeadAdminDetail } from "@/types/admin-leads";

import { LeadDetailPanel } from "./LeadDetailPanel";
import { RetryGhlSyncButton } from "./RetryGhlSyncButton";

export function AdminLeadDetailClient({ leadId }: { leadId: string }) {
  const { user, loading: authLoading } = useAuth();
  const [lead, setLead] = useState<LeadAdminDetail | null>(null);
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
      const data = await fetchAdminLead(token, leadId);
      setLead(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setLead(null);
    } finally {
      setLoading(false);
    }
  }, [user, leadId]);

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
  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading lead…</p>;
  }
  if (error || !lead) {
    return (
      <div>
        <p className="text-sm text-destructive">{error ?? "Lead not found."}</p>
        <Link href="/app/admin/leads" className="mt-4 inline-block text-sm text-primary underline">
          Back to leads
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/app/admin/leads" className="text-sm text-primary underline">
        ← All leads
      </Link>
      <LeadDetailPanel lead={lead} />
      <RetryGhlSyncButton leadId={leadId} ghlStatus={lead.ghlStatus} onComplete={() => load()} />
    </div>
  );
}
