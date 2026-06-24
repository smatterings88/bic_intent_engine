import { ZenithAuthError, verifyZenithRequest } from "@/lib/zenith/auth";
import { jsonError, jsonOk, zodIssuesToDetails } from "@/lib/zenith/responses";
import { saveLeadMagnetDraftFromZenith } from "@/lib/zenith/store";
import { validateZenithLeadMagnetPayload } from "@/lib/zenith/validate";

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

  const v = validateZenithLeadMagnetPayload(body);
  if (!v.ok) {
    return jsonError("Validation failed", 400, zodIssuesToDetails(v.issues));
  }

  try {
    const saved = await saveLeadMagnetDraftFromZenith({
      leadMagnet: v.data.leadMagnet,
      rawPayload: body,
    });
    return jsonOk({
      ok: true,
      contentType: "lead_magnet",
      id: saved.id,
      path: saved.path,
      status: saved.status,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal server error";
    return jsonError("Internal server error", 500, { message: msg });
  }
}
