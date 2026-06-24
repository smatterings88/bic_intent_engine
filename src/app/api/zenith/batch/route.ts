import { isReservedTopLevelSlug } from "@/lib/content/slug";
import { ZenithAuthError, verifyZenithRequest } from "@/lib/zenith/auth";
import { jsonError, jsonOk, zodIssuesToDetails } from "@/lib/zenith/responses";
import { saveZenithBatch } from "@/lib/zenith/store";
import { validateZenithBatchPayload } from "@/lib/zenith/validate";

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

  const v = validateZenithBatchPayload(body);
  if (!v.ok) {
    return jsonError("Validation failed", 400, zodIssuesToDetails(v.issues));
  }

  const { articles = [], landingPages = [], leadMagnets = [] } = v.data;
  if (articles.length === 0 && landingPages.length === 0 && leadMagnets.length === 0) {
    return jsonError(
      "Batch payload must include at least one of: leadMagnets, articles, landingPages",
      400,
    );
  }

  for (const lp of landingPages) {
    if (isReservedTopLevelSlug(lp.slug)) {
      return jsonError("One or more landing page slugs are reserved", 400, {
        slug: lp.slug,
      });
    }
  }

  try {
    const out = await saveZenithBatch({
      rawPayload: body,
      leadMagnets,
      articles,
      landingPages,
    });
    return jsonOk({
      ok: true,
      contentType: "batch",
      ingestionId: out.ingestionId,
      results: out.results,
      errors: out.errors,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal server error";
    return jsonError("Internal server error", 500, { message: msg });
  }
}
