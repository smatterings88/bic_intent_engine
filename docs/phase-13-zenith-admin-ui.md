# Phase 13: Zenith Admin UI and Content Operations

Phase 13 adds **admin dashboard UI** for managing Zenith-generated pages: list, inspect, preview, publish/unpublish, and operational review panels (SEO, OG, validation, component overview, raw JSON).

This phase is **additive** and uses existing Phase 11/12 APIs. No public routes or ingestion contracts change.

## Admin routes

- **List**: `/app/admin/zenith`
- **Detail**: `/app/admin/zenith/[slug]`

Both routes are protected by the existing admin auth pattern (`AdminGuard` + `AdminNav` layout).

## API endpoints used (no Firestore access from client)

- `GET /api/admin/zenith/pages` (supports `status`, `contentType`, `q`)
- `GET /api/admin/zenith/pages/[slug]` (now also returns an additive `validation` object)
- `POST /api/admin/zenith/pages/[slug]/publish`
- `POST /api/admin/zenith/pages/[slug]/unpublish`

Client fetches are authenticated via Firebase ID token Bearer header (same pattern as existing admin clients).

## Admin list UI

`AdminZenithPagesClient` renders:

- Summary cards (total/draft/published/type breakdown)
- Filters:
  - search by title/slug
  - status (all/draft/published)
  - content type (all / per Zenith content type)
  - refresh
- Table:
  - Title → detail
  - Type badge
  - Status badge
  - Component count
  - Updated timestamp
  - Links (preview/public/OG/detail)
  - Publish/unpublish actions

## Admin detail UI

`AdminZenithPageDetailClient` shows:

- Header with title/slug, type + status badges, timestamps, version/specVersion
- Buttons:
  - Preview (always)
  - Public (only when published)
  - OG
  - Publish/Unpublish
- Panels:
  - Links
  - SEO (read-only; highlights missing meta)
  - OG preview (img from `/api/og/[slug]` and raw og fields)
  - Publish readiness (errors/warnings from server validation)
  - Component overview (type + short summary)
  - Raw JSON (collapsed by default)

## Validation behavior

`GET /api/admin/zenith/pages/[slug]` now includes:

```ts
validation: { ok: boolean; errors: string[]; warnings: string[] }
```

This uses the same server-side rules as publish (`validateZenithPageForPublish`) and is **additive** to the response shape.

## Navigation

Admin navigation now includes **“Zenith Pages”** linking to `/app/admin/zenith` (and the Overview page links to it as well).

## Future (Phase 14+)

- Edit SEO / OG fields in admin
- Archive/delete draft pages safely (new admin endpoint)
- Validation badges in list view
- Version history/diff tooling
- Batch publish/unpublish

