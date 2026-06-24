import { AdminLeadsClient } from "@/components/admin/leads/AdminLeadsClient";

export default function AdminLeadsPage() {
  return (
    <div>
      <h1 className="font-serif text-2xl text-foreground">Leads</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Opt-ins from published landing pages, synced to GoHighLevel. Use filters to narrow the list.
      </p>
      <div className="mt-6">
        <AdminLeadsClient />
      </div>
    </div>
  );
}
