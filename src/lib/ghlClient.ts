/**
 * GoHighLevel LeadConnector v2 — centralized client (Private Integration Token).
 *
 * Prefer importing from `@/lib/ghl/request` or this barrel. All HTTP uses `fetch`
 * via `ghlRequest`; auth is `GHL_PIT_TOKEN` / `VITE_GHL_PIT_TOKEN` (pit-… prefix).
 */
export {
  GHLApiError,
  GHL_API_VERSION,
  ghlFetch,
  ghlLocationId,
  ghlRequest,
  ghlRequestWithRetry,
  type GhlRequestContext,
  type GhlRequestOptions,
} from "./ghl/request";
