# Phase 4 — ZenithMind Ingestion Endpoints

## Summary

This phase adds **authenticated HTTP ingestion** for ZenithMind-generated **articles**, **landing pages**, **lead magnets**, and **batch** payloads. Requests are validated with **Phase 3 Zod schemas**, normalized (slugs, canonical paths, ids), coerced to safe **non-publish** statuses, and written to **Firestore** via the **Firebase Admin SDK**. Each single-item route also writes a **`zenithIngestions`** audit row alongside the content document. The **batch** route writes content documents only (no per-item ingestion rows) and ends with **one** batch-level `zenithIngestions` record.

No public ISR routes, no GHL sync, no lead capture, no admin UI, no uploads, and no marketing copy changes.

---

## Files Created

| Path                                             | Purpose                                                                         |
| ------------------------------------------------ | ------------------------------------------------------------------------------- |
| `src/lib/zenith/auth.ts`                         | Shared-secret verification (`Bearer` or `x-zenith-secret`), timing-safe compare |
| `src/lib/zenith/responses.ts`                    | `jsonOk` / `jsonError`, Zod issue flattening                                    |
| `src/lib/zenith/normalize.ts`                    | Slug/id/canonical normalization + `normalizeZenithBatchBody`                    |
| `src/lib/zenith/validate.ts`                     | `validateZenith*Payload` wrappers around Phase 3 schemas                        |
| `src/lib/zenith/store.ts`                        | Firestore writes, status coercion, batch orchestration                          |
| `src/app/api/zenith/articles/route.ts`           | `POST` single article                                                           |
| `src/app/api/zenith/landing-pages/route.ts`      | `POST` single landing page + reserved slug guard                                |
| `src/app/api/zenith/lead-magnets/route.ts`       | `POST` single lead magnet                                                       |
| `src/app/api/zenith/batch/route.ts`              | `POST` partial-success batch                                                    |
| `src/app/api/zenith/health/route.ts`             | `GET` auth probe                                                                |
| `docs/examples/zenith-article-request.json`      | Example article envelope                                                        |
| `docs/examples/zenith-landing-page-request.json` | Example landing page envelope                                                   |
| `docs/examples/zenith-lead-magnet-request.json`  | Example lead magnet envelope                                                    |
| `docs/examples/zenith-batch-request.json`        | Example batch envelope                                                          |
| `scripts/validate-zenith-examples.ts`            | Offline JSON ↔ schema smoke test                                                |
| `docs/phase-4-zenith-ingestion.md`               | This document                                                                   |

---

## Files Changed

| Path              | Change                                             |
| ----------------- | -------------------------------------------------- |
| `src/lib/env.ts`  | `getZenithIngestSecret()` (lazy, min 16 chars)     |
| `.env.example`    | `ZENITH_INGEST_SECRET=`                            |
| `firestore.rules` | Comment: Admin SDK ingestion bypasses client rules |
| `package.json`    | `validate:zenith-examples` script                  |

---

## Environment Variables

| Variable               | Scope       | Notes                                                                                                                                |
| ---------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `ZENITH_INGEST_SECRET` | Server only | Required when ingestion routes run; **not** validated at static build time. Min length **16** (Zod). Set in `.env.local` and Vercel. |

Existing Firebase **server** variables remain required for Firestore writes at runtime.

---

## Endpoints Added

| Method | Path                        | Auth |
| ------ | --------------------------- | ---- |
| `POST` | `/api/zenith/articles`      | Yes  |
| `POST` | `/api/zenith/landing-pages` | Yes  |
| `POST` | `/api/zenith/lead-magnets`  | Yes  |
| `POST` | `/api/zenith/batch`         | Yes  |
| `GET`  | `/api/zenith/health`        | Yes  |

All handlers use `export const runtime = "nodejs"` for Admin SDK compatibility.

---

## Authentication

Send the same value as `ZENITH_INGEST_SECRET` using **either**:

- `Authorization: Bearer <ZENITH_INGEST_SECRET>`
- `x-zenith-secret: <ZENITH_INGEST_SECRET>`

Missing or wrong secret → **401** (`Unauthorized`). Secrets are never logged. Comparison uses **SHA-256 digests + `timingSafeEqual`** to reduce timing leaks.

---

## Firestore Writes

| Collection         | Document ID     | Writer                                                                                                                       |
| ------------------ | --------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `articles`         | `{slug}`        | Admin SDK `set({ merge: false })` after merge of coerced fields + timestamps                                                 |
| `landingPages`     | `{slug}`        | Same                                                                                                                         |
| `leadMagnets`      | `{id}`          | Same (id is slug-normalized in `normalizeLeadMagnetDraft`)                                                                   |
| `zenithIngestions` | `{ingestionId}` | Single-item routes: one row per request **in the same batch write** as content. Batch route: **one** summary row at the end. |

**Timestamps:** `updatedAt` is always `serverTimestamp()`. `createdAt` is preserved from an existing document when present; otherwise `serverTimestamp()`.

**Client rules:** Still **deny-by-default** for these collections; only the **Admin SDK** (service account) performs writes.

---

## Status Behavior

- Default stored status: **`draft`** if Zenith sends anything other than explicit `review` / `archived`.
- **`published`** from Zenith is **never** stored as live published content → coerced to **`review`** for a future admin publish step.
- **`archived`** is preserved as **`archived`**.
- **`review`** is preserved as **`review`**.

---

## Batch Behavior

1. Validate the whole payload with `zenithBatchPayloadSchema` (after per-array normalization).
2. Reject empty payloads (no arrays or all empty) with **400**.
3. Reject any **reserved** landing slug up front (same list as single landing route).
4. Process in order: **lead magnets → articles → landing pages** (so magnets exist before pages that reference them, when sent together).
5. **Partial success:** each item is tried independently; failures are collected in `errors` and mirrored in `results.*[].ok === false`.
6. One **`zenithIngestions`** document with `contentType: "batch"`, `rawPayload` = original body, `validationErrors` string array when there are item failures, `status: "saved"` if any item succeeded else `"failed"`.

Per-item routes do **not** create duplicate ingestion rows for batch child saves.

---

## Reserved Landing Page Slugs

Landing `POST` and `batch` reject slugs matching `isReservedTopLevelSlug()` (see `RESERVED_TOP_LEVEL_ROUTES` in `src/lib/content/constants.ts`), including:

`about`, `research`, `programs`, `insights`, `contact`, `privacy`, `terms`, `where-deals-break`, `app`, `api`, `articles`

---

## Example curl Commands

Replace `BASE` and export `ZENITH_INGEST_SECRET` in your shell (do not commit real secrets).

**Health**

```bash
curl -sS "$BASE/api/zenith/health" \
  -H "Authorization: Bearer $ZENITH_INGEST_SECRET"
```

**Article**

```bash
curl -sS -X POST "$BASE/api/zenith/articles" \
  -H "Authorization: Bearer $ZENITH_INGEST_SECRET" \
  -H "Content-Type: application/json" \
  -d @docs/examples/zenith-article-request.json
```

**Landing page**

```bash
curl -sS -X POST "$BASE/api/zenith/landing-pages" \
  -H "x-zenith-secret: $ZENITH_INGEST_SECRET" \
  -H "Content-Type: application/json" \
  -d @docs/examples/zenith-landing-page-request.json
```

**Lead magnet**

```bash
curl -sS -X POST "$BASE/api/zenith/lead-magnets" \
  -H "Authorization: Bearer $ZENITH_INGEST_SECRET" \
  -H "Content-Type: application/json" \
  -d @docs/examples/zenith-lead-magnet-request.json
```

**Batch**

```bash
curl -sS -X POST "$BASE/api/zenith/batch" \
  -H "Authorization: Bearer $ZENITH_INGEST_SECRET" \
  -H "Content-Type: application/json" \
  -d @docs/examples/zenith-batch-request.json
```

---

## What This Phase Does Not Implement

- Public **ISR** or dynamic routes for `/articles/[slug]` or `/[landingPageSlug]`
- **GHL** API or tag sync jobs
- **Lead capture** forms or client submissions
- **Admin** review / publish UI
- **Upload** or transcript pipelines
- **Breakdown** analysis
- **revalidatePath** / **revalidateTag** hooks
- Marketing **copy** or **layout** changes

---

## Phase 5 Readiness

Phase 5 can add either:

- **Admin review & publish** workflow (claims, Firestore rules updates, status transitions to `published`), or
- **Public rendering** (ISR/static generation) consuming `articles` / `landingPages` documents,

depending on product priority.

---

## Scripts

| Command                            | Purpose                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------- |
| `npm run validate:zenith-examples` | Parses `docs/examples/zenith-*.json` through Zenith validators (no HTTP). |
| `npm run validate:content`         | Unchanged from Phase 3 (seed examples vs schemas).                        |
