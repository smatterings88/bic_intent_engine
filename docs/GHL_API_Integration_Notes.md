# GoHighLevel API Integration Notes

## Current — Private Integration + LeadConnector v2

**Production auth:** [GoHighLevel Private Integration](https://help.gohighlevel.com/) only — **not** legacy Settings → Integrations → API keys (v1 EOL) and **not** a marketplace OAuth app for lead sync.

| Piece | Value |
| --- | --- |
| **API** | [LeadConnector](https://services.leadconnectorhq.com) (GHL v2) |
| **Token** | Private Integration Token → env `GHL_PIT_TOKEN` (prefix `pit-`) |
| **Location** | Sub-account `GHL_LOCATION_ID` — **required** on search/create |
| **Header** | `Authorization: Bearer {GHL_PIT_TOKEN}` + `Version: 2021-07-28` |

All server routes (`/api/zenith/forms/submit`, `/api/landing-pages/opt-in`, admin GHL retry) use `src/lib/ghl/request.ts`, which reads **`GHL_PIT_TOKEN`** via `getGhlPitToken()`.

### Generate a token

1. GHL → **Settings → Other Settings → Private Integrations**
2. **Create New Integration** — select scopes:
   - **View Contacts**, **Edit Contacts** (required for lead sync)
   - **View Locations** (required for health check / diagnose)
   - **View Custom Fields** (optional; only if you add custom-field writes later)
3. Copy the token immediately (shown once).
4. Rotate every ~90 days via **Rotate and expire this token later** (7-day overlap).

### Environment variables

| Variable | Required | Default |
| --- | --- | --- |
| `GHL_PIT_TOKEN` | Yes | — |
| `GHL_LOCATION_ID` | Yes | — |
| `GHL_API_BASE_URL` | No | `https://services.leadconnectorhq.com` |
| `GHL_USER_AGENT` | No | `BusinessImpactCanada/1.0` |

`GHL_API_KEY` is **deprecated** (legacy v1 key). Do **not** use in production — set `GHL_PIT_TOKEN` on Vercel/local. A one-time console warning appears only if `GHL_PIT_TOKEN` is missing and `GHL_API_KEY` is set.

### Code layout

| Module | Role |
| --- | --- |
| `src/lib/ghl/request.ts` | Central `ghlRequest` / `ghlFetch`, Version header, retry |
| `src/lib/ghl/contacts.ts` | Search, create, update, upsert |
| `src/lib/ghl/sync-contact.ts` | Upsert + tags + 404 recovery |
| `src/lib/ghl/custom-fields.ts` | v2 custom field definitions + update helper |
| `src/lib/ghl/health.ts` | `GET /locations/{locationId}` |
| `scripts/ghl-diagnose.ts` | `npm run ghl:diagnose` |

### Endpoints used by this app

| Operation | v2 |
| --- | --- |
| Health | `GET /locations/{locationId}` |
| Search by email | `POST /contacts/search` (`locationId`, `query`, `pageLimit`, `page`) |
| Create / upsert | `POST /contacts/upsert` (preferred; `locationId` + email required) |
| Create (fallback) | `POST /contacts/` if upsert unavailable |
| Update fields | `PUT /contacts/{id}` |
| Add tags | `POST /contacts/{id}/tags` (adds without wiping existing tags) |
| Custom field defs | `GET /locations/{locationId}/customFields` |
| Custom field write | `PUT /contacts/{id}` with `customFields: [{ id, field_value }]` |

### Rate limits (v2, per location)

- Burst: **100 requests / 10 seconds**
- Daily: **200,000 requests / day**

Retry: 429 and 5xx with exponential backoff (`src/lib/ghl/rate-limit.ts`). Do not retry 401.

### Flows

- Zenith forms → `POST /api/zenith/forms/submit`
- Legacy landing opt-in → `POST /api/landing-pages/opt-in`
- Admin retry → `POST /api/admin/leads/[leadId]/retry-ghl`

See also: `docs/phase-9-lead-magnet-opt-in-ghl-sync.md`, `docs/zenithmind-ingestion-guide.md` (GHL tags).

---

## LEGACY — DO NOT USE (v1 EOL)

**API base:** `https://rest.gohighlevel.com/v1`  
**Auth:** Legacy API key (`GHL_API_KEY`) from Settings → Integrations → API  

v1 is end-of-life. This project previously used:

- `GET /v1/contacts/?query=email`
- `POST /v1/contacts/`
- `PUT /v1/contacts/{id}`
- Contact updates with `customField: [{ id, value }]` (singular)

v2 changes that matter if you extend the integration:

| v1 | v2 |
| --- | --- |
| `customField` + `value` | `customFields` + `field_value` |
| `GET /v1/custom-fields/?locationId=` | `GET /locations/{locationId}/customFields` |
| Optional `locationId` | **Required** on contact search/create |

Migration audit: `ghl-migration-audit.md` · Summary: `ghl-migration-summary.md`
