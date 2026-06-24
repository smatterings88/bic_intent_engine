import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

import { getZenithContentSecret } from "@/lib/env";

function hashSecret(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

function timingSafeSecretEqual(expected: string, provided: string): boolean {
  const a = hashSecret(expected);
  const b = hashSecret(provided);
  return a.length === b.length && timingSafeEqual(a, b);
}

export type ZenithSecretAssertResult =
  | { ok: true }
  | { ok: false; status: number; message: string };

/**
 * Validates `Authorization: Bearer` or `x-zenith-secret` against `ZENITH_CONTENT_SECRET`
 * (or fallback ingest secret via {@link getZenithContentSecret}).
 */
export function assertZenithSecret(req: Request): ZenithSecretAssertResult {
  let expected: string;
  try {
    expected = getZenithContentSecret();
  } catch {
    return {
      ok: false,
      status: 500,
      message:
        "Zenith content ingestion is not configured (missing ZENITH_CONTENT_SECRET or ZENITH_INGEST_SECRET).",
    };
  }
  const auth = req.headers.get("authorization");
  const header = req.headers.get("x-zenith-secret");
  let provided: string | null = null;
  if (auth?.startsWith("Bearer ")) {
    provided = auth.slice("Bearer ".length).trim();
  } else if (header?.trim()) {
    provided = header.trim();
  }
  if (!provided || !timingSafeSecretEqual(expected, provided)) {
    return { ok: false, status: 401, message: "Invalid or missing Zenith secret" };
  }
  return { ok: true };
}
