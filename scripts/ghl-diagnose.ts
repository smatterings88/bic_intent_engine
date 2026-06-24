/**
 * One-shot GHL v2 / PIT connectivity check.
 *
 * Run: npm run ghl:diagnose
 * Loads `.env.local` when present (does not overwrite existing process.env).
 */
import { existsSync, readFileSync } from "node:fs";

function loadEnvLocal(): void {
  const path = ".env.local";
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

loadEnvLocal();

async function probeWriteEndpoint(
  label: string,
  path: string,
  locationId: string,
): Promise<void> {
  const { ghlRequest } = await import("../src/lib/ghl/request");
  try {
    await ghlRequest(path, {
      method: "POST",
      body: { locationId, email: "" },
    });
    console.log(`${label}: unexpected success (empty email should fail validation)`);
  } catch (e) {
    const err = e as { statusCode?: number; message?: string };
    const status = err.statusCode ?? "?";
    if (status === 422 || status === 400) {
      console.log(`${label}: OK — endpoint reachable (${status} validation, write scope likely OK)`);
    } else if (status === 404) {
      console.error(
        `${label}: FAIL (404) — endpoint missing or wrong GHL_API_BASE_URL / token not scoped to this location`,
      );
    } else if (status === 403) {
      console.error(`${label}: FAIL (403) — enable Edit Contacts (contacts.write) on the Private Integration`);
    } else if (status === 401) {
      console.error(`${label}: FAIL (401) — check GHL_PIT_TOKEN`);
    } else {
      console.warn(`${label}: ${status} — ${err.message ?? e}`);
    }
  }
}

async function main() {
  const { getGhlPitToken, getGhlLocationId, getGhlApiBaseUrl, getGhlApiVersion } = await import(
    "../src/lib/env"
  );
  const { checkGhlHealth } = await import("../src/lib/ghl/health");
  const { getCustomFieldDefinitions, clearCustomFieldDefinitionsCache } = await import(
    "../src/lib/ghl/custom-fields"
  );
  const { ghlRequest } = await import("../src/lib/ghl/request");

  console.log("GHL diagnose — LeadConnector v2\n");
  console.log(`Base URL: ${getGhlApiBaseUrl()}`);
  console.log(`API Version header: ${getGhlApiVersion()}`);

  let token: string;
  try {
    token = getGhlPitToken();
  } catch (e) {
    console.error("FAIL: No token — set GHL_PIT_TOKEN in .env.local or environment");
    process.exit(1);
  }

  if (token.startsWith("pit-")) {
    console.log("Token: OK (pit-… prefix)");
  } else if (process.env.GHL_API_KEY?.trim()) {
    console.warn("Token: legacy GHL_API_KEY detected — migrate to GHL_PIT_TOKEN (pit-…)");
  } else {
    console.warn("Token: set but does not start with pit- (may still work during migration)");
  }

  const locationId = getGhlLocationId();
  if (!locationId) {
    console.error("FAIL: GHL_LOCATION_ID is not set");
    process.exit(1);
  }
  console.log(`Location ID: ${locationId.slice(0, 6)}…${locationId.slice(-4)} (${locationId.length} chars)`);

  const health = await checkGhlHealth();
  if (health.healthy) {
    console.log(`Location GET: OK (${health.status})`);
  } else {
    console.error(`Location GET: FAIL (${health.status}) ${health.message ?? ""}`);
    process.exit(1);
  }

  clearCustomFieldDefinitionsCache();
  try {
    const defs = await getCustomFieldDefinitions();
    const count = Object.keys(defs).length;
    console.log(`Custom fields: ${count} definition(s)`);
  } catch (e) {
    console.warn(
      `Custom fields: skipped (${e instanceof Error ? e.message : String(e)}) — need View Custom Fields scope`,
    );
  }

  try {
    const search = await ghlRequest<{ contacts?: unknown[]; total?: number }>("/contacts/search", {
      method: "POST",
      body: {
        locationId,
        pageLimit: 1,
        page: 1,
      },
    });
    const total =
      typeof search.total === "number"
        ? search.total
        : Array.isArray(search.contacts)
          ? search.contacts.length
          : 0;
    console.log(`Contacts (search): OK — total ≈ ${total} (pageLimit=1 probe)`);
  } catch (e) {
    console.warn(
      `Contacts search: ${e instanceof Error ? e.message : String(e)} — need View Contacts scope`,
    );
  }

  console.log("\nWrite endpoint probes (empty email → expect 422 if OK):");
  await probeWriteEndpoint("POST /contacts/", "/contacts/", locationId);
  await probeWriteEndpoint("POST /contacts/upsert", "/contacts/upsert", locationId);

  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
