import { AdminApiError, assertCurrentUserIsAdmin } from "@/lib/admin/auth";
import { listZenithPages } from "@/lib/zenith/firestore";
import { getOgImageUrlForPage } from "@/lib/zenith/og";
import {
  getBaseUrl,
  getPreviewPathForZenithPage,
  getPublicPathForZenithPage,
} from "@/lib/zenith/routes";
import type { ZenithContentType, ZenithPageStatus } from "@/types/zenith-content";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await assertCurrentUserIsAdmin(request);
  } catch (e) {
    if (e instanceof AdminApiError) {
      return Response.json({ ok: false, error: e.message }, { status: e.statusCode });
    }
    throw e;
  }
  const url = new URL(request.url);
  const status = url.searchParams.get("status")?.trim() as ZenithPageStatus | undefined;
  const contentType = url.searchParams.get("contentType")?.trim() as ZenithContentType | undefined;
  const q = url.searchParams.get("q")?.trim();
  const limit = url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : undefined;
  const cursor = url.searchParams.get("cursor")?.trim();

  const { pages, nextCursor } = await listZenithPages({
    ...(status === "draft" || status === "published" ? { status } : {}),
    ...(contentType ? { contentType } : {}),
    ...(q ? { q } : {}),
    ...(Number.isFinite(limit) ? { limit } : {}),
    ...(cursor ? { cursor } : {}),
  });

  const base = getBaseUrl();
  const rows = pages.map((p) => ({
    slug: p.slug,
    title: p.title ?? "",
    contentType: p.contentType,
    status: p.status,
    updatedAt: p.updatedAt != null ? String(p.updatedAt) : "",
    publishedAt: p.publishedAt != null ? String(p.publishedAt) : "",
    componentCount: p.components?.length ?? 0,
    ogImageUrl: getOgImageUrlForPage(p, base),
    publicUrl: getPublicPathForZenithPage(p),
    previewUrl: getPreviewPathForZenithPage(p),
  }));

  return Response.json({ ok: true, pages: rows, nextCursor });
}
