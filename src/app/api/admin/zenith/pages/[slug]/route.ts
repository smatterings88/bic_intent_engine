import { AdminApiError, assertCurrentUserIsAdmin } from "@/lib/admin/auth";
import { getZenithPageBySlug, updateZenithPage } from "@/lib/zenith/firestore";
import { validateZenithPageForPublish } from "@/lib/zenith/publishValidation";
import type { ZenithPage } from "@/types/zenith-content";

export const runtime = "nodejs";

const PATCH_KEYS = new Set([
  "status",
  "seo",
  "ogImage",
  "title",
  "relatedArticleSlugs",
  "leadMagnetId",
  "components",
  "keyword",
  "schema",
]);

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    await assertCurrentUserIsAdmin(request);
  } catch (e) {
    if (e instanceof AdminApiError) {
      return Response.json({ ok: false, error: e.message }, { status: e.statusCode });
    }
    throw e;
  }
  const { slug } = await context.params;
  const page = await getZenithPageBySlug(slug);
  if (!page) {
    return Response.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  const v = validateZenithPageForPublish(page);
  return Response.json({
    ok: true,
    page,
    validation: { ok: v.ok, errors: v.errors, warnings: v.warnings },
  });
}

export async function PATCH(request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    await assertCurrentUserIsAdmin(request);
  } catch (e) {
    if (e instanceof AdminApiError) {
      return Response.json({ ok: false, error: e.message }, { status: e.statusCode });
    }
    throw e;
  }
  const { slug } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return Response.json({ ok: false, error: "Body must be an object" }, { status: 400 });
  }
  const patch: Partial<ZenithPage> = {};
  for (const [k, v] of Object.entries(body as Record<string, unknown>)) {
    if (PATCH_KEYS.has(k)) {
      (patch as Record<string, unknown>)[k] = v;
    }
  }
  try {
    const page = await updateZenithPage(slug, patch);
    return Response.json({ ok: true, page });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Update failed";
    const status = msg.includes("not found") ? 404 : 400;
    return Response.json({ ok: false, error: msg }, { status });
  }
}
