import { AdminLeadDetailClient } from "@/components/admin/leads/AdminLeadDetailClient";

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = await params;
  return (
    <div>
      <h1 className="font-serif text-2xl text-foreground">Lead detail</h1>
      <p className="mt-1 font-mono text-xs text-muted-foreground">{leadId}</p>
      <div className="mt-6">
        <AdminLeadDetailClient leadId={leadId} />
      </div>
    </div>
  );
}
