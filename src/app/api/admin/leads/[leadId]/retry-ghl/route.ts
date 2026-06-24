import { GHLApiError } from "@/lib/ghl/errors";
import { syncLandingPageOptInToGhl } from "@/lib/ghl/opt-in";
import { getPublishedLandingPageBySlug } from "@/lib/landing-pages/read";
import { markLeadGhlSyncFailed, updateLeadGhlSync } from "@/lib/leads/store";
import { AdminApiError, assertCurrentUserIsAdmin } from "@/lib/admin/auth";
import { getLeadForAdmin } from "@/lib/admin/leads";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ leadId: string }> }) {
  try {
    await assertCurrentUserIsAdmin(request);
    const { leadId } = await context.params;
    const lead = await getLeadForAdmin(leadId);
    if (!lead) {
      return Response.json({ ok: false, error: { message: "Lead not found" } }, { status: 404 });
    }

    const slug = lead.landingPageSlug?.trim();
    if (!slug) {
      return Response.json(
        { ok: false, error: { message: "Lead has no landing page slug; cannot retry GHL sync" } },
        { status: 400 },
      );
    }

    const landing = await getPublishedLandingPageBySlug(slug);

    try {
      const ghlResult = await syncLandingPageOptInToGhl({
        email: lead.email,
        firstName: lead.firstName,
        lastName: lead.lastName,
        phone: lead.phone,
        sourcePage: lead.sourcePage,
        landingPageSlug: slug,
        leadMagnetId: lead.leadMagnetId,
        campaignType: lead.campaignType,
        ghlTagStrategy: landing?.conversion.ghlTagStrategy,
        ghlTags: landing?.conversion.ghlTagStrategy ? undefined : landing?.conversion.ghlTags,
        utm: lead.utm,
      });
      await updateLeadGhlSync(leadId, ghlResult);
      return Response.json({
        ok: true,
        ghl: {
          status: ghlResult.status,
          contactId: ghlResult.contactId,
          tagsApplied: ghlResult.tagsApplied,
        },
      });
    } catch (e) {
      await markLeadGhlSyncFailed(leadId, e);
      const message =
        e instanceof GHLApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "GoHighLevel sync failed";
      return Response.json(
        {
          ok: false,
          error: { message },
          ghl: { status: "failed" as const },
        },
        { status: 502 },
      );
    }
  } catch (e) {
    if (e instanceof AdminApiError) {
      return Response.json({ ok: false, error: { message: e.message } }, { status: e.statusCode });
    }
    const msg = e instanceof Error ? e.message : "Internal error";
    return Response.json({ ok: false, error: { message: msg } }, { status: 500 });
  }
}
