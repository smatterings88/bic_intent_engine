import { AdminApiError, assertCurrentUserIsAdmin } from "@/lib/admin/auth";
import { assertZenithSecret } from "@/lib/zenith/content-auth";
import { getZenithPageBySlug, saveZenithDraftPage } from "@/lib/zenith/firestore";
import { getOgImageUrlForPage } from "@/lib/zenith/og";
import {
  getPreviewPathForZenithPage,
  getPublicPathForZenithPage,
  getBaseUrl,
} from "@/lib/zenith/routes";
import { validateZenithPagePayload } from "@/lib/zenith/validation";

export const runtime = "nodejs";

async function assertZenithSecretOrAdmin(request: Request): Promise<void> {
  const zen = assertZenithSecret(request);
  if (zen.ok) {
    return;
  }
  await assertCurrentUserIsAdmin(request);
}

export async function POST(request: Request) {
  const auth = assertZenithSecret(request);
  if (!auth.ok) {
    return Response.json({ ok: false, errors: [auth.message] }, { status: auth.status });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, errors: ["Invalid JSON body"] }, { status: 400 });
  }
  const v = validateZenithPagePayload(body);
  if (!v.ok || !v.normalized) {
    return Response.json({ ok: false, errors: v.errors }, { status: 400 });
  }
  const page = v.normalized;
  const { mode, page: saved } = await saveZenithDraftPage(page, {
    submittedBy: page.submittedBy,
  });
  const base = getBaseUrl();
  const slug = saved.slug;
  const previewUrl = getPreviewPathForZenithPage(saved);
  const publicUrl = getPublicPathForZenithPage(saved);
  const ogPath = `/api/og/${encodeURIComponent(slug)}`;
  const ogImageUrl = saved.ogImage?.cdnUrl?.trim() ? getOgImageUrlForPage(saved, base) : ogPath;

  return Response.json(
    {
      ok: true,
      mode,
      slug,
      status: "draft" as const,
      previewUrl,
      publicUrl,
      ogImageUrl,
    },
    { status: mode === "created" ? 201 : 200 },
  );
}

export async function GET(request: Request) {
  try {
    await assertZenithSecretOrAdmin(request);
  } catch (e) {
    if (e instanceof AdminApiError) {
      return Response.json({ ok: false, error: e.message }, { status: e.statusCode });
    }
    throw e;
  }
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug")?.trim();
  if (!slug) {
    return Response.json({ ok: false, error: "Missing slug query parameter" }, { status: 400 });
  }
  const page = await getZenithPageBySlug(slug);
  if (!page) {
    return Response.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  return Response.json({ ok: true, page });
}
