# Phase 10 — Admin Lead Reporting and Conversion Visibility

## Summary

Admins can review **Firestore leads** (`leads/{leadId}`) and **GHL sync status** inside the app. List and detail views use **server API routes** with the **Firebase Admin SDK** (no client Firestore access to leads). **POST retry** re-runs `syncLandingPageOptInToGhl` for the **same** lead document and updates `ghl.*` fields. **Post–opt-in CTAs** on public landing forms use optional **`NEXT_PUBLIC_*`** URLs and **`getConversionUrl` / `getConversionCtaLabel`** so visitors click through to Sherpa demo, webinar, or offer (no auto-redirect, no uploads in this app).

---

## Files Created

| Path                                                   | Purpose                                                                                                |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `src/lib/conversion/routes.ts`                         | `getConversionUrl`, `getConversionCtaLabel` for `nextStep` values                                      |
| `src/types/admin-leads.ts`                             | Serializable admin lead types + filters + summary                                                      |
| `src/lib/admin/leads.ts`                               | Admin SDK: `listLeadsForAdmin`, `listRecentLeadsForAdmin`, `getLeadForAdmin`, `getLeadSummaryForAdmin` |
| `src/lib/admin/lead-client-actions.ts`                 | Browser helpers: `fetchAdminLeads`, `fetchAdminLead`, `retryLeadGhlSync`                               |
| `src/app/api/admin/leads/route.ts`                     | `GET` list + summary; query `summaryOnly=1` + optional `recent=N`                                      |
| `src/app/api/admin/leads/[leadId]/route.ts`            | `GET` lead detail                                                                                      |
| `src/app/api/admin/leads/[leadId]/retry-ghl/route.ts`  | `POST` GHL retry for existing lead                                                                     |
| `src/components/admin/leads/LeadSummaryCards.tsx`      | Summary metrics grid                                                                                   |
| `src/components/admin/leads/LeadFilters.tsx`           | GHL status, slug, magnet, campaign filters                                                             |
| `src/components/admin/leads/LeadTable.tsx`             | Lead list table + View links                                                                           |
| `src/components/admin/leads/LeadDetailPanel.tsx`       | Read-only detail layout                                                                                |
| `src/components/admin/leads/GhlStatusBadge.tsx`        | Status chip styling                                                                                    |
| `src/components/admin/leads/RetryGhlSyncButton.tsx`    | Failed-only retry control                                                                              |
| `src/components/admin/leads/AdminLeadsClient.tsx`      | Leads page data + filters                                                                              |
| `src/components/admin/leads/AdminLeadDetailClient.tsx` | Lead detail fetch + retry refresh                                                                      |
| `src/components/admin/leads/AdminHomeLeadsSummary.tsx` | Admin home lead strip                                                                                  |
| `src/app/app/admin/leads/[leadId]/page.tsx`            | Lead detail route                                                                                      |
| `docs/phase-10-admin-lead-reporting.md`                | This document                                                                                          |

---

## Files Changed

| Path                                                | Change                                                                                   |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `.env.example`                                      | `NEXT_PUBLIC_SHERPA_DEMO_URL`, `NEXT_PUBLIC_WEBINAR_URL`, `NEXT_PUBLIC_SHERPA_OFFER_URL` |
| `src/components/landing-pages/LandingOptInForm.tsx` | Post-success CTA link via conversion routes                                              |
| `src/app/app/admin/leads/page.tsx`                  | Real leads dashboard                                                                     |
| `src/app/app/admin/page.tsx`                        | Leads nav link + `AdminHomeLeadsSummary`                                                 |
| `firestore.rules`                                   | Comment: Phase 10 admin reads via Admin API only                                         |
| `docs/phase-9-lead-magnet-opt-in-ghl-sync.md`       | Short pointer to Phase 10                                                                |

---

## Routes Added

- `/app/admin/leads` — dashboard (list, filters, summary)
- `/app/admin/leads/[leadId]` — detail + retry when failed

---

## API Routes Added

- `GET /api/admin/leads` — `leads` (latest 100, `createdAt` desc when indexed) + `summary`. Query: `ghlStatus`, `landingPageSlug`, `leadMagnetId`, `campaignType`. `summaryOnly=1` returns `leads: []` plus `summary`; optional `recent=N` (with `summaryOnly`) returns `recentLeads`.
- `GET /api/admin/leads/[leadId]` — single `lead`
- `POST /api/admin/leads/[leadId]/retry-ghl` — retry GHL for that lead id

---

## Admin Security

Same model as Phase 5:

1. Client sends **`Authorization: Bearer <Firebase ID token>`**.
2. Route calls **`assertCurrentUserIsAdmin`**: verify token with Firebase Admin, load **`users/{uid}`**, require **`admin`** or **`super_admin`**.
3. **401** if missing/invalid token; **403** if not admin.

Leads are **never** read through client Firestore rules.

---

## Lead Dashboard Fields

Table columns: **email**, **name**, **source page**, **landing page slug**, **lead magnet id**, **campaign**, **GHL status**, **GHL contact id**, **createdAt**, **View** (detail).

---

## Filters

Supported query/body filters (list):

- `ghlStatus` — `pending`, `found`, `created`, `updated`, `tagged`, `failed`
- `landingPageSlug`
- `leadMagnetId`
- `campaignType`

Filtering is applied to the fetched page (up to 100 rows). If `orderBy("createdAt")` is unavailable, the server falls back to an unordered fetch and sorts in memory.

---

## GHL Retry Behavior

- **POST** loads the existing **`leads/{leadId}`** document; **404** if missing.
- Rebuilds **`GhlOptInSyncInput`** from stored fields. **`ghlTags`** come only from the **published** landing page’s **`conversion.ghlTags`** (same source as server-side merge on first opt-in, without client-supplied extra tags). **`buildLandingPageOptInTags`** still adds default SBI tags; avoid passing `tagsApplied` from the lead so defaults are not doubled as custom tags.
- Calls **`syncLandingPageOptInToGhl`**, then **`updateLeadGhlSync`** on success or **`markLeadGhlSyncFailed`** on failure.
- **Does not** create a new lead document.
- Failed retries leave **`ghl.status: "failed"`** with an error message (up to existing store limits).

---

## Conversion Routing Polish

Optional env (public, safe in the browser):

- `NEXT_PUBLIC_SHERPA_DEMO_URL` — used for **`upload`** and **`book_call`** `nextStep`
- `NEXT_PUBLIC_WEBINAR_URL` — **`webinar`**
- `NEXT_PUBLIC_SHERPA_OFFER_URL` — **`sherpa_offer`**
- **`download`** — no URL until a future env exists; **`getConversionUrl`** returns `null`

After a successful opt-in, **`LandingOptInForm`** shows **`thankYouMessage`**. If **`getConversionUrl(nextStep)`** is set, a **primary CTA button** opens that URL (new tab). If not, it shows the existing **human-readable next-step** line only. **No automatic redirect.**

---

## What This Phase Does Not Implement

- No transcript upload, Sherpa demo, voice/call flows, or breakdown generation inside this repo
- No checkout
- No new article or landing **rendering** engines
- No GHL workflow/automation design beyond existing contact + tag sync and retry
- No content editing for leads
- No weakening of Firestore **deny** for `leads` in the browser SDK

---

## Phase 11 Readiness

Next priorities could include **analytics / conversion tracking** (e.g. events on CTA clicks), **richer lead magnet delivery** (hosted download URLs), or **email confirmation** — depending on product roadmap.
