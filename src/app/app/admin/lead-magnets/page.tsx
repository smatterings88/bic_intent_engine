"use client";

import { AdminContentTable } from "@/components/admin/AdminContentTable";
import { ContentActions } from "@/components/admin/ContentActions";
import { ContentStatusBadge } from "@/components/admin/ContentStatusBadge";
import { useAdminApiList } from "@/hooks/useAdminApiList";

type Row = Record<string, unknown>;

export default function AdminLeadMagnetsPage() {
  const { data, loading, error, reload } = useAdminApiList<Row>("/api/admin/lead-magnets");

  return (
    <div>
      <h1 className="font-serif text-2xl text-foreground">Lead magnets</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Reusable assets; delivery and GHL tag metadata only in this phase.
      </p>
      {loading ? <p className="mt-4 text-sm text-muted-foreground">Loading…</p> : null}
      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
      {!loading && !error ? (
        <div className="mt-6">
          <AdminContentTable headers={["Title", "Id", "Status", "Delivery", "GHL tag", "Actions"]}>
            {data.map((row) => {
              const id = String(row.id ?? "");
              const title = String(row.title ?? "—");
              const status = String(row.status ?? "draft");
              const delivery = String(row.deliveryType ?? "—");
              const tag = String(row.ghlTag ?? "—");
              return (
                <tr key={id} className="align-top">
                  <td className="px-3 py-2 font-medium">{title}</td>
                  <td className="px-3 py-2 font-mono text-xs">{id}</td>
                  <td className="px-3 py-2">
                    <ContentStatusBadge status={status} />
                  </td>
                  <td className="px-3 py-2 text-xs">{delivery}</td>
                  <td className="px-3 py-2 text-xs">{tag}</td>
                  <td className="px-3 py-2">
                    <ContentActions
                      contentType="lead_magnet"
                      id={id}
                      onDone={() => {
                        void reload();
                      }}
                    />
                  </td>
                </tr>
              );
            })}
          </AdminContentTable>
          {data.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No lead magnets yet.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
