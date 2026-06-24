# Phase 5 — Admin Review and Publish Foundation

## Summary

This phase adds an **admin-only area** under `/app/admin` for reviewing ZenithMind-ingested **articles**, **landing pages**, **lead magnets**, and **ingestion audit** rows. Admins can **publish**, **unpublish** (back to review), and **archive** content via **Next.js API routes** that verify a **Firebase ID token** and the caller’s **`users/{uid}.role`** in Firestore.

**No public ISR routes**, no GHL, no lead capture, no uploads, no breakdowns, and **no marketing copy changes**.

---

## Files Created

| Path                                           | Purpose                                                                   |
| ---------------------------------------------- | ------------------------------------------------------------------------- |
| `src/lib/admin/roles.ts`                       | `isAdminRole`, `assertAdminRole`                                          |
| `src/lib/admin/auth.ts`                        | Bearer ID token verification, `assertCurrentUserIsAdmin`, `AdminApiError` |
| `src/lib/admin/content.ts`                     | Server-side list helpers (Admin SDK, latest 50, serialized timestamps)    |
| `src/lib/admin/mutations.ts`                   | Publish / unpublish / archive Firestore updates                           |
| `src/lib/admin/client-actions.ts`              | Browser helpers calling admin APIs with ID token                          |
| `src/app/api/admin/content/publish/route.ts`   | `POST` publish                                                            |
| `src/app/api/admin/content/unpublish/route.ts` | `POST` unpublish → `review`                                               |
| `src/app/api/admin/content/archive/route.ts`   | `POST` archive                                                            |
| `src/app/api/admin/articles/route.ts`          | `GET` list articles (admin only)                                          |
| `src/app/api/admin/landing-pages/route.ts`     | `GET` list landing pages                                                  |
| `src/app/api/admin/lead-magnets/route.ts`      | `GET` list lead magnets                                                   |
| `src/app/api/admin/ingestions/route.ts`        | `GET` list ingestions                                                     |
| `src/components/admin/AdminGuard.tsx`          | Role gate + Firestore profile read for `role`                             |
| `src/components/admin/AdminNav.tsx`            | Sidebar links                                                             |
| `src/components/admin/AdminContentTable.tsx`   | Simple table shell                                                        |
| `src/components/admin/ContentStatusBadge.tsx`  | Status pill (content + ingestion statuses)                                |
| `src/components/admin/ContentActions.tsx`      | Publish / Unpublish / Archive buttons                                     |
| `src/hooks/useAdminApiList.ts`                 | Client fetch for list APIs with Bearer token                              |
| `src/app/app/admin/layout.tsx`                 | `AdminGuard` + `AdminNav` wrapper                                         |
| `src/app/app/admin/page.tsx`                   | Admin home                                                                |
| `src/app/app/admin/articles/page.tsx`          | Article table + actions                                                   |
| `src/app/app/admin/landing-pages/page.tsx`     | Landing table + actions                                                   |
| `src/app/app/admin/lead-magnets/page.tsx`      | Lead magnet table + actions                                               |
| `src/app/app/admin/ingestions/page.tsx`        | Ingestions table (read-only)                                              |
| `src/app/app/admin/leads/page.tsx`             | Placeholder                                                               |
| `src/app/app/admin/submissions/page.tsx`       | Placeholder                                                               |
| `docs/phase-5-admin-review-publish.md`         | This document                                                             |

---

## Files Changed

| Path                              | Change                                                                  |
| --------------------------------- | ----------------------------------------------------------------------- |
| `src/components/app/AppShell.tsx` | Link to `/app/admin`                                                    |
| `src/lib/content/constants.ts`    | `admin` added to `RESERVED_TOP_LEVEL_ROUTES`                            |
| `firestore.rules`                 | Comments documenting Admin SDK–only reads/writes for content in Phase 5 |

---

## Admin Routes Added

- `/app/admin` — overview
- `/app/admin/articles`
- `/app/admin/landing-pages`
- `/app/admin/lead-magnets`
- `/app/admin/ingestions`
- `/app/admin/leads` — placeholder
- `/app/admin/submissions` — placeholder
- `/app/admin/preview/articles/[slug]` — rendered article preview (any status; admin-only)
- `/app/admin/preview/landing-pages/[slug]` — rendered landing preview (any status; admin-only)

---

## Admin API Routes Added

| Method | Path                           | Auth                                      |
| ------ | ------------------------------ | ----------------------------------------- |
| `POST` | `/api/admin/content/publish`   | Bearer Firebase **ID token** + admin role |
| `POST` | `/api/admin/content/unpublish` | Same                                      |
| `POST` | `/api/admin/content/archive`   | Same                                      |
| `GET`  | `/api/admin/articles`          | Same (lists latest 50 via Admin SDK)      |
| `GET`  | `/api/admin/landing-pages`     | Same                                      |
| `GET`  | `/api/admin/lead-magnets`      | Same                                      |
| `GET`  | `/api/admin/ingestions`        | Same                                      |

**Rendered preview (any status):** `GET /api/admin/preview/articles/[slug]` and `GET /api/admin/preview/landing-pages/[slug]` return the full document JSON for admins using the same Bearer token + role check. The admin UI renders `ArticleTemplate` / `LandingPageTemplate` at `/app/admin/preview/...` (see **Update — Admin rendered preview** below).

List routes exist so the browser **does not** need Firestore read rules on content collections; all list data is loaded through verified admin API handlers.

---

## Role Model

| Role          | Access                             |
| ------------- | ---------------------------------- |
| `user`        | Standard app only; admin UI denied |
| `admin`       | Admin console + mutations          |
| `super_admin` | Same as `admin` for Phase 5        |

---

## How Admin Mutations Are Secured

1. Client sends `Authorization: Bearer <Firebase ID token>` (same header pattern as list APIs).
2. Server calls **`adminAuth.verifyIdToken(token)`** (Firebase Admin).
3. Server loads **`users/{uid}`** with existing **`getUserProfile`** helper.
4. Server requires **`role`** in `admin` or `super_admin` (`isAdminRole`).
5. If any step fails → **401** (bad/missing token) or **403** (not admin / no profile).

**Client-only checks are insufficient**; mutations never trust UI alone.

---

## Publishing Behavior

| Action        | Firestore updates                                                                                    |
| ------------- | ---------------------------------------------------------------------------------------------------- |
| **Publish**   | `status: "published"`, `updatedAt`, `reviewedByUid`, `reviewedAt`; sets `publishedAt` only if absent |
| **Unpublish** | `status: "review"`, `updatedAt`, `unpublishedByUid`, `unpublishedAt`                                 |
| **Archive**   | `status: "archived"`, `updatedAt`, `archivedByUid`, `archivedAt`                                     |

- Documents are **never hard-deleted**.
- **`revalidatePath` / `revalidateTag`**: not called (no public ISR routes yet). TODO in mutation code paths for Phase 6+.

---

## How To Make A User Admin

In the [Firebase console](https://console.firebase.google.com/) → **Firestore** → collection **`users`** → document with ID = the user’s **Auth UID**:

Set field:

- `role` = `"admin"` **or** `"super_admin"` (string)

No Cloud Function is required for Phase 5; this is a **manual** Firestore edit (or a future admin-user tool).

**Phase 8.5:** three configured institute emails are automatically promoted to **`super_admin`** on profile sync (see `src/lib/admin/super-users.ts` and `docs/phase-8-5-super-user-bootstrap.md`). You can also run `npm run bootstrap:super-users` to upgrade existing Auth users without waiting for the next login.

---

## List + Serialization

- Up to **50** documents per collection, ordered by **`updatedAt`** descending when the index allows; on query/index errors the helper falls back to an unordered read and sorts in memory by timestamp string.
- Timestamps are converted to **ISO strings** in JSON for the admin UI.

---

## Update — Admin rendered preview (articles & landing pages)

Admins can review **full rendered** articles and landing pages before (or after) publish:

| Route                                     | Behavior                                                                                                                                                                                      |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/app/admin/preview/articles/[slug]`      | Loads document via **`GET /api/admin/preview/articles/[slug]`** (Admin SDK `getArticleBySlug`), then renders **`ArticleTemplate`**. Works for `draft`, `review`, `published`, and `archived`. |
| `/app/admin/preview/landing-pages/[slug]` | Same pattern with **`getLandingPageBySlug`** and **`LandingPageTemplate`**.                                                                                                                   |

- **Auth:** Same as other admin APIs — **`Authorization: Bearer <Firebase ID token>`** + **`users/{uid}.role`** is `admin` or `super_admin`**. Unauthenticated or non-admin callers receive **401/403\*\*; no public bypass.
- **Marketing list tables** include a **Preview** link per row.
- **Landing opt-in:** The public **`POST /api/landing-pages/opt-in`** route still requires a **published** landing document. Previewing an unpublished landing shows the form, but submit will fail until publish.

---

## What This Phase Does Not Implement

- Public **ISR** or dynamic routes for articles or landing pages
- **Public** unauthenticated URLs that render draft/review content (only **admin-authenticated** preview under `/app/admin/preview/...`)
- **GHL** sync or tags beyond stored metadata
- **Lead capture** forms or **leads** management (placeholder page only)
- **Uploads**, **submissions**, **breakdown** analysis (placeholder only)
- **Automatic revalidation** after publish
- **Custom claims** / Cloud Functions for role propagation (optional future improvement)

---

## Phase 6 Readiness

With **`status === "published"`** set through this admin flow, **Phase 6** can introduce **`/articles/[slug]`** (or equivalent) **ISR/static generation** that reads only published documents and optionally hooks **`revalidatePath`** from publish/unpublish when routes exist.
