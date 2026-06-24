import type { AdminZenithPageListItem } from "@/lib/admin/zenith-client-actions";

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

export function ZenithPageSummaryCards({ pages }: { pages: AdminZenithPageListItem[] }) {
  const total = pages.length;
  const draft = pages.filter((p) => p.status === "draft").length;
  const published = pages.filter((p) => p.status === "published").length;
  const articles = pages.filter((p) => p.contentType === "article").length;
  const landings = pages.filter((p) => p.contentType === "landing_page").length;
  const leadMagnets = pages.filter((p) => p.contentType === "lead_magnet_page").length;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <Card label="Total" value={String(total)} />
      <Card label="Draft" value={String(draft)} />
      <Card label="Published" value={String(published)} />
      <Card label="Articles" value={String(articles)} />
      <Card label="Landing" value={String(landings)} />
      <Card label="Lead magnets" value={String(leadMagnets)} />
    </div>
  );
}
