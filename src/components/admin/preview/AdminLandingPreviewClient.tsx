"use client";

import { useCallback, useEffect, useState } from "react";

import { LandingPageTemplate } from "@/components/landing-pages/LandingPageTemplate";
import { useAuth } from "@/components/auth/AuthProvider";
import { fetchAdminLandingPreview } from "@/lib/admin/preview-client-actions";
import type { LandingPage } from "@/types/landing-page";

import { AdminContentPreviewBanner } from "./AdminContentPreviewBanner";

export function AdminLandingPreviewClient({ slug }: { slug: string }) {
  const { user, loading: authLoading } = useAuth();
  const [landingPage, setLandingPage] = useState<LandingPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const data = await fetchAdminLandingPreview(token, slug);
      setLandingPage(data);
      setError(null);
      if (typeof document !== "undefined") {
        document.title = `${data.hero.headline} (preview) — Admin`;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setLandingPage(null);
    } finally {
      setLoading(false);
    }
  }, [user, slug]);

  useEffect(() => {
    if (authLoading) return;
    void load();
  }, [authLoading, load]);

  if (authLoading || loading) {
    return <p className="text-sm text-muted-foreground">Loading preview…</p>;
  }
  if (!user) {
    return <p className="text-sm text-muted-foreground">Sign in required.</p>;
  }
  if (error || !landingPage) {
    return <p className="text-sm text-destructive">{error ?? "Could not load landing page."}</p>;
  }

  const status = landingPage.status ?? "draft";
  const publicHref = status === "published" ? `/${slug}` : null;

  return (
    <div>
      <AdminContentPreviewBanner
        kind="landing_page"
        slug={slug}
        status={status}
        publicHref={publicHref}
      />
      <div className="rounded-xl border border-border bg-background shadow-sm">
        <LandingPageTemplate landingPage={landingPage} />
      </div>
    </div>
  );
}
