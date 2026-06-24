# Phase 9 — Lead Magnet Opt-In and GHL Sync

## Summary

Published **landing pages** now include a **public opt-in form** that posts to **`POST /api/landing-pages/opt-in`**. The route validates input, writes a **`leads/{leadId}`** document with the Firebase **Admin SDK**, then **syncs to GoHighLevel (LeadConnector v2 + Private Integration Token)**: search contacts by email, **exact-match** the address, **create or update** the contact, **merge and PUT tags**, and writes the **GHL outcome** back onto the lead. Failures after lead creation return **502** and set **`ghl.status: "failed"`** without deleting the lead.

No GHL secrets are exposed to the browser; no client Firestore writes.

**Phase 10** adds admin lead reporting, filters, summary cards, and optional GHL retry via protected API routes — see `docs/phase-10-admin-lead-reporting.md`.

---

## Files Created

| Path                                                | Purpose                                                          |
| --------------------------------------------------- | ---------------------------------------------------------------- |
| `src/types/ghl.ts`                                  | GHL contact/sync-related types                                   |
| `src/lib/ghl/errors.ts`                             | `GHLApiError`, `handleGhlResponse`                               |
| `src/lib/ghl/rate-limit.ts`                         | `retryWithBackoff` (429 / 5xx / network; not 401)                |
| `src/lib/ghl/request.ts`                            | Central `ghlRequest` / `ghlFetch` (v2 base URL + PIT)            |
| `src/lib/ghl/client.ts`                             | Re-exports request module (server-only)                          |
| `src/lib/ghl/contacts.ts`                           | Search, normalize response, upsert by email                      |
| `src/lib/ghl/tags.ts`                               | Normalize/merge tags, `applyTagsToContact`                       |
| `src/lib/ghl/opt-in.ts`                             | `buildLandingPageOptInTags`, `syncLandingPageOptInToGhl`         |
| `src/lib/leads/schemas.ts`                          | `landingPageOptInSchema` (Zod)                                   |
| `src/lib/leads/store.ts`                            | `createLeadRecord`, `updateLeadGhlSync`, `markLeadGhlSyncFailed` |
| `src/app/api/landing-pages/opt-in/route.ts`         | Public POST handler                                              |
| `src/components/landing-pages/LandingOptInForm.tsx` | Client form + thank-you / next-step                              |
| `docs/phase-9-lead-magnet-opt-in-ghl-sync.md`       | This document                                                    |

---

## Files Changed

| Path                                                      | Change                                                                         |
| --------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `src/lib/env.ts`                                          | `getGhlPitToken`, `requireGhlLocationId`, `getGhlApiBaseUrl`, `getGhlUserAgent` |
| `.env.example`                                            | GHL server env placeholders                                                    |
| `src/types/index.ts`                                      | Export `./ghl`                                                                 |
| `src/types/lead.ts`                                       | Optional `campaignType` on lead documents                                      |
| `src/components/landing-pages/LandingLeadMagnetBlock.tsx` | Opt-in form + minimal copy                                                     |
| `src/components/landing-pages/LandingPageTemplate.tsx`    | Pass `landingPage` into lead block                                             |
| `firestore.rules`                                         | Comment: `leads` written via Admin from Phase 9 API; clients still denied      |

---

## Environment Variables

| Variable           | Notes                                                                     |
| ------------------ | ------------------------------------------------------------------------- |
| `GHL_PIT_TOKEN`    | **Required** — Private Integration Token (`pit-…`). See `docs/GHL_API_Integration_Notes.md`. |
| `GHL_LOCATION_ID`  | **Required** for v2 contact search/create.                                |
| `GHL_API_BASE_URL` | Defaults to `https://services.leadconnectorhq.com`.                         |
| `GHL_USER_AGENT`   | Defaults to `SalesBreakdownInstitute/1.0`.                                |
| `GHL_API_KEY`      | **Deprecated** — fallback only if `GHL_PIT_TOKEN` unset.                  |

None use the `NEXT_PUBLIC_` prefix.

---

## Public API Route Added

- **`POST /api/landing-pages/opt-in`** — no login; JSON body validated with Zod; requires a **published** landing for `landingPageSlug`.

---

## Opt-In Flow

1. Visitor submits **`LandingOptInForm`** → **`POST /api/landing-pages/opt-in`** with email, optional name/phone, UTM fields, `sourcePage`, slug, etc.
2. Server validates → loads **published** landing → **`createLeadRecord`** (`ghl.status: "pending"`).
3. **`syncLandingPageOptInToGhl`**: upsert contact by email → merge tags → **`PUT /contacts/{id}`** with merged `tags`.
4. **`updateLeadGhlSync`** writes `ghl.status`, `contactId`, `tagsApplied`, `lastSyncedAt`, clears `error`.
5. On GHL error after step 2: **`markLeadGhlSyncFailed`** → **502** JSON with `leadId` and message.

---

## GHL Contact Behavior

- **Search:** `POST /contacts/search` with `locationId`, `query` (email), `pageLimit`, `page` (v2).
- **Normalize:** Supports `contacts` array, single `contact`, nested `data.*`, or top-level array.
- **Exact email:** Trim + lowercase comparison on returned contacts.
- **Create/update:** `POST /contacts/upsert` with `locationId`, email, optional fields, `source` defaulting to **Sales Breakdown Institute** (fallback `POST /contacts/` if needed).
- **Tags:** `POST /contacts/{id}/tags` to add tags without wiping existing.
- **Update fields:** `PUT /contacts/{id}` for standard fields (no `locationId` in body).

---

## GHL Tags Applied

Always (deduped with other tag sources):

- `sbi --> opted in`
- `sbi landing page --> {landingPageSlug}`
- `sbi lead magnet --> {leadMagnetId}` when present
- `sbi campaign --> {campaignType}` when present

Plus **`conversion.ghlTags`** from the landing document merged with any **`ghlTags`** sent in the body (deduped).

---

## Firestore Writes

- Collection: **`leads/{leadId}`** (auto id).
- Fields: `email`, optional names/phone, `sourcePage`, `landingPageSlug`, `leadMagnetId`, `campaignType`, `utm`, `ghl` (`status`, `contactId`, `tagsApplied`, `lastSyncedAt`, `error`), timestamps.

---

## Failure Behavior

- If **GHL** throws after the lead row exists: lead stays in Firestore with **`ghl.status: "failed"`** and **`ghl.error`** message; API returns **502** with `{ ok: false, leadId, error }`.
- If **Admin** fails before lead write: **500** without a lead id.

---

## Security

- **GHL API key** and Firebase Admin credentials stay **server-only**.
- **Public** route is unauthenticated but **Zod-validated** and tied to a **published** landing slug.
- **Firestore** for leads is **Admin SDK only**; **rules** still deny client writes to `leads`.

---

## What This Phase Does Not Implement

- Upload / transcript / breakdown pipelines
- Checkout or redirect automation
- Dedicated **admin lead dashboard** (placeholders unchanged)
- **Article** opt-in (landing-only)

---

## How To Test

1. Set **`GHL_*`** and Firebase **server** env vars locally or on Vercel.
2. Publish a landing with **`primaryLeadMagnetId`** and **`conversion.ghlTags`**.
3. Visit **`/{slug}`** and submit the form.
4. Confirm **`leads/{leadId}`** in Firestore with `ghl.status` **`tagged`** or **`failed`**.
5. In GHL, confirm contact exists / updates and tags applied.
6. Confirm **thank-you** copy appears after success.

Optional: run **`npm run bootstrap:super-users`** (Phase 8.5) if admins need Firestore roles for unrelated admin UI.

---

## Phase 10 Readiness

Phase 10 can add **public upload / transcript submission**, **admin lead reporting**, or richer **CRM field mapping** without changing the core opt-in contract established here.
