import {
  getGhlApiBaseUrl,
  getGhlApiVersion,
  getGhlPitToken,
  getGhlUserAgent,
  requireGhlLocationId,
} from "@/lib/env";

import { GHLApiError, handleGhlResponse, type GhlRequestContext } from "./errors";
import { retryWithBackoff } from "./rate-limit";

export type { GhlRequestContext };
export { GHLApiError };

/** LeadConnector API version header (owned here — do not duplicate at call sites). */
export const GHL_API_VERSION = getGhlApiVersion();

export type GhlRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
};

function buildHeaders(extra: Record<string, string> = {}): Headers {
  const headers = new Headers();
  headers.set("Authorization", `Bearer ${getGhlPitToken()}`);
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  headers.set("Version", GHL_API_VERSION);
  headers.set("User-Agent", getGhlUserAgent());
  for (const [k, v] of Object.entries(extra)) {
    headers.set(k, v);
  }
  return headers;
}

export function buildGhlUrl(path: string, query?: GhlRequestOptions["query"]): string {
  const base = getGhlApiBaseUrl().replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const url = new URL(cleanPath, `${base}/`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) {
        url.searchParams.set(k, String(v));
      }
    }
  }
  return url.toString();
}

/** Required sub-account location id for v2 API. */
export function ghlLocationId(): string {
  return requireGhlLocationId();
}

/**
 * LeadConnector (GHL v2) request authenticated with a Private Integration
 * token (`GHL_PIT_TOKEN` / `getGhlPitToken()`). Paths are relative to
 * `GHL_API_BASE_URL` (default `https://services.leadconnectorhq.com`).
 */
export async function ghlRequest<T = unknown>(
  path: string,
  options: GhlRequestOptions = {},
): Promise<T> {
  const { method = "GET", body, query, headers: extraHeaders } = options;
  const url = buildGhlUrl(path, query);

  return retryWithBackoff(async () => {
    const res = await fetch(url, {
      method,
      headers: buildHeaders(extraHeaders),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const data = await handleGhlResponse(res, { method, path });
    if (res.status === 204) {
      return undefined as T;
    }
    return data as T;
  });
}

/**
 * Legacy path-style fetch (`/contacts/?query=...`). Prefer `ghlRequest` with `query` object.
 */
export async function ghlFetch(path: string, init?: RequestInit): Promise<unknown> {
  const qIndex = path.indexOf("?");
  const pathname = qIndex >= 0 ? path.slice(0, qIndex) : path;
  const search = qIndex >= 0 ? path.slice(qIndex + 1) : "";
  const query: Record<string, string> = {};
  if (search) {
    for (const [k, v] of new URLSearchParams(search)) {
      query[k] = v;
    }
  }

  let body: unknown;
  if (init?.body) {
    if (typeof init.body === "string") {
      try {
        body = JSON.parse(init.body) as unknown;
      } catch {
        body = init.body;
      }
    } else {
      body = init.body;
    }
  }

  const method = (init?.method ?? "GET").toUpperCase() as GhlRequestOptions["method"];
  const extra: Record<string, string> = {};
  if (init?.headers) {
    const h = new Headers(init.headers);
    h.forEach((v, k) => {
      if (
        !["authorization", "content-type", "accept", "version", "user-agent"].includes(
          k.toLowerCase(),
        )
      ) {
        extra[k] = v;
      }
    });
  }

  return ghlRequest(pathname, { method, body, query, headers: extra });
}

/** Retry wrapper (429 / 5xx / network). Skips retry on most 4xx except 429. */
export async function ghlRequestWithRetry<T = unknown>(
  path: string,
  options: GhlRequestOptions = {},
  maxAttempts = 3,
): Promise<T> {
  return retryWithBackoff(() => ghlRequest<T>(path, options), { maxRetries: maxAttempts - 1 });
}
