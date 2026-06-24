import "server-only";

/**
 * @deprecated Import from `@/lib/ghl/request` — this module re-exports for existing call sites.
 */
export {
  GHL_API_VERSION,
  ghlFetch,
  ghlLocationId,
  ghlRequest,
  ghlRequestWithRetry,
} from "./request";
export type { GhlRequestContext, GhlRequestOptions } from "./request";
export { GHLApiError } from "./errors";
