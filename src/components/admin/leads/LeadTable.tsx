import Link from "next/link";

import { AdminContentTable } from "@/components/admin/AdminContentTable";
import type { LeadAdminListItem } from "@/types/admin-leads";

import { GhlStatusBadge } from "./GhlStatusBadge";

function fullName(row: LeadAdminListItem): string {
  const parts = [row.firstName, row.lastName].filter(Boolean);
  return parts.length ? parts.join(" ") : "—";
}

export function LeadTable({ leads }: { leads: LeadAdminListItem[] }) {
  return (
    <AdminContentTable
      headers={[
        "Email",
        "Name",
        "Source page",
        "Landing page",
        "Lead magnet",
        "Campaign",
        "GHL status",
        "GHL contact",
        "Created",
        "",
      ]}
    >
      {leads.map((row) => (
        <tr key={row.id} className="align-top">
          <td className="px-3 py-2 text-xs">{row.email}</td>
          <td className="px-3 py-2 text-xs">{fullName(row)}</td>
          <td
            className="max-w-[140px] truncate px-3 py-2 font-mono text-[11px] text-muted-foreground"
            title={row.sourcePage}
          >
            {row.sourcePage || "—"}
          </td>
          <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
            {row.landingPageSlug ?? "—"}
          </td>
          <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
            {row.leadMagnetId ?? "—"}
          </td>
          <td className="px-3 py-2 text-xs text-muted-foreground">{row.campaignType ?? "—"}</td>
          <td className="px-3 py-2">
            <GhlStatusBadge status={row.ghlStatus} />
          </td>
          <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">
            {row.ghlContactId ?? "—"}
          </td>
          <td className="px-3 py-2 text-xs text-muted-foreground">{row.createdAt || "—"}</td>
          <td className="px-3 py-2 text-xs">
            <Link href={`/app/admin/leads/${row.id}`} className="text-primary underline">
              View
            </Link>
          </td>
        </tr>
      ))}
    </AdminContentTable>
  );
}
