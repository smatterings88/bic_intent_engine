import type { LeadAdminSummary } from "@/types/admin-leads";

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-border bg-muted/20 px-4 py-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-lg text-foreground">{value}</p>
    </div>
  );
}

export function LeadSummaryCards({ summary }: { summary: LeadAdminSummary | null }) {
  if (!summary) {
    return <p className="text-sm text-muted-foreground">No summary data.</p>;
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Card label="Total leads" value={summary.totalLeads} />
      <Card label="Leads today (UTC)" value={summary.leadsToday} />
      <Card label="Tagged in GHL" value={summary.taggedLeads} />
      <Card label="Failed GHL syncs" value={summary.failedGhlSyncs} />
      <Card label="Pending GHL syncs" value={summary.pendingGhlSyncs} />
      <Card label="Top landing page" value={summary.topLandingPageSlug ?? "—"} />
      <Card label="Top lead magnet" value={summary.topLeadMagnetId ?? "—"} />
    </div>
  );
}
