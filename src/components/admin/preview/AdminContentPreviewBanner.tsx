import Link from "next/link";

export function AdminContentPreviewBanner({
  kind,
  slug,
  status,
  publicHref,
}: {
  kind: "article" | "landing_page";
  slug: string;
  status: string;
  publicHref: string | null;
}) {
  const listHref = kind === "article" ? "/app/admin/articles" : "/app/admin/landing-pages";
  const published = status === "published";
  return (
    <div className="mb-6 rounded-lg border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-foreground">
      <p className="font-medium">Admin preview</p>
      <p className="mt-1 text-muted-foreground">
        This page is not indexed. Status:{" "}
        <span className="font-mono text-foreground">{status}</span> ·{" "}
        <span className="font-mono text-xs">{slug}</span>
      </p>
      {kind === "landing_page" && !published ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Lead magnet opt-in submits only succeed after this landing page is published (public API
          checks published content).
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-3 text-xs">
        <Link href={listHref} className="text-primary underline underline-offset-4">
          ← Back to list
        </Link>
        {published && publicHref ? (
          <a
            href={publicHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-4"
          >
            Open live public URL
          </a>
        ) : null}
      </div>
    </div>
  );
}
