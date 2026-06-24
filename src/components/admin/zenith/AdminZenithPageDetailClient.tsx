"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import {
  fetchAdminZenithPage,
  publishAdminZenithPage,
  unpublishAdminZenithPage,
} from "@/lib/admin/zenith-client-actions";
import {
  ZenithContentTypeBadge,
  ZenithRenderModeBadge,
} from "@/components/admin/zenith/ZenithContentTypeBadge";
import { getPageRenderMode } from "@/lib/zenith/render-mode";
import { ZenithStatusBadge } from "@/components/admin/zenith/ZenithStatusBadge";
import { ZenithComponentOverview } from "@/components/admin/zenith/ZenithComponentOverview";
import { ZenithOgPreview } from "@/components/admin/zenith/ZenithOgPreview";
import { ZenithPageLinksPanel } from "@/components/admin/zenith/ZenithPageLinksPanel";
import { ZenithRawJsonPanel } from "@/components/admin/zenith/ZenithRawJsonPanel";
import { ZenithSeoPanel } from "@/components/admin/zenith/ZenithSeoPanel";
import { ZenithValidationPanel } from "@/components/admin/zenith/ZenithValidationPanel";
import type { ZenithPage } from "@/types/zenith-content";

function fmtDate(raw?: unknown): string {
  if (!raw) return "";
  const d = new Date(String(raw));
  if (Number.isNaN(d.getTime())) return String(raw);
  return d.toLocaleString();
}

export function AdminZenithPageDetailClient({ slug }: { slug: string }) {
  const { user, loading: authLoading } = useAuth();
  const [page, setPage] = useState<ZenithPage | null>(null);
  const [validation, setValidation] = useState<
    { ok: boolean; errors: string[]; warnings: string[] } | undefined
  >(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<{ kind: "ok" | "warn" | "err"; message: string } | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const data = await fetchAdminZenithPage(token, slug);
      setPage(data.page);
      setValidation(data.validation);
      setError(null);
      if (typeof document !== "undefined") {
        document.title = `${data.page.title || data.page.slug} — Zenith (admin)`;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPage(null);
      setValidation(undefined);
    } finally {
      setLoading(false);
    }
  }, [user, slug]);

  useEffect(() => {
    if (authLoading) return;
    void load();
  }, [authLoading, load]);

  async function publish() {
    if (!user || !page) return;
    if (!confirm("Publish this Zenith page?")) return;
    setBusy(true);
    setFlash(null);
    try {
      const token = await user.getIdToken();
      const res = await publishAdminZenithPage(token, page.slug);
      if (!res.ok) {
        setFlash({ kind: "err", message: res.error ?? res.errors?.join("; ") ?? "Publish failed" });
        return;
      }
      setFlash(
        res.warnings?.length
          ? { kind: "warn", message: `Published with warnings: ${res.warnings.join(" · ")}` }
          : { kind: "ok", message: "Published" },
      );
      await load();
    } catch (e) {
      setFlash({ kind: "err", message: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(false);
    }
  }

  async function unpublish() {
    if (!user || !page) return;
    if (!confirm("Unpublish this page? It will no longer be publicly accessible.")) return;
    setBusy(true);
    setFlash(null);
    try {
      const token = await user.getIdToken();
      const res = await unpublishAdminZenithPage(token, page.slug);
      if (!res.ok) {
        setFlash({ kind: "err", message: res.error ?? "Unpublish failed" });
        return;
      }
      setFlash({ kind: "ok", message: "Unpublished" });
      await load();
    } catch (e) {
      setFlash({ kind: "err", message: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(false);
    }
  }

  if (authLoading || loading) {
    return <p className="text-sm text-muted-foreground">Loading Zenith page…</p>;
  }
  if (!user) {
    return <p className="text-sm text-muted-foreground">Sign in required.</p>;
  }
  if (error || !page) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-destructive">{error ?? "Could not load page."}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-muted"
        >
          Retry
        </button>
      </div>
    );
  }

  const canPublish = page.status === "draft";
  const canUnpublish = page.status === "published";
  const previewHref = `/preview/${encodeURIComponent(page.slug)}`;

  return (
    <div className="space-y-6">
      {flash ? (
        <div
          className={
            "rounded-md border p-4 text-sm " +
            (flash.kind === "ok"
              ? "border-emerald-300 bg-emerald-50 text-emerald-950"
              : flash.kind === "warn"
                ? "border-amber-300 bg-amber-50 text-amber-950"
                : "border-destructive/40 bg-destructive/10 text-destructive")
          }
        >
          {flash.message}
        </div>
      ) : null}

      <header className="rounded-lg border border-border bg-background p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate font-serif text-2xl text-foreground">
              {page.title?.trim() || page.slug}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              <code className="rounded bg-muted px-1">{page.slug}</code>
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <ZenithContentTypeBadge contentType={page.contentType} />
              <ZenithRenderModeBadge renderMode={page.renderMode ?? getPageRenderMode(page)} />
              <ZenithStatusBadge status={page.status} />
              {page.html ? (
                <span className="text-xs text-muted-foreground">
                  HTML {page.html.framework ?? "plain"}
                  {page.html.sanitizedBody ? " · body sanitized" : ""}
                  {page.html.css?.trim()
                    ? ` · CSS ${page.html.sanitizedCss ? "scoped" : "raw"} (~${Math.round(new TextEncoder().encode(page.html.css).length / 1024)}KB)`
                    : ""}
                </span>
              ) : null}
              {page.slots?.length ? (
                <span className="text-xs text-muted-foreground">
                  {page.slots.length} slot{page.slots.length === 1 ? "" : "s"} (
                  {page.slots.map((s) => s.slot).join(", ")})
                </span>
              ) : null}
              {page.layout?.hideGlobalFooter ? (
                <span className="rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                  Global footer hidden
                </span>
              ) : null}
              <span className="text-xs text-muted-foreground">v{page.version ?? 1}</span>
              {page.componentSpecVersion ? (
                <span className="text-xs text-muted-foreground">
                  spec {page.componentSpecVersion}
                </span>
              ) : null}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {page.createdAt ? <span>Created: {fmtDate(page.createdAt)}</span> : null}
              {page.updatedAt ? <span>Updated: {fmtDate(page.updatedAt)}</span> : null}
              {page.publishedAt ? <span>Published: {fmtDate(page.publishedAt)}</span> : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={previewHref}
              target="_blank"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-muted"
            >
              Preview
            </Link>
            {page.status === "published" ? (
              <Link
                href={
                  page.contentType === "article"
                    ? `/articles/${page.slug}`
                    : page.contentType === "landing_page" || page.contentType === "thank_you_page"
                      ? `/${page.slug}`
                      : page.contentType === "lead_magnet_page"
                        ? `/guides/${page.slug}`
                        : page.contentType === "webinar_page"
                          ? `/webinars/${page.slug}`
                          : page.contentType === "cta_page"
                            ? `/cta/${page.slug}`
                            : `/research/${page.slug}`
                }
                target="_blank"
                className="rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-muted"
              >
                Public
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="rounded-md border border-border bg-background px-3 py-2 text-sm opacity-50"
              >
                Public
              </button>
            )}
            <Link
              href={`/api/og/${encodeURIComponent(page.slug)}`}
              target="_blank"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-muted"
            >
              OG
            </Link>
            {canPublish ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void publish()}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"
              >
                Publish
              </button>
            ) : null}
            {canUnpublish ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void unpublish()}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"
              >
                Unpublish
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <ZenithPageLinksPanel page={page} />
          <ZenithSeoPanel page={page} />
          <ZenithValidationPanel page={page} validation={validation} />
        </div>
        <div className="space-y-6">
          <ZenithOgPreview page={page} />
          <ZenithComponentOverview page={page} />
        </div>
      </div>

      <ZenithRawJsonPanel page={page} />
    </div>
  );
}
