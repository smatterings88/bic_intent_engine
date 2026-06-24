"use client";

import { useCallback, useEffect, useState } from "react";

import { ArticleTemplate } from "@/components/articles/ArticleTemplate";
import { useAuth } from "@/components/auth/AuthProvider";
import { fetchAdminArticlePreview } from "@/lib/admin/preview-client-actions";
import type { Article } from "@/types/article";

import { AdminContentPreviewBanner } from "./AdminContentPreviewBanner";

export function AdminArticlePreviewClient({ slug }: { slug: string }) {
  const { user, loading: authLoading } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
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
      const data = await fetchAdminArticlePreview(token, slug);
      setArticle(data);
      setError(null);
      if (typeof document !== "undefined") {
        document.title = `${data.title} (preview) — Admin`;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setArticle(null);
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
  if (error || !article) {
    return <p className="text-sm text-destructive">{error ?? "Could not load article."}</p>;
  }

  const status = article.status ?? "draft";
  const publicHref = status === "published" ? `/articles/${slug}` : null;

  return (
    <div>
      <AdminContentPreviewBanner
        kind="article"
        slug={slug}
        status={status}
        publicHref={publicHref}
      />
      <div className="rounded-xl border border-border bg-background shadow-sm">
        <ArticleTemplate article={article} />
      </div>
    </div>
  );
}
