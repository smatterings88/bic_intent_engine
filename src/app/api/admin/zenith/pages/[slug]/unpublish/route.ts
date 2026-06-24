import { AdminApiError, assertCurrentUserIsAdmin } from "@/lib/admin/auth";
import { unpublishZenithPage } from "@/lib/zenith/firestore";
import { getPreviewPathForZenithPage } from "@/lib/zenith/routes";

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
  try {
    const page = await unpublishZenithPage(slug);
    const previewUrl = getPreviewPathForZenithPage(page);
    return Response.json({ ok: true, page, previewUrl });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unpublish failed";
    const status = msg.includes("not found") ? 404 : 400;
    return Response.json({ ok: false, error: msg }, { status });
  }
}
