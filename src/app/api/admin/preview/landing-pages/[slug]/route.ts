import { AdminApiError, assertCurrentUserIsAdmin } from "@/lib/admin/auth";
import { getLandingPageBySlug } from "@/lib/landing-pages/read";

export const runtime = "nodejs";

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    await assertCurrentUserIsAdmin(request);
    const { slug } = await context.params;
    const landingPage = await getLandingPageBySlug(slug);
    if (!landingPage) {
      return Response.json(
        { ok: false, error: { message: "Landing page not found" } },
        { status: 404 },
      );
    }
    return Response.json({ ok: true, landingPage });
  } catch (e) {
    if (e instanceof AdminApiError) {
      return Response.json({ ok: false, error: { message: e.message } }, { status: e.statusCode });
    }
    const msg = e instanceof Error ? e.message : "Internal error";
    return Response.json({ ok: false, error: { message: msg } }, { status: 500 });
  }
}
