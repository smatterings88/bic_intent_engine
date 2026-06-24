# Phase 8 — Public ISR Landing Page Renderer

## Summary

This phase adds **public marketing landing pages** at **`/{slug}`** (under the **`(marketing)`** route group), backed by Firestore **`landingPages/{slug}`** via the **Firebase Admin SDK**. Only **`status === "published"`** documents render; other states and **reserved top-level slugs** resolve with **`notFound()`**. Pages use **ISR** with **`revalidate = 900`** (aligned with **`DEFAULT_LANDING_PAGE_REVALIDATE_SECONDS`**). **Metadata**, **Open Graph** (`type: "website"`), **Twitter**, and **JSON-LD** (WebPage/Article, FAQPage when FAQs exist, BreadcrumbList) are generated from landing fields. The **sitemap** includes published landing URLs (excluding reserved segments). **Admin publish/unpublish/archive** triggers **`revalidatePath`** for the landing path and **`/sitemap.xml`**.

No GHL integration, no real lead capture, no uploads, no breakdown pipeline, and no admin editing of landing fields in this phase.

---

## Files Created

| Path                                                           | Purpose                                                                                     |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `src/lib/landing-pages/read.ts`                                | Admin reads: by slug, published by slug, list published, list slugs for SSG (reserved-safe) |
| `src/lib/landing-pages/metadata.ts`                            | `buildLandingPageMetadata` from `landingPage.seo` + site URL patterns                       |
| `src/lib/landing-pages/schema.ts`                              | JSON-LD: WebPage/Article main entity, FAQPage, BreadcrumbList                               |
| `src/lib/landing-pages/revalidate.ts`                          | `revalidateLandingPagePublicPaths`                                                          |
| `src/components/landing-pages/LandingPageTemplate.tsx`         | Composes landing UI + JSON-LD                                                               |
| `src/components/landing-pages/LandingHero.tsx`                 | Hero + CTAs                                                                                 |
| `src/components/landing-pages/LandingAnswerBlock.tsx`          | AEO answer                                                                                  |
| `src/components/landing-pages/LandingSections.tsx`             | Body sections + bullets                                                                     |
| `src/components/landing-pages/LandingProofBlock.tsx`           | Optional proof/stat list                                                                    |
| `src/components/landing-pages/LandingFAQBlock.tsx`             | FAQ (reuses article `FAQBlock`)                                                             |
| `src/components/landing-pages/LandingLeadMagnetBlock.tsx`      | Lead magnet placeholder                                                                     |
| `src/components/landing-pages/RelatedLandingArticlesBlock.tsx` | Links to **`/articles/{slug}`**                                                             |
| `src/components/landing-pages/RelatedLandingPagesBlock.tsx`    | Links to **`/{slug}`** (skips current + reserved)                                           |
| `src/components/landing-pages/LandingJsonLdScript.tsx`         | Safe `application/ld+json` script tag                                                       |
| `src/app/(marketing)/[slug]/page.tsx`                          | ISR landing route + `generateStaticParams` + `generateMetadata`                             |
| `docs/phase-8-public-isr-landing-pages.md`                     | This document                                                                               |

---

## Files Changed

| Path                                           | Change                                                                       |
| ---------------------------------------------- | ---------------------------------------------------------------------------- |
| `src/app/sitemap.ts`                           | Merge published landing URLs with static + article URLs; resilient try/catch |
| `src/app/api/admin/content/publish/route.ts`   | `revalidateLandingPagePublicPaths` when `contentType === "landing_page"`     |
| `src/app/api/admin/content/unpublish/route.ts` | Same                                                                         |
| `src/app/api/admin/content/archive/route.ts`   | Same                                                                         |
| `src/app/app/admin/landing-pages/page.tsx`     | Public **View** link when published; copy for Phase 8                        |

---

## Routes Added

- **`/{slug}`** — one dynamic segment under **`(marketing)`** for **published** landing pages only (e.g. `/sales-call-analysis`).

Existing static routes under the same group (e.g. **`/about`**, **`/articles`**, **`/research`**) continue to take precedence over the dynamic segment.

---

## Data Source

- Collection: **`landingPages/{slug}`** (document id = slug).
- **Public render:** `getPublishedLandingPageBySlug` returns `null` unless **`status === "published"`** (and slug is not reserved) → page calls **`notFound()`**.

---

## Reserved Slug Protection

Reserved segments are defined in **`RESERVED_TOP_LEVEL_ROUTES`** (`src/lib/content/constants.ts`) and enforced with **`isReservedTopLevelSlug`** (`src/lib/content/slug.ts`), including: **`about`**, **`research`**, **`programs`**, **`insights`**, **`contact`**, **`privacy`**, **`terms`**, **`where-deals-break`**, **`app`**, **`api`**, **`articles`**, **`admin`**.

Helpers and **`generateStaticParams`** omit reserved slugs so marketing static routes are not overridden. The **`[slug]`** page also calls **`notFound()`** for invalid or reserved slugs before querying Firestore.

---

## ISR Behavior

- **`export const revalidate = 900`** (literal required by Next.js segment config; matches **`DEFAULT_LANDING_PAGE_REVALIDATE_SECONDS`** in `src/lib/content/constants.ts`).
- **`generateStaticParams`:** `{ slug }[]` from **`listPublishedLandingPageSlugs()`** (empty when Admin env missing at build → build still succeeds).
- **Admin mutations:** after a successful landing **publish/unpublish/archive**, **`revalidatePath(\`/${id}\`)`** and **`/sitemap.xml`**.

---

## Metadata Behavior

- Title / description from **`landingPage.seo.metaTitle`** / **`metaDescription`**.
- Canonical / OG URL from **`absoluteUrl(landingPage.seo.canonicalPath)`**.
- **`landingPage.seo.noindex`:** sets **`robots`** to noindex/nofollow when true.
- Open Graph **`type: "website"`** with optional **`publishedTime`** / **`modifiedTime`** when ISO strings exist.
- Twitter card **`summary`**, aligned with article metadata patterns.

---

## JSON-LD Behavior

- **WebPage / Article:** `@type` **`Article`** when **`landingPage.schema.type === "Article"`**, otherwise **`WebPage`** (including when the content schema enum is **`FAQPage`** — the main entity remains a page-level object; FAQs use the separate FAQ block).
- **`name`** / **`headline`:** **`landingPage.hero.headline`**.
- **`description`:** **`landingPage.seo.metaDescription`**.
- **FAQPage:** only if **`landingPage.aeo.faqs`** has items.
- **BreadcrumbList:** **Home** → **current headline** (no intermediate “Landings” index in Phase 8).

---

## Lead Magnet Placeholder

**`LandingLeadMagnetBlock`** surfaces **`primaryLeadMagnetId`** and deduplicated **`leadMagnetIds`**, and states that **opt-in / GHL sync** ships in a later phase. There is **no form POST**, no lead creation, and no GHL API usage.

---

## Related Links

- **Articles:** **`RelatedLandingArticlesBlock`** uses **`relatedArticleSlugs`** → **`/articles/{slug}`** with readable slug labels.
- **Landings:** **`RelatedLandingPagesBlock`** uses **`relatedLandingPageSlugs`** → **`/{slug}`**, skipping the current slug and reserved segments.

---

## Sitemap Update

**`src/app/sitemap.ts`** keeps static marketing paths and **`/articles/{slug}`** entries, then appends **`/{slug}`** for each published landing (again excluding reserved slugs). If listing landings throws, previously merged static + article entries are still returned when the landing try fails.

---

## What This Phase Does Not Implement

- **GHL** opt-in or tag sync
- **Real lead capture** forms or server handlers
- **Upload** flow or **breakdown** analysis
- **Admin UI** for editing landing content
- **Public draft preview** for non-published landings
- A dedicated **landing page index** route (only dynamic **`/{slug}`**)

---

## Phase 9 Readiness

Phase 9 can wire **lead magnet opt-in** (forms, validation, thank-you / **`conversion.thankYouMessage`** behavior) and optional **GHL sync**, reusing **`primaryLeadMagnetId`**, **`leadMagnetIds`**, and **`conversion.ghlTags`** from the content model.
