import { isReservedTopLevelSlug } from "@/lib/content/slug";
import { ZenithAuthError, verifyZenithRequest } from "@/lib/zenith/auth";
import { jsonError, jsonOk, zodIssuesToDetails } from "@/lib/zenith/responses";
import { saveLandingPageDraftFromZenith } from "@/lib/zenith/store";
import { validateZenithLandingPagePayload } from "@/lib/zenith/validate";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    verifyZenithRequest(request);
  } catch (e) {
    if (e instanceof ZenithAuthError) {
      return jsonError("Unauthorized", 401);
    }
    return jsonError(e instanceof Error ? e.message : "Server configuration error", 500);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const v = validateZenithLandingPagePayload(body);
  if (!v.ok) {
    return jsonError("Validation failed", 400, zodIssuesToDetails(v.issues));
  }

  if (isReservedTopLevelSlug(v.data.landingPage.slug)) {
    return jsonError("Landing page slug is reserved for the marketing site or system routes", 400, {
      slug: v.data.landingPage.slug,
    });
  }

  try {
    const saved = await saveLandingPageDraftFromZenith({
      landingPage: v.data.landingPage,
      rawPayload: body,
    });
    return jsonOk({
      ok: true,
      contentType: "landing_page",
      slug: saved.slug,
      path: saved.path,
      status: saved.status,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal server error";
    return jsonError("Internal server error", 500, { message: msg });
  }
}
