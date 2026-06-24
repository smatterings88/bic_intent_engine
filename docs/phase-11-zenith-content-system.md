# Phase 11 — Zenith Content System (v1.2)

## Purpose

Phase 11 adds **non-breaking** infrastructure so ZenithMind can submit structured **Zenith Content v1.2** page JSON. The app validates, stores in Firestore, supports admin publish/unpublish, OG image generation, form routing to GHL, and an **admin-only** preview with a temporary debug renderer. **Phase 12** will add the full public visual renderer and final marketing routes.

Existing Zenith ingestion routes (`/api/zenith/articles`, `landing-pages`, `lead-magnets`, `batch`, `health`) and all admin, GHL, lead, and auth behavior are unchanged.

## New HTTP endpoints

| Method | Path                                       | Auth                                                               |
| ------ | ------------------------------------------ | ------------------------------------------------------------------ |
| POST   | `/api/zenith/content`                      | `ZENITH_CONTENT_SECRET` (Bearer or `x-zenith-secret`)              |
| GET    | `/api/zenith/content?slug=`                | Same secret **or** Firebase admin Bearer token                     |
| POST   | `/api/zenith/content/bulk`                 | Zenith secret                                                      |
| POST   | `/api/zenith/forms/submit`                 | Public (validated body; GHL tags from registry + stored page only) |
| GET    | `/api/admin/zenith/pages`                  | Admin / super_admin Firebase ID token                              |
| GET    | `/api/admin/zenith/pages/[slug]`           | Admin                                                              |
| PATCH  | `/api/admin/zenith/pages/[slug]`           | Admin                                                              |
| POST   | `/api/admin/zenith/pages/[slug]/publish`   | Admin                                                              |
| POST   | `/api/admin/zenith/pages/[slug]/unpublish` | Admin                                                              |
| GET    | `/api/og/[slug]`                           | Public (generated image or 302 to `cdnUrl`)                        |
| GET    | `/api/og/default`                          | Public fallback image                                              |
| GET    | `/api/content/pages/[slug]`                | Public (**published** Zenith pages only)                           |

## Firestore

- **`zenithPages/{slug}`** — full `ZenithPage` document (draft or published), version counter, timestamps.
- **`zenithFormSubmissions/{autoId}`** — form posts from `/api/zenith/forms/submit` with sanitized fields, tracking, and `ghlSyncStatus`.

Server writes use the Firebase Admin SDK via existing `ensureFirebaseAdmin()`.

## Payload shape (ingestion)

Top-level: `id`, `source: "zenithmind"`, `contentType`, `slug`, `title`, `seo`, `ogImage`, optional `keyword`, `leadMagnetId`, `relatedArticleSlugs`, `schema`, `components[]`.

- Ingestion **always** saves **`status: "draft"`**, even if the payload says `published`.
- **`ogImage`** must include **`cdnUrl`** or a valid **`template`** (see types).
- **`components`** must be a non-empty array; **unknown `type` values are rejected**.

Validation: `src/lib/zenith/validation.ts`. Publish rules: `src/lib/zenith/publishValidation.ts`.

## Auth

- **Zenith secret**: `Authorization: Bearer <secret>` or `x-zenith-secret: <secret>`. Secret from `ZENITH_CONTENT_SECRET` (≥16 chars), else falls back to `ZENITH_INGEST_SECRET` via `getZenithContentSecret()` in `src/lib/env.ts`. If neither is configured, ingestion returns **500**.
- **Admin APIs**: `Authorization: Bearer <Firebase ID token>` and Firestore `users/{uid}.role` in `admin` / `super_admin` (existing `assertCurrentUserIsAdmin`).

## Draft vs publish

- Drafts: **`noindex, nofollow`** in `buildZenithPageMetadata` (for future SSR).
- Published: indexable unless `seo.noindex === true` (then `noindex`, `follow`).
- **Publish** runs `validateZenithPageForPublish`; **errors** block publish; **warnings** (e.g. article inline-CTA count ≠ 3) allow publish and are returned in the JSON response.

## OG image dispatch

Implemented in `src/lib/zenith/og.ts` and `src/lib/zenith/metadata.ts`:

1. If **`ogImage.cdnUrl`** is set → use that URL (metadata and API may **302** on `/api/og/[slug]`).
2. Else if **`ogImage.template`** (or default by `contentType`) → use **`/api/og/[slug]`** (1200×630, `@vercel/og`).
3. Else → **`/api/og/default`**.

## Form destination registry

`src/lib/zenith/forms.ts`:

- `call-upload` → GHL tag `sbi --> call upload started`
- `lead-magnet:{id}` → tag `lead_magnet:{id}`
- `webinar:{id}` → tag `webinar:{id}`
- `contact-inbox` → tag `sbi --> contact form`

### GHL tag strategy (`ghlTagStrategy`)

Optional on **`ZenithPage`** (page-level) and on **`lead-form`** components (component-level overrides page).

```ts
type GhlTagStrategy = {
  mode: "merge" | "replace" | "suppress";
  tags?: string[];
};
```

| Mode | Behavior |
| --- | --- |
| `merge` | Default destination tags **plus** `tags` (sanitized, deduped, max 50). |
| `replace` | **Only** `tags` — default destination tags ignored. |
| `suppress` | **No** GHL tags applied for that scope. |

Resolution order for `/api/zenith/forms/submit`: destination defaults → page strategy → component strategy (or legacy **`ghlTags`** on `lead-form` as **merge** when no component `ghlTagStrategy`).

Legacy **`ghlTags`** on `lead-form` still work: each tag must match the destination **family** (no arbitrary browser-supplied tags). Prefer **`ghlTagStrategy`** for explicit merge/replace/suppress.

Submissions store **`intendedGhlTags`** on `zenithFormSubmissions` for audit.

## Testing with fixtures

JSON fixtures live under `src/lib/zenith/__fixtures__/`. Example (with secret configured):

```bash
curl -sS -X POST "$BASE/api/zenith/content" \
  -H "Authorization: Bearer $ZENITH_CONTENT_SECRET" \
  -H "Content-Type: application/json" \
  -d @src/lib/zenith/__fixtures__/article-v12.json
```

Preview (browser): sign in as admin, open `/preview/<slug>`.

## Regression checklist

- [ ] Existing admin lead and GHL routes unchanged.
- [ ] Existing `/api/zenith/articles|landing-pages|lead-magnets|batch|health` unchanged.
- [ ] `npm run lint` and `npm run build` succeed.

## Known TODOs (Phase 12)

- Full React renderer for each `ZenithComponent` type.
- Public SSR routes wired to `zenithPages` + `buildZenithPageMetadata`.
- Visual system from v1.2 spec (no raw CSS from Zenith).
