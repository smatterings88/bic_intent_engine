# Phase 12: Zenith Visual Renderer and Public Page Routes

Phase 12 adds the **production React rendering layer** for ZenithMind structured pages (Component Specification v1.2), **public routes** by `contentType`, **theme-driven shells**, **SEO metadata** (Phase 11 helpers), **JSON-LD**, **lead form submission** to the existing API, **CTA destination resolution**, **related articles**, and an **admin preview** that uses the real renderer with a **debug JSON fallback** on render errors.

Phase 11 ingestion, Firestore, admin APIs, OG route, content JSON endpoint, and form submit endpoint are unchanged.

## Public routes

| `contentType`       | Path pattern        | Notes |
|---------------------|---------------------|--------|
| `article`           | `/articles/[slug]` | Legacy published articles win when the same slug exists; otherwise Zenith published `article`. |
| `landing_page`      | `/[slug]`          | Legacy landing pages first; reserved slugs excluded; then Zenith `landing_page`. |
| `lead_magnet_page`  | `/guides/[slug]`   | Zenith only. |
| `webinar_page`      | `/webinars/[slug]` | Zenith only. |
| `cta_page`          | `/cta/[slug]`      | Zenith only. |
| `research_page`     | `/research/[slug]` | Zenith only. |

Draft pages are **not** served on these routes (`notFound()`). Preview remains **`/preview/[slug]`** (admin-authenticated, always noindex).

## Component renderer map

`ZenithComponentRenderer` maps `component.type` to:

| Type | Component |
|------|-----------|
| `page-hero` | `PageHero` |
| `aeo-answer-block` | `AeoAnswerBlock` |
| `body-section` | `BodySection` |
| `transcript-block` | `TranscriptBlock` |
| `signal-breakdown` | `SignalBreakdown` |
| `inline-cta` | `InlineCta` |
| `faq-section` | `FaqSection` |
| `lead-form` | `LeadForm` (client) |
| `footer-cta` | `FooterCta` |
| `lead-magnet-callout` | `LeadMagnetCallout` |
| `quote-block` | `QuoteBlock` |
| `research-callout` | `ResearchCallout` |
| `speaker-block` | `SpeakerBlock` |
| `webinar-urgency-block` | `WebinarUrgencyBlock` (+ optional client countdown) |
| `comparison-table` | `ComparisonTable` |

Unknown types render nothing; optional fields are guarded so missing copy does not crash the tree.

## Styling contract (v1.2 intent, app-owned tokens)

Zenith does not send CSS. Visual intent is implemented via **`src/lib/zenith/theme.ts`** (`ZENITH_THEME`, `getZenithPageTheme`, `getVerdictTheme`, `getInlineCtaTheme`), including:

- **Footer CTA**: full-width navy (`#1e3560`), white text.
- **Transcript block**: monospace dialogue, left border, timestamp, signal cards, verdict coloring (`deal-alive` / `deal-shifted` / `deal-dead`).
- **AEO answer block**: navy left border, small caps “THE SHORT ANSWER”.
- **Inline CTA `full-block`**: full-width navy block.
- **Research callout**: inset + accent bar.
- **Lead magnet callout**: lighter bordered card.

Per–`contentType` page backgrounds and shell tone (article editorial cream, webinar/CTA dark, research clinical white, etc.) come from `getZenithPageTheme`.

## Heading / SEO rules

- **Articles**: a single **H1** from `page.title` in `ZenithArticleShell`; `page-hero` does not emit an H1 on articles.
- **Other types**: if there is no `page-hero` headline, `ZenithFallbackTitle` supplies an H1 from `page.title`.
- **`generateMetadata`**: uses `buildZenithPageMetadata` from Phase 11; respects `seo.noindex`, canonical, OG image (`/api/og/[slug]`), Twitter `summary_large_image` where configured in the helper.

## JSON-LD

`src/lib/zenith/schema.ts` — `buildZenithJsonLd(page, baseUrl?)` produces a small array of blocks (Organization, WebPage, BreadcrumbList; Article for articles; FAQ from FAQ components; Event when webinar date is available; conservative Article/CreativeWork for research).

`ZenithSchemaJsonLd` renders `<script type="application/ld+json">` tags (JSON only in `dangerouslySetInnerHTML`, which is standard for LD+JSON).

## CTA destinations

Client-safe helpers live in **`src/lib/zenith/destinations.ts`** (`getHrefForZenithDestination`, `resolveCtaDestination`, form anchor ids). **`ZenithCtaButton`** adds GTM-oriented `data-zenith-cta-destination`, `data-zenith-page-slug`, and `data-zenith-content-type`.

Mappings include: `call-upload` → `/app` (upload entry), `lead-magnet:id` → `/guides/[id]`, `webinar:id` → `/webinars/[id]`, `contact-inbox` → `/contact`, unknown → `#`, and same-page form anchors when applicable.

GHL tagging uses **`resolveZenithFormGhlTags`** in **`src/lib/zenith/forms.ts`** (see **`src/lib/ghl/tag-strategy.ts`**). Configure **`ghlTagStrategy`** on the page and/or on each **`lead-form`** (`merge` | `replace` | `suppress`). The submit API does not accept tag lists from the browser.

## Lead forms

`LeadForm` is a **client component**. It POSTs to **`POST /api/zenith/forms/submit`** with `pageSlug`, `variant`, `destination`, `fields`, and `tracking` (UTM keys normalized, `referrer`, `path`).

- Success: thank-you message from the response or component copy; `data-state="submitted"` on the wrapper.
- Errors: generic user-facing message; no raw server errors.
- **`call-upload` variant**: email-first flow plus link to **`/app`** (Next.js `Link`) when full file upload is not wired through the Zenith submit API.

## Related reading

`getRelatedPublishedZenithPages` in **`src/lib/zenith/related.ts`** loads published pages by slug (Firestore), preserves order, builds `publicUrl` via **`getPublicPathForZenithPage`**. Failures are swallowed server-side; the section renders nothing if empty.

Because **`ZenithPageRenderer`** is a client component, related cards are **fetched on the server** in each route and passed as `relatedCards`.

## Preview

`/preview/[slug]`:

- Admin auth unchanged (Phase 11).
- Renders **`ZenithPageRenderer`** with `mode="preview"` (draft banner when `status === draft`, subtle strip with status / component count / slug).
- **`ZenithPreviewErrorBoundary`** falls back to **`ZenithDebugRenderer`** on render errors (no stack traces to the user).
- Collapsible raw JSON for admins below the page.
- `robots`: noindex (route metadata).

## Known limitations

- Landing and top-level dynamic slug routing intentionally **defers to legacy** content and **reserved slugs** to avoid breaking existing marketing URLs.
- `generateStaticParams` merges legacy slugs with Zenith where applicable. **`listPublishedZenithSlugsByContentType`** returns an empty list when Firebase Admin env is missing (`hasServerFirebaseConfig()`), so **CI/production builds** do not require Firestore credentials at build time; pages remain dynamically available at runtime when configured.
- Analytics vendor pixels are not added; CTA **`data-*`** hooks are ready for GTM.

## Phase 13 suggestions

- Admin UI: Zenith page list, publish/unpublish, preview links, validation warnings, submission viewer, OG overrides, archive/delete for test pages.
