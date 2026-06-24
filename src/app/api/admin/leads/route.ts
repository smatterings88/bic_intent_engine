import { AdminApiError, assertCurrentUserIsAdmin } from "@/lib/admin/auth";
import {
  getLeadSummaryForAdmin,
  listLeadsForAdmin,
  listRecentLeadsForAdmin,
} from "@/lib/admin/leads";
import type { LeadAdminFilterInput } from "@/types/admin-leads";

export const runtime = "nodejs";

function parseFilters(url: URL): LeadAdminFilterInput | undefined {
  const ghlStatus = url.searchParams.get("ghlStatus")?.trim();
  const landingPageSlug = url.searchParams.get("landingPageSlug")?.trim();
  const leadMagnetId = url.searchParams.get("leadMagnetId")?.trim();
  const campaignType = url.searchParams.get("campaignType")?.trim();
  if (!ghlStatus && !landingPageSlug && !leadMagnetId && !campaignType) {
    return undefined;
  }
  return {
    ...(ghlStatus ? { ghlStatus } : {}),
    ...(landingPageSlug ? { landingPageSlug } : {}),
    ...(leadMagnetId ? { leadMagnetId } : {}),
    ...(campaignType ? { campaignType } : {}),
  };
}

export async function GET(request: Request) {
  try {
    await assertCurrentUserIsAdmin(request);
    const url = new URL(request.url);
    const summaryOnly = url.searchParams.get("summaryOnly") === "1";
    const recentParam = url.searchParams.get("recent");
    const recentN = recentParam ? Math.min(50, Math.max(1, Number(recentParam) || 0)) : 0;
    const filters = parseFilters(url);

    if (summaryOnly) {
      const summary = await getLeadSummaryForAdmin();
      const recentLeads = recentN > 0 ? await listRecentLeadsForAdmin(recentN) : undefined;
      return Response.json({
        ok: true,
        leads: [],
        summary,
        ...(recentLeads ? { recentLeads } : {}),
      });
    }

    const leads = await listLeadsForAdmin(filters);
    const summary = await getLeadSummaryForAdmin();
    return Response.json({ ok: true, leads, summary });
  } catch (e) {
    if (e instanceof AdminApiError) {
      return Response.json({ ok: false, error: { message: e.message } }, { status: e.statusCode });
    }
    const msg = e instanceof Error ? e.message : "Internal error";
    return Response.json({ ok: false, error: { message: msg } }, { status: 500 });
  }
}
