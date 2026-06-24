import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

import { getZenithIngestSecret } from "@/lib/env";

export class ZenithAuthError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "ZenithAuthError";
  }
}

function hashSecret(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

/** Timing-safe comparison of two secrets (SHA-256 digests, fixed length). */
function timingSafeSecretEqual(expected: string, provided: string): boolean {
  const a = hashSecret(expected);
  const b = hashSecret(provided);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Server-only Zenith ingest secret (validated on read). */
export function getZenithSecret(): string {
  return getZenithIngestSecret();
}

/**
 * Ensures the request carries a valid Zenith shared secret.
 * Accepts `Authorization: Bearer <secret>` or `x-zenith-secret: <secret>`.
 */
export function verifyZenithRequest(request: Request): void {
  const expected = getZenithSecret();
  const auth = request.headers.get("authorization");
  const header = request.headers.get("x-zenith-secret");
  let provided: string | null = null;
  if (auth?.startsWith("Bearer ")) {
    provided = auth.slice("Bearer ".length).trim();
  } else if (header?.trim()) {
    provided = header.trim();
  }
  if (!provided || !timingSafeSecretEqual(expected, provided)) {
    throw new ZenithAuthError();
  }
}
