import { AdminApiError, assertCurrentUserIsAdmin } from "@/lib/admin/auth";
import { getLeadForAdmin } from "@/lib/admin/leads";

export const runtime = "nodejs";

export async function GET(request: Request, context: { params: Promise<{ leadId: string }> }) {
  try {
    await assertCurrentUserIsAdmin(request);
    const { leadId } = await context.params;
    const lead = await getLeadForAdmin(leadId);
    if (!lead) {
      return Response.json({ ok: false, error: { message: "Lead not found" } }, { status: 404 });
    }
    return Response.json({ ok: true, lead });
  } catch (e) {
    if (e instanceof AdminApiError) {
      return Response.json({ ok: false, error: { message: e.message } }, { status: e.statusCode });
    }
    const msg = e instanceof Error ? e.message : "Internal error";
    return Response.json({ ok: false, error: { message: msg } }, { status: 500 });
  }
}
