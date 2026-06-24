import { AdminApiError, assertCurrentUserIsAdmin } from "@/lib/admin/auth";
import { listLeadMagnetsForAdmin } from "@/lib/admin/content";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await assertCurrentUserIsAdmin(request);
    const items = await listLeadMagnetsForAdmin();
    return Response.json({ ok: true, items });
  } catch (e) {
    if (e instanceof AdminApiError) {
      return Response.json({ ok: false, error: { message: e.message } }, { status: e.statusCode });
    }
    const msg = e instanceof Error ? e.message : "Internal error";
    return Response.json({ ok: false, error: { message: msg } }, { status: 500 });
  }
}
