"use client";

import Link from "next/link";

import { AdminContentTable } from "@/components/admin/AdminContentTable";
import { ContentActions } from "@/components/admin/ContentActions";
import { ContentStatusBadge } from "@/components/admin/ContentStatusBadge";
import { useAdminApiList } from "@/hooks/useAdminApiList";

type Row = Record<string, unknown>;

function primaryClusterCell(row: Row): string {
  const il = row.internalLinking;
  if (il && typeof il === "object" && "primaryCluster" in il) {
    return String((il as { primaryCluster?: string }).primaryCluster ?? "—");
  }
  return "—";
}

function keywordPrimary(row: Row): string {
  const kw = row.keyword;
  if (kw && typeof kw === "object" && "primary" in kw) {
    return String((kw as { primary?: string }).primary ?? "—");
  }
  return "—";
}

function maxLinksCell(row: Row): string {
  const il = row.internalLinking;
  if (il && typeof il === "object" && "maxLinks" in il) {
    const n = (il as { maxLinks?: unknown }).maxLinks;
    return typeof n === "number" ? String(n) : "—";
  }
  return "—";
}

export default function AdminArticlesPage() {
  const { data, loading, error, reload } = useAdminApiList<Row>("/api/admin/articles");

  return (
    <div>
      <h1 className="font-serif text-2xl text-foreground">Articles</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Public URLs are available for published articles at{" "}
        <code className="rounded bg-muted px-1">/articles/[slug]</code>. Use{" "}
        <strong className="font-medium text-foreground">Preview</strong> to render any status (draft
        / review / published) in the admin console.
      </p>
      {loading ? <p className="mt-4 text-sm text-muted-foreground">Loading…</p> : null}
      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
      {!loading && !error ? (
        <div className="mt-6">
          <AdminContentTable
            headers={[
              "Title",
              "Slug",
              "Status",
              "Updated",
              "Primary keyword",
              "Cluster",
              "Max links",
              "Preview",
              "Public",
              "Actions",
            ]}
          >
            {data.map((row) => {
              const slug = String(row.slug ?? row.id ?? "");
              const title = String(row.title ?? "—");
              const status = String(row.status ?? "draft");
              const updated = String(row.updatedAt ?? row.createdAt ?? "—");
              const published = status === "published";
              return (
                <tr key={slug} className="align-top">
                  <td className="px-3 py-2 font-medium">{title}</td>
                  <td className="px-3 py-2 font-mono text-xs">{slug}</td>
                  <td className="px-3 py-2">
                    <ContentStatusBadge status={status} />
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{updated}</td>
                  <td className="px-3 py-2 text-xs">{keywordPrimary(row)}</td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                    {primaryClusterCell(row)}
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{maxLinksCell(row)}</td>
                  <td className="px-3 py-2 text-xs">
                    <Link
                      href={`/app/admin/preview/articles/${encodeURIComponent(slug)}`}
                      className="text-primary underline"
                    >
                      Preview
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {published ? (
                      <a
                        href={`/articles/${slug}`}
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
                      contentType="article"
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
            <p className="mt-4 text-sm text-muted-foreground">No articles yet.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
