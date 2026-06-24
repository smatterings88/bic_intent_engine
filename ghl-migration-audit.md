# GHL v1 → v2 Migration Audit (Phase 0)

**Generated:** 2026-05-21 (refreshed). **Codebase:** `intent_page_engine` (Next.js 15, TypeScript ESM, server `fetch` only).

## Markers

### `rest.gohighlevel.com` / `gohighlevel.com/v1`

| File | Line | Notes |
| --- | --- | --- |
| `.env.example` | 39–40 | Comment only: do not use v1 base |
| `docs/GHL_API_Integration_Notes.md` | LEGACY section | Historical v1 reference |
| `ghl-migration-summary.md` | endpoint table | Historical v1 paths |

**Runtime:** `src/lib/env.ts` defaults to `https://services.leadconnectorhq.com` (v2). No live v1 URLs in application code.

### `GHL_API_KEY` and variants

| File | Line | Notes |
| --- | --- | --- |
| `src/lib/env.ts` | 118–127 | Fallback if `GHL_PIT_TOKEN` unset; one-time deprecation warning |
| `.env.example` | 42–43 | Commented legacy `GHL_API_KEY` |
| `scripts/ghl-diagnose.ts` | 54–55 | Warns if legacy key detected |
| `docs/phase-9-lead-magnet-opt-in-ghl-sync.md` | 55 | Documented deprecated |
| `docs/GHL_API_Integration_Notes.md` | 35, 80–81 | Deprecated + LEGACY section |

No hits for `HIGHLEVEL_API_KEY`, `GOHIGHLEVEL_KEY`, or `LEADCONNECTOR_KEY`.

### `Bearer` + GHL (only)

| File | Line |
| --- | --- |
| `src/lib/ghl/request.ts` | 18 — `Authorization: Bearer ${getGhlPitToken()}` |

(Other `Bearer` headers: Firebase admin, Zenith ingest — not GHL.)

### `customField` / `customFields`

| File | Line | Notes |
| --- | --- | --- |
| `src/types/ghl.ts` | 19–21 | `customField` (v1 fallback) + `customFields` on contact |
| `src/lib/ghl/custom-fields.ts` | 45–75, 97 | v2 read/write: `customFields` + `field_value`; v1 fallback read |

### `locationId`

| File | Notes |
| --- | --- |
| `src/lib/ghl/contacts.ts` | Required on search/upsert/create body or query |
| `src/lib/ghl/custom-fields.ts` | In path `/locations/{locationId}/customFields` |
| `src/lib/env.ts` | `GHL_LOCATION_ID` / `VITE_GHL_LOCATION_ID` — not hardcoded |

### Env / deployment

| File | GHL variables |
| --- | --- |
| `.env.example` | `GHL_PIT_TOKEN`, `GHL_LOCATION_ID`, `GHL_API_BASE_URL`, `GHL_USER_AGENT` |
| `src/lib/env.ts` | Readers for above + legacy key shim |

Vercel/production: set env in dashboard (no `vercel.json` GHL overrides in repo).

## HTTP client

- **Client:** native `fetch` only
- **Central module:** `src/lib/ghl/request.ts` (alias `src/lib/ghlClient.ts`, barrel `src/lib/ghl/client.ts`)
- **Retry:** `src/lib/ghl/rate-limit.ts` — exponential backoff, max 3 attempts, retries 429/5xx/network, not 401
- **v2 limits (documented):** 100 req / 10s burst, 200k req / day per location

## Endpoints in use (current v2)

| # | Method | Path | Purpose | Request body (summary) | Response |
| --- | --- | --- | --- | --- | --- |
| 1 | GET | `/locations/{locationId}` | Health / diagnose | — | Location object |
| 2 | POST | `/contacts/search` | Email search (primary) | `locationId`, `query`, `pageLimit`, `page` | `{ contacts[], total? }` |
| 3 | GET | `/contacts/` | Email search (fallback) | query: `locationId`, `query`, `limit` | `{ contacts[] }` variants |
| 4 | POST | `/contacts/upsert` | Create/update contact (primary) | `locationId`, `email`, names, `source`, optional `tags` | `{ contact }` |
| 5 | POST | `/contacts/` | Create (fallback if upsert 404) | same | `{ contact }` |
| 6 | PUT | `/contacts/{id}` | Update standard fields | `firstName`, `tags`, etc. (no `locationId`) | `{ contact }` |
| 7 | POST | `/contacts/{id}/tags` | Add tags (no wipe) | `{ tags: string[] }` | 201 |
| 8 | GET | `/locations/{locationId}/customFields` | Field definitions | — | `{ customFields[] }` |
| 9 | PUT | `/contacts/{id}` | Custom field write | `{ customFields: [{ id, field_value }] }` | `{ contact }` |

## Call sites (all via `ghlRequest`)

| Module | Flow |
| --- | --- |
| `src/lib/ghl/contacts.ts` | search, upsert, create, update |
| `src/lib/ghl/tags.ts` | add tags |
| `src/lib/ghl/sync-contact.ts` | form/lead sync orchestration |
| `src/lib/ghl/opt-in.ts` | legacy landing opt-in |
| `src/lib/ghl/health.ts` | health check |
| `src/lib/ghl/custom-fields.ts` | definitions + optional writes |
| `src/app/api/zenith/forms/submit/route.ts` | Zenith form → GHL |
| `src/app/api/landing-pages/opt-in/route.ts` | Landing opt-in → GHL |
| `src/app/api/admin/leads/[leadId]/retry-ghl/route.ts` | Admin retry |

## Module layout (post-migration)

```
src/lib/ghl/
  request.ts       — ghlRequest, ghlRequestWithRetry, headers, Version: 2021-07-28
  client.ts        — server-only re-exports
  errors.ts        — GHLApiError
  rate-limit.ts    — retryWithBackoff
  contacts.ts      — search, upsert, create, update
  tags.ts          — POST /contacts/:id/tags
  sync-contact.ts  — upsert + tags for submissions
  opt-in.ts        — landing page opt-in
  custom-fields.ts — v2 definitions + field_value writes
  health.ts        — location health
src/lib/ghlClient.ts — public alias barrel (Phase 1 spec path)
src/lib/env.ts       — GHL_PIT_TOKEN, GHL_LOCATION_ID, base URL
scripts/ghl-diagnose.ts
```

## Language

TypeScript, ESM (`"type": "module"` in `package.json`).
