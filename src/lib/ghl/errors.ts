export type GhlRequestContext = {
  method?: string;
  path?: string;
};

export class GHLApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly body?: unknown,
    public readonly code?: string,
    public readonly request?: GhlRequestContext,
  ) {
    const ctx = request?.method && request?.path ? ` (${request.method} ${request.path})` : "";
    super(message + ctx);
    this.name = "GHLApiError";
  }

  /** Alias for LeadConnector error payloads using `status`. */
  get status(): number {
    return this.statusCode;
  }
}

function contactWrite404Hint(request?: GhlRequestContext): string {
  const path = request?.path ?? "";
  const method = request?.method ?? "";
  const isWrite =
    path.includes("/contacts") && (method === "POST" || method === "PUT" || method === "PATCH");
  if (!isWrite) return "";
  return (
    " Likely causes: GHL_API_BASE_URL must be https://services.leadconnectorhq.com (not v1); " +
    "Private Integration must be created on the sub-account that owns GHL_LOCATION_ID with " +
    "Edit Contacts (contacts.write) scope; confirm GHL_LOCATION_ID is the sub-account location id."
  );
}

function statusMessage(status: number, request?: GhlRequestContext): string {
  switch (status) {
    case 400:
      return "GoHighLevel rejected the request (400).";
    case 401:
      return "GoHighLevel authentication failed (401). Check GHL_PIT_TOKEN.";
    case 403:
      return "GoHighLevel denied access (403).";
    case 404:
      return "GoHighLevel resource not found (404)." + contactWrite404Hint(request);
    case 429:
      return "GoHighLevel rate limit exceeded (429).";
    case 500:
    case 502:
    case 503:
      return "GoHighLevel server error.";
    default:
      return `GoHighLevel request failed (${status}).`;
  }
}

/**
 * Parse JSON body when possible; otherwise return text snippet. Never includes secrets.
 */
export async function handleGhlResponse(
  response: Response,
  request?: GhlRequestContext,
): Promise<unknown> {
  const status = response.status;
  const ct = response.headers.get("content-type") ?? "";
  let body: unknown;
  const text = await response.text();
  if (ct.includes("application/json") && text.trim()) {
    try {
      body = JSON.parse(text) as unknown;
    } catch {
      body = { raw: text.slice(0, 500) };
    }
  } else {
    body = text ? { raw: text.slice(0, 500) } : {};
  }

  if (!response.ok) {
    let msg = statusMessage(status, request);
    let code: string | undefined;
    if (typeof body === "object" && body !== null) {
      const o = body as { message?: unknown; code?: unknown };
      if (typeof o.message === "string") {
        msg = o.message;
      } else if (Array.isArray(o.message)) {
        msg = o.message.map(String).join("; ");
      }
      if (typeof o.code === "string") {
        code = o.code;
      } else if (typeof o.code === "number") {
        code = String(o.code);
      }
    }
    throw new GHLApiError(msg, status, body, code ?? `HTTP_${status}`, request);
  }

  return body;
}
