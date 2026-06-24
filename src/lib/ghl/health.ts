import { ghlLocationId, ghlRequest } from "./request";

export type GhlHealthResult = {
  healthy: boolean;
  status: number;
  message?: string;
};

/**
 * v2 health check: GET /locations/{locationId}
 */
export async function checkGhlHealth(): Promise<GhlHealthResult> {
  try {
    await ghlRequest(`/locations/${encodeURIComponent(ghlLocationId())}`);
    return { healthy: true, status: 200 };
  } catch (e) {
    if (e && typeof e === "object" && "statusCode" in e) {
      const err = e as { statusCode: number; message?: string };
      return { healthy: false, status: err.statusCode, message: err.message };
    }
    return { healthy: false, status: 0, message: e instanceof Error ? e.message : "Unknown error" };
  }
}
