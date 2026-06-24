import type { Article } from "@/types/article";
import type { LandingPage } from "@/types/landing-page";

export async function fetchAdminArticlePreview(idToken: string, slug: string): Promise<Article> {
  const res = await fetch(`/api/admin/preview/articles/${encodeURIComponent(slug)}`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  const json = (await res.json()) as {
    ok?: boolean;
    article?: Article;
    error?: { message?: string };
  };
  if (!res.ok || !json.ok || !json.article) {
    throw new Error(json.error?.message ?? res.statusText);
  }
  return json.article;
}

export async function fetchAdminLandingPreview(
  idToken: string,
  slug: string,
): Promise<LandingPage> {
  const res = await fetch(`/api/admin/preview/landing-pages/${encodeURIComponent(slug)}`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  const json = (await res.json()) as {
    ok?: boolean;
    landingPage?: LandingPage;
    error?: { message?: string };
  };
  if (!res.ok || !json.ok || !json.landingPage) {
    throw new Error(json.error?.message ?? res.statusText);
  }
  return json.landingPage;
}
