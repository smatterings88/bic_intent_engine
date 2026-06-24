"use client";

import Link from "next/link";

import { AdminContentTable } from "@/components/admin/AdminContentTable";
import { ContentActions } from "@/components/admin/ContentActions";
import { ContentStatusBadge } from "@/components/admin/ContentStatusBadge";
import { useAdminApiList } from "@/hooks/useAdminApiList";

type Row = Record<string, unknown>;

function headline(row: Row): string {
  const h = row.hero;
  if (h && typeof h === "object" && "headline" in h) {
    return String((h as { headline?: string }).headline ?? "—");
  }
  return "—";
}

export default function AdminLandingPagesPage() {
  const { data, loading, error, reload } = useAdminApiList<Row>("/api/admin/landing-pages");

  return (
    <div>
      <h1 className="font-serif text-2xl text-foreground">Landing pages</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Published landing pages are public at their slug URL (for example{" "}
        <code className="rounded bg-muted px-1">/sales-call-analysis</code>), except when the slug
        is reserved for the marketing site. Use{" "}
        <strong className="font-medium text-foreground">Preview</strong> to render any status in the
        admin console.
      </p>
      {loading ? <p className="mt-4 text-sm text-muted-foreground">Loading…</p> : null}
      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
      {!loading && !error ? (
        <div className="mt-6">
          <AdminContentTable
            headers={[
              "Headline",
              "Slug",
              "Status",
              "Campaign",
              "Primary magnet",
              "Preview",
              "Public",
              "Actions",
            ]}
          >
            {data.map((row) => {
              const slug = String(row.slug ?? row.id ?? "");
              const status = String(row.status ?? "draft");
              const campaign = String(row.campaignType ?? "—");
              const magnet = String(row.primaryLeadMagnetId ?? "—");
              const published = status === "published";
              return (
                <tr key={slug} className="align-top">
                  <td className="px-3 py-2 font-medium">{headline(row)}</td>
                  <td className="px-3 py-2 font-mono text-xs">{slug}</td>
                  <td className="px-3 py-2">
                    <ContentStatusBadge status={status} />
                  </td>
                  <td className="px-3 py-2 text-xs">{campaign}</td>
                  <td className="px-3 py-2 font-mono text-xs">{magnet}</td>
                  <td className="px-3 py-2 text-xs">
                    <Link
                      href={`/app/admin/preview/landing-pages/${encodeURIComponent(slug)}`}
                      className="text-primary underline"
                    >
                      Preview
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {published ? (
                      <a
                        href={`/${slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        View
                      </a>
                    ) : (
                      <span className="text-muted-foreground">Publish to view public URL</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <ContentActions
                      contentType="landing_page"
                      id={slug}
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
            <p className="mt-4 text-sm text-muted-foreground">No landing pages yet.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
