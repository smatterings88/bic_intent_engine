# GHL v1 → v2 Migration Summary

**Status:** Complete (2026-05-21). **Auth:** GoHighLevel **Private Integration Token** (`GHL_PIT_TOKEN`, `pit-…`) + LeadConnector `https://services.leadconnectorhq.com`. **Not** legacy v1 API keys.

---

## Files modified (by phase)

### Phase 0 — Discovery

- `ghl-migration-audit.md` (this audit; refreshed 2026-05-21)

### Phase 1 — Centralized client

- `src/lib/ghl/request.ts` — `ghlRequest`, `ghlFetch`, `ghlRequestWithRetry`, `GHL_API_VERSION`, Bearer + Version headers
- `src/lib/ghl/client.ts` — server-only re-exports
- `src/lib/ghlClient.ts` — spec-path alias barrel (imports from `./ghl/request`)

### Phase 2 — Environment + config

- `src/lib/env.ts` — `getGhlPitToken()`, `requireGhlLocationId()`, v2 default base URL, legacy `GHL_API_KEY` one-time warning
- `.env.example` — `GHL_PIT_TOKEN`, `GHL_LOCATION_ID`, v2 base URL; legacy key commented
- `README.md` — Private Integration + `npm run ghl:diagnose`

### Phase 3 — Endpoints

- `src/lib/ghl/contacts.ts` — `POST /contacts/search`, `POST /contacts/upsert`, `PUT /contacts/{id}`; GET search fallback
- `src/lib/ghl/tags.ts` — `POST /contacts/{id}/tags` (add tags without replacing)
- `src/lib/ghl/sync-contact.ts` — upsert + tag flow for all lead sync paths
- `src/lib/ghl/errors.ts` — `GHLApiError` with `status` alias, request path in message
- `src/types/ghl.ts` — contact types including `customFields`
- `src/lib/ghl/custom-fields.ts` — `GET /locations/{id}/customFields`, `field_value` writes

### Phase 4 — Rate limiting

- `src/lib/ghl/rate-limit.ts` — v2 limit comments; retry 429/5xx (unchanged behavior)

### Phase 5 — Tests + verification

- `src/lib/ghl/health.ts` — `GET /locations/{locationId}`
- `scripts/ghl-diagnose.ts` — PIT, location, custom fields count, contact search total
- `package.json` — `"ghl:diagnose": "tsx scripts/ghl-diagnose.ts"`

### Phase 6 — Cleanup + docs

- `docs/GHL_API_Integration_Notes.md` — v2 + Private Integration; LEGACY v1 section preserved
- `docs/phase-9-lead-magnet-opt-in-ghl-sync.md` — v2 env and endpoints
- `docs/zenithmind-ingestion-guide.md` — §1 + §10 Private Integration notes
- `src/app/api/zenith/forms/submit/route.ts` — improved GHL error logging (`ghlPath`)

### Post-migration fix (2026-05-21)

- `POST /contacts/` returned **404** under some PIT setups → primary create path is now **`POST /contacts/upsert`**, tags via **`POST /contacts/{id}/tags`**

---

## Endpoints migrated

| v1 (historical) | v2 (current) |
| --- | --- |
| `GET https://rest.gohighlevel.com/v1/locations/` | `GET /locations/{locationId}` |
| `GET /v1/contacts/?query=email&locationId=` | `POST /contacts/search` (+ optional GET fallback) |
| `POST /v1/contacts/` | `POST /contacts/upsert` (preferred); `POST /contacts/` fallback |
| `PUT /v1/contacts/{id}` | `PUT /contacts/{id}` (standard fields) |
| Tag merge via PUT body | `POST /contacts/{id}/tags` |
| `GET /v1/custom-fields/?locationId=` | `GET /locations/{locationId}/customFields` |
| `PUT` with `customField: [{ id, value }]` | `PUT` with `customFields: [{ id, field_value }]` |

---

## Decisions / inference

| Topic | Decision |
| --- | --- |
| Client file name | Spec suggested `ghlClient.ts`; implemented as `src/lib/ghl/request.ts` + alias `src/lib/ghlClient.ts` (no duplicate fetch logic) |
| `GHLApiError.status` | Kept `statusCode` property; added `get status()` alias for spec compatibility |
| Legacy API key | `GHL_API_KEY` still accepted with console warning if PIT unset (cutover safety only) |
| Email search | `POST /contacts/search` with `query` param (not filter-array form); works with PIT |
| Create contact | `POST /contacts/upsert` first — `POST /contacts/` 404 observed in production |
| Tags | `POST /contacts/{id}/tags` to add without wiping existing tags |
| Custom fields | Helpers implemented; lead/opt-in paths do not use custom fields yet |
| Version header | `2021-07-28` on all requests (GHL docs for contacts/upsert) |

---

## Phase 0 audit

Full marker list and endpoint table: **`ghl-migration-audit.md`**.

---

## Next steps for the human

1. In GHL: **Settings → Other Settings → Private Integrations** → create integration (Sub-Account).
2. **Scopes (minimum):** View Contacts, Edit Contacts, View Locations. Add View Custom Fields if using custom-field helpers.
3. Copy **PIT** (`pit-…`) → Vercel **`GHL_PIT_TOKEN`** (and local `.env.local`). Remove **`GHL_API_KEY`** from production.
4. Set **`GHL_LOCATION_ID`** to the sub-account location ID (required).
5. Confirm **`GHL_API_BASE_URL`** is `https://services.leadconnectorhq.com` or unset (default).
6. Redeploy, then run **`npm run ghl:diagnose`** locally with same env.
7. Submit a test Zenith form; expect `ghlSyncStatus: synced` and tags in GHL.
8. Rotate PIT every ~90 days (GHL “Rotate and expire later” — 7-day overlap).
