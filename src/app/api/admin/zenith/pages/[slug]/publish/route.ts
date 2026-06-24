import { AdminApiError, assertCurrentUserIsAdmin } from "@/lib/admin/auth";
import { getZenithPageBySlug, publishZenithPage } from "@/lib/zenith/firestore";
import { getPublicPathForZenithPage, getBaseUrl, buildAbsoluteUrl } from "@/lib/zenith/routes";
import { validateZenithPageForPublish } from "@/lib/zenith/publishValidation";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
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
  const pub = validateZenithPageForPublish(page);
  if (!pub.ok) {
    return Response.json(
      {
        ok: false,
        error: pub.errors.join("; "),
        errors: pub.errors,
        warnings: pub.warnings,
      },
      { status: 400 },
    );
  }
  const published = await publishZenithPage(slug);
  const base = getBaseUrl();
  const publicPath = getPublicPathForZenithPage(published);
  const publicUrl = buildAbsoluteUrl(publicPath);
  return Response.json({
    ok: true,
    page: published,
    publicUrl,
    warnings: pub.warnings,
    baseUrl: base,
  });
}
