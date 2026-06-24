"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { ZenithDebugRenderer } from "@/components/zenith/ZenithDebugRenderer";
import { ZenithPageRenderer } from "@/components/zenith/ZenithPageRenderer";
import { buildZenithPageMetadata } from "@/lib/zenith/metadata";
import type { ZenithPage } from "@/types/zenith-content";

class ZenithPreviewErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    void error;
    void info;
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export function ZenithPreviewClient({ slug, baseUrl }: { slug: string; baseUrl?: string }) {
  const { user, loading: authLoading } = useAuth();
  const [page, setPage] = useState<ZenithPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [boundaryKey, setBoundaryKey] = useState(0);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/zenith/pages/${encodeURIComponent(slug)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as { ok?: boolean; page?: ZenithPage; error?: string };
      if (!res.ok || !data.ok || !data.page) {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      setPage(data.page);
      setError(null);
      setBoundaryKey((k) => k + 1);
      const meta = buildZenithPageMetadata(data.page, undefined, { preview: true });
      if (typeof document !== "undefined" && meta.title) {
        document.title = String(meta.title);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPage(null);
    } finally {
      setLoading(false);
    }
  }, [user, slug]);

  useEffect(() => {
    if (authLoading) return;
    void load();
  }, [authLoading, load]);

  if (authLoading || loading) {
    return <p className="p-6 text-sm text-slate-400">Loading preview…</p>;
  }
  if (!user) {
    return (
      <p className="p-6 text-sm text-slate-400">Sign in as an admin to preview Zenith pages.</p>
    );
  }
  if (error || !page) {
    return <p className="p-6 text-sm text-red-400">{error ?? "Could not load page."}</p>;
  }

  return (
    <div className="min-h-screen">
      <ZenithPreviewErrorBoundary key={boundaryKey} fallback={<ZenithDebugRenderer page={page} />}>
        <ZenithPageRenderer page={page} mode="preview" relatedCards={[]} baseUrl={baseUrl} />
      </ZenithPreviewErrorBoundary>
      <details className="mx-auto mt-10 max-w-3xl border-t border-slate-200 px-4 pb-16 dark:border-slate-700">
        <summary className="cursor-pointer py-3 text-sm font-medium text-slate-600 dark:text-slate-400">
          Admin debug — raw JSON
        </summary>
        <pre className="max-h-[360px] overflow-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-200">
          {JSON.stringify(page, null, 2)}
        </pre>
      </details>
    </div>
  );
}
