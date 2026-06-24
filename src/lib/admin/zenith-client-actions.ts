import type { ZenithContentType, ZenithPage, ZenithPageStatus } from "@/types/zenith-content";

export type AdminZenithPageListItem = {
  slug: string;
  title: string;
  contentType: ZenithContentType;
  status: ZenithPageStatus;
  updatedAt: string;
  publishedAt: string;
  componentCount: number;
  ogImageUrl: string;
  publicUrl: string;
  previewUrl: string;
};

export type AdminZenithPagesListResponse = {
  ok: true;
  pages: AdminZenithPageListItem[];
  nextCursor?: string;
};

export type AdminZenithPageDetailResponse = {
  ok: true;
  page: ZenithPage;
  validation?: { ok: boolean; errors: string[]; warnings: string[] };
};

function buildQuery(filters?: {
  status?: "all" | ZenithPageStatus;
  contentType?: "all" | ZenithContentType;
  q?: string;
}): string {
  const p = new URLSearchParams();
  if (!filters) return p.toString();
  if (filters.status && filters.status !== "all") p.set("status", filters.status);
  if (filters.contentType && filters.contentType !== "all")
    p.set("contentType", filters.contentType);
  if (filters.q?.trim()) p.set("q", filters.q.trim());
  return p.toString();
}

export async function fetchAdminZenithPages(
  idToken: string,
  filters?: {
    status?: "all" | ZenithPageStatus;
    contentType?: "all" | ZenithContentType;
    q?: string;
  },
): Promise<AdminZenithPagesListResponse> {
  const qs = buildQuery(filters);
  const url = qs ? `/api/admin/zenith/pages?${qs}` : "/api/admin/zenith/pages";
  const res = await fetch(url, { headers: { Authorization: `Bearer ${idToken}` } });
  const json = (await res.json()) as {
    ok?: boolean;
    pages?: AdminZenithPageListItem[];
    nextCursor?: string;
    error?: string | { message?: string };
  };
  const errMsg =
    typeof json.error === "string"
      ? json.error
      : json.error && typeof json.error === "object" && "message" in json.error
        ? String((json.error as { message?: string }).message)
        : undefined;
  if (!res.ok || !json.ok) {
    throw new Error(errMsg ?? res.statusText);
  }
  return { ok: true as const, pages: json.pages ?? [], nextCursor: json.nextCursor };
}

export async function fetchAdminZenithPage(
  idToken: string,
  slug: string,
): Promise<AdminZenithPageDetailResponse> {
  const res = await fetch(`/api/admin/zenith/pages/${encodeURIComponent(slug)}`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  const json = (await res.json()) as {
    ok?: boolean;
    page?: ZenithPage;
    validation?: { ok?: boolean; errors?: string[]; warnings?: string[] };
    error?: string | { message?: string };
  };
  const errMsg =
    typeof json.error === "string"
      ? json.error
      : json.error && typeof json.error === "object" && "message" in json.error
        ? String((json.error as { message?: string }).message)
        : undefined;
  if (!res.ok || !json.ok || !json.page) {
    throw new Error(errMsg ?? res.statusText);
  }
  return {
    ok: true as const,
    page: json.page,
    validation: json.validation
      ? {
          ok: json.validation.ok === true,
          errors: json.validation.errors ?? [],
          warnings: json.validation.warnings ?? [],
        }
      : undefined,
  };
}

export async function publishAdminZenithPage(
  idToken: string,
  slug: string,
): Promise<{
  ok: boolean;
  page?: ZenithPage;
  warnings?: string[];
  errors?: string[];
  publicUrl?: string;
  error?: string;
}> {
  const res = await fetch(`/api/admin/zenith/pages/${encodeURIComponent(slug)}/publish`, {
    method: "POST",
    headers: { Authorization: `Bearer ${idToken}` },
  });
  const json = (await res.json()) as {
    ok?: boolean;
    page?: ZenithPage;
    warnings?: string[];
    errors?: string[];
    publicUrl?: string;
    error?: string;
  };
  if (!res.ok || !json.ok) {
    return {
      ok: false,
      errors: json.errors,
      warnings: json.warnings,
      error: json.error ?? res.statusText,
    };
  }
  return { ok: true, page: json.page, warnings: json.warnings, publicUrl: json.publicUrl };
}

export async function unpublishAdminZenithPage(
  idToken: string,
  slug: string,
): Promise<{ ok: boolean; page?: ZenithPage; error?: string }> {
  const res = await fetch(`/api/admin/zenith/pages/${encodeURIComponent(slug)}/unpublish`, {
    method: "POST",
    headers: { Authorization: `Bearer ${idToken}` },
  });
  const json = (await res.json()) as { ok?: boolean; page?: ZenithPage; error?: string };
  return { ok: res.ok && json.ok === true, page: json.page, error: json.error };
}
