"use client";

import Link from "next/link";

import type { AdminZenithPageListItem } from "@/lib/admin/zenith-client-actions";
import { ZenithContentTypeBadge } from "@/components/admin/zenith/ZenithContentTypeBadge";
import { ZenithPageActions } from "@/components/admin/zenith/ZenithPageActions";
import { ZenithStatusBadge } from "@/components/admin/zenith/ZenithStatusBadge";

function fmtDate(raw: string): string {
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleString();
}

export function ZenithPagesTable({
  pages,
  onRefresh,
}: {
  pages: AdminZenithPageListItem[];
  onRefresh: () => void;
}) {
  if (!pages.length) {
    return <p className="text-sm text-muted-foreground">No Zenith pages found.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-background shadow-sm">
      <table className="min-w-[860px] w-full text-left text-sm">
        <thead className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Slug</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Components</th>
            <th className="px-4 py-3 font-medium">Updated</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {pages.map((p) => (
            <tr key={p.slug} className="border-b border-border/70 last:border-b-0">
              <td className="px-4 py-3">
                <Link
                  href={`/app/admin/zenith/${encodeURIComponent(p.slug)}`}
                  className="font-medium text-foreground underline decoration-muted-foreground/30 underline-offset-2 hover:decoration-muted-foreground"
                >
                  {p.title?.trim() || p.slug}
                </Link>
              </td>
              <td className="px-4 py-3">
                <code className="text-xs text-muted-foreground">{p.slug}</code>
              </td>
              <td className="px-4 py-3">
                <ZenithContentTypeBadge contentType={p.contentType} />
              </td>
              <td className="px-4 py-3">
                <ZenithStatusBadge status={p.status} />
              </td>
              <td className="px-4 py-3 text-muted-foreground">{p.componentCount}</td>
              <td className="px-4 py-3 text-muted-foreground">{fmtDate(p.updatedAt)}</td>
              <td className="px-4 py-3">
                <ZenithPageActions page={p} onRefresh={onRefresh} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
