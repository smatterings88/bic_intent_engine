import { z } from "zod";

const publicFirebaseSchema = z.object({
  apiKey: z.string().min(1, "NEXT_PUBLIC_FIREBASE_API_KEY is required"),
  authDomain: z.string().min(1, "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is required"),
  projectId: z.string().min(1, "NEXT_PUBLIC_FIREBASE_PROJECT_ID is required"),
  storageBucket: z.string().min(1, "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is required"),
  messagingSenderId: z.string().min(1, "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID is required"),
  appId: z.string().min(1, "NEXT_PUBLIC_FIREBASE_APP_ID is required"),
});

export type PublicFirebaseConfig = z.infer<typeof publicFirebaseSchema>;

/**
 * Read raw public Firebase env from `process.env`.
 * Does not throw — used only to build the object passed to Zod.
 */
function readPublicFirebaseEnv(): Record<string, string | undefined> {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}

/**
 * Validate client-safe Firebase web config.
 * Call from browser-only Firebase helpers (e.g. when initializing the client SDK).
 * Throws a descriptive error if any required value is missing.
 */
export function getPublicFirebaseConfig(): PublicFirebaseConfig {
  const parsed = publicFirebaseSchema.safeParse(readPublicFirebaseEnv());
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Invalid or incomplete Firebase public configuration: ${msg}`);
  }
  return parsed.data;
}

const serverFirebaseSchema = z.object({
  projectId: z.string().min(1, "FIREBASE_PROJECT_ID is required"),
  clientEmail: z.string().email("FIREBASE_CLIENT_EMAIL must be a valid email"),
  privateKey: z.string().min(1, "FIREBASE_PRIVATE_KEY is required"),
});

export type ServerFirebaseConfig = z.infer<typeof serverFirebaseSchema>;

function readServerFirebaseEnv() {
  return {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  };
}

/**
 * Validate Firebase Admin credentials.
 * Call only from server-only code paths (e.g. Admin SDK bootstrap, server actions).
 */
export function getServerFirebaseConfig(): ServerFirebaseConfig {
  const parsed = serverFirebaseSchema.safeParse(readServerFirebaseEnv());
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Invalid or incomplete Firebase server configuration: ${msg}`);
  }
  return parsed.data;
}

/** True when Firebase Admin env is complete — does not throw (safe for build-time static params). */
export function hasServerFirebaseConfig(): boolean {
  return serverFirebaseSchema.safeParse(readServerFirebaseEnv()).success;
}

const zenithSecretSchema = z
  .string()
  .min(16, "ZENITH_INGEST_SECRET is required (min 16 characters) for ZenithMind ingestion");

/**
 * Shared secret for ZenithMind HTTP ingestion (server-only).
 * Call only from API routes / server code — not at module import time for public pages.
 */
export function getZenithIngestSecret(): string {
  const parsed = zenithSecretSchema.safeParse(process.env.ZENITH_INGEST_SECRET);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join("; ");
    throw new Error(`Zenith ingestion is not configured: ${msg}`);
  }
  return parsed.data;
}

/** Phase 11: Zenith Content v1.2 ingestion; falls back to `ZENITH_INGEST_SECRET` when unset. */
export function getZenithContentSecret(): string {
  const direct = process.env.ZENITH_CONTENT_SECRET?.trim();
  if (direct && direct.length >= 16) {
    return direct;
  }
  return getZenithIngestSecret();
}

const DEFAULT_GHL_API_BASE_URL = "https://services.leadconnectorhq.com";
const DEFAULT_GHL_USER_AGENT = "SalesBreakdownInstitute/1.0";

let ghlLegacyApiKeyWarned = false;

/**
 * GoHighLevel Private Integration Token (PIT), server-only.
 * Generate: Settings → Other Settings → Private Integrations.
 */
export function getGhlPitToken(): string {
  const pit = process.env.GHL_PIT_TOKEN?.trim() || process.env.VITE_GHL_PIT_TOKEN?.trim();
  if (pit) {
    return pit;
  }

  const legacy = process.env.GHL_API_KEY?.trim() || process.env.VITE_GHL_API_KEY?.trim();
  if (legacy) {
    if (!ghlLegacyApiKeyWarned) {
      ghlLegacyApiKeyWarned = true;
      console.warn(
        "[GHL] GHL_API_KEY is deprecated (v1 EOL). Set GHL_PIT_TOKEN to a Private Integration Token (pit-…) from Settings → Private Integrations.",
      );
    }
    return legacy;
  }

  throw new Error("GHL_PIT_TOKEN is not configured");
}

/**
 * @deprecated Use `getGhlPitToken`. Kept for backward-compatible env during migration.
 */
export function getGhlApiKey(): string {
  return getGhlPitToken();
}

/** Sub-account location id from env. */
export function getGhlLocationId(): string | undefined {
  const v = process.env.GHL_LOCATION_ID?.trim() || process.env.VITE_GHL_LOCATION_ID?.trim();
  return v || undefined;
}

/** Required for LeadConnector v2 — throws when unset. */
export function requireGhlLocationId(): string {
  const id = getGhlLocationId();
  if (!id) {
    throw new Error("GHL_LOCATION_ID is required for GoHighLevel v2 API (Private Integration)");
  }
  return id;
}

export function getGhlApiBaseUrl(): string {
  const raw = (process.env.GHL_API_BASE_URL?.trim() || DEFAULT_GHL_API_BASE_URL).replace(
    /\/+$/,
    "",
  );
  const lower = raw.toLowerCase();
  if (lower.includes("rest.gohighlevel.com") || /\/v1\/?$/.test(lower) || lower.endsWith("/v1")) {
    throw new Error(
      "GHL_API_BASE_URL must be LeadConnector v2 (https://services.leadconnectorhq.com), not the legacy v1 host",
    );
  }
  return raw;
}

/** LeadConnector Version header (override with GHL_API_VERSION). */
export function getGhlApiVersion(): string {
  return process.env.GHL_API_VERSION?.trim() || "2021-07-28";
}

export function getGhlUserAgent(): string {
  return process.env.GHL_USER_AGENT?.trim() || DEFAULT_GHL_USER_AGENT;
}
