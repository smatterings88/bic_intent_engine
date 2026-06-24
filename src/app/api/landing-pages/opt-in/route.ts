import { GHLApiError } from "@/lib/ghl/errors";
import { syncLandingPageOptInToGhl } from "@/lib/ghl/opt-in";
import { getPublishedLandingPageBySlug } from "@/lib/landing-pages/read";
import { landingPageOptInSchema } from "@/lib/leads/schemas";
import { createLeadRecord, markLeadGhlSyncFailed, updateLeadGhlSync } from "@/lib/leads/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: { message: "Invalid JSON body" } }, { status: 400 });
  }

  const parsed = landingPageOptInSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { ok: false, error: { message: "Validation failed", details: parsed.error.flatten() } },
      { status: 400 },
    );
  }

  const landing = await getPublishedLandingPageBySlug(parsed.data.landingPageSlug);
  if (!landing) {
    return Response.json(
      { ok: false, error: { message: "Landing page not found or not published" } },
      { status: 404 },
    );
  }

  const leadMagnetId = parsed.data.leadMagnetId ?? landing.primaryLeadMagnetId;
  const campaignType = parsed.data.campaignType ?? landing.campaignType;

  let leadId: string;
  try {
    const created = await createLeadRecord({
      ...parsed.data,
      leadMagnetId,
      campaignType,
    });
    leadId = created.leadId;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to save lead";
    return Response.json({ ok: false, error: { message: msg } }, { status: 500 });
  }

  try {
    const ghlResult = await syncLandingPageOptInToGhl({
      email: parsed.data.email,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: parsed.data.phone,
      sourcePage: parsed.data.sourcePage,
      landingPageSlug: parsed.data.landingPageSlug,
      leadMagnetId,
      campaignType,
      ghlTagStrategy: landing.conversion.ghlTagStrategy,
      ghlTags: landing.conversion.ghlTagStrategy ? undefined : landing.conversion.ghlTags,
      utm: parsed.data.utm,
    });
    await updateLeadGhlSync(leadId, ghlResult);
    return Response.json({
      ok: true,
      leadId,
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
        leadId,
        error: { message },
      },
      { status: 502 },
    );
  }
}
