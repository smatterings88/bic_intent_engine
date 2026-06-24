import { ZenithAuthError, verifyZenithRequest } from "@/lib/zenith/auth";
import { jsonError, jsonOk } from "@/lib/zenith/responses";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    verifyZenithRequest(request);
  } catch (e) {
    if (e instanceof ZenithAuthError) {
      return jsonError("Unauthorized", 401);
    }
    return jsonError(e instanceof Error ? e.message : "Server configuration error", 500);
  }

  return jsonOk({
    ok: true,
    service: "zenith-ingestion",
    timestamp: new Date().toISOString(),
  });
}
