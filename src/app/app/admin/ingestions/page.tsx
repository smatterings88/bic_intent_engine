"use client";

import { AdminContentTable } from "@/components/admin/AdminContentTable";
import { ContentStatusBadge } from "@/components/admin/ContentStatusBadge";
import { useAdminApiList } from "@/hooks/useAdminApiList";

type Row = Record<string, unknown>;

function validationSummary(row: Row): string {
  const v = row.validationErrors;
  if (Array.isArray(v) && v.length) {
    return `${v.length} error(s)`;
  }
  return "—";
}

export default function AdminIngestionsPage() {
  const { data, loading, error } = useAdminApiList<Row>("/api/admin/ingestions");

  return (
    <div>
      <h1 className="font-serif text-2xl text-foreground">Zenith ingestions</h1>
      <p className="mt-1 text-sm text-muted-foreground">Latest ingestion audit rows (read-only).</p>
      {loading ? <p className="mt-4 text-sm text-muted-foreground">Loading…</p> : null}
      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
      {!loading && !error ? (
        <div className="mt-6">
          <AdminContentTable
            headers={["Type", "Status", "Target collection", "Target id", "Created", "Validation"]}
          >
            {data.map((row) => {
              const id = String(row.id ?? "");
              return (
                <tr key={id} className="align-top">
                  <td className="px-3 py-2 text-xs">{String(row.contentType ?? "—")}</td>
                  <td className="px-3 py-2">
                    <ContentStatusBadge status={String(row.status ?? "—")} />
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {String(row.targetCollection ?? "—")}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{String(row.targetId ?? "—")}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {String(row.createdAt ?? "—")}
                  </td>
                  <td className="px-3 py-2 text-xs">{validationSummary(row)}</td>
                </tr>
              );
            })}
          </AdminContentTable>
          {data.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No ingestions yet.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
