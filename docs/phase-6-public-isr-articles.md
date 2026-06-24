# Phase 6 — Public ISR Article Renderer

## Summary

This phase adds **public article routes** at `/articles` and `/articles/[slug]`, backed by **Firestore** via the **Firebase Admin SDK** on the server. Only documents with **`status === "published"`** render; other states resolve with **`notFound()`**. Pages use **ISR** with **`DEFAULT_ARTICLE_REVALIDATE_SECONDS`** (3600s). **Metadata**, **Open Graph**, **Twitter**, and **JSON-LD** (Article/BlogPosting, FAQPage when FAQs exist, BreadcrumbList) are generated from article fields. **Sitemap** includes published article URLs. **Admin publish/unpublish/archive** triggers **`revalidatePath`** for article paths and the sitemap when `contentType === "article"`.

No landing-page renderer, no rotating internal links, no GHL, no lead capture, no uploads, no draft preview.

---

## Files Created

| Path                                                 | Purpose                                                                                 |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `src/lib/articles/read.ts`                           | Admin SDK reads: published by slug, any by slug, list published, list slugs for SSG/ISR |
| `src/lib/articles/metadata.ts`                       | `buildArticleMetadata` from `article.seo` + site URL patterns                           |
| `src/lib/articles/schema.ts`                         | JSON-LD builders: article, FAQ, breadcrumb                                              |
| `src/lib/articles/revalidate.ts`                     | `revalidateArticlePublicPaths` for admin mutations                                      |
| `src/components/articles/ArticleTemplate.tsx`        | Composes article UI + JSON-LD                                                           |
| `src/components/articles/ArticleHeader.tsx`          | Title, subtitle, primary keyword                                                        |
| `src/components/articles/AnswerBlock.tsx`            | AEO answer block                                                                        |
| `src/components/articles/ArticleBody.tsx`            | Intro, sections, conclusion                                                             |
| `src/components/articles/FAQBlock.tsx`               | FAQ list                                                                                |
| `src/components/articles/RelatedArticlesBlock.tsx`   | Up to 5 links from `relatedArticleSlugs`                                                |
| `src/components/articles/ArticleLeadMagnetBlock.tsx` | Placeholder when `leadMagnetId` set                                                     |
| `src/components/articles/JsonLdScript.tsx`           | Safe `application/ld+json` script tag                                                   |
| `src/app/(marketing)/articles/page.tsx`              | Published articles index                                                                |
| `src/app/(marketing)/articles/[slug]/page.tsx`       | ISR article page + `generateStaticParams` + `generateMetadata`                          |
| `src/app/sitemap.ts`                                 | Static routes + `/articles` + published `/articles/{slug}`                              |
| `docs/phase-6-public-isr-articles.md`                | This document                                                                           |

---

## Files Changed

| Path                                           | Change                                                    |
| ---------------------------------------------- | --------------------------------------------------------- |
| `src/app/api/admin/content/publish/route.ts`   | Call `revalidateArticlePublicPaths` for articles          |
| `src/app/api/admin/content/unpublish/route.ts` | Same                                                      |
| `src/app/api/admin/content/archive/route.ts`   | Same                                                      |
| `src/app/app/admin/articles/page.tsx`          | Public “View” link when published; copy tweak for Phase 6 |

---

## Routes Added

- **`/articles`** — index of published articles (ISR).
- **`/articles/[slug]`** — published article detail (ISR, `generateStaticParams` from Firestore).

Both live under **`(marketing)`** so they use **`SiteLayout`** like the rest of the public site.

---

## Data Source

- Collection: **`articles/{slug}`** (document id = slug, consistent with Zenith ingest).
- **Public render:** `getPublishedArticleBySlug` returns `null` unless **`status === "published"`** → page calls **`notFound()`**.

---

## ISR Behavior

- **`export const revalidate = 3600`** on both `/articles` and `/articles/[slug]` (literal required by Next.js segment config analysis; value matches **`DEFAULT_ARTICLE_REVALIDATE_SECONDS`** in `src/lib/content/constants.ts`).
- **`generateStaticParams`:** returns `{ slug }[]` from **`listPublishedArticleSlugs()`** (empty when Admin env missing at build → build still succeeds; on-demand generation still possible).
- **Admin mutations:** after a successful article publish/unpublish/archive, **`revalidatePath(`/articles/${id}`)`**, **`/articles`**, and **`/sitemap.xml`**.

---

## Metadata Behavior

- Title / description from **`article.seo.metaTitle`** / **`metaDescription`**.
- Canonical / OG URL from **`absoluteUrl(article.seo.canonicalPath)`** (must start with `/`).
- **`article.seo.noindex`:** sets **`robots`** to noindex/nofollow when true.
- Open Graph **`type: "article"`** with **`publishedTime`** / **`modifiedTime`** when ISO strings exist on the article.
- Twitter card **`summary`**, aligned with existing **`buildPageMetadata`** patterns.

---

## JSON-LD Behavior

- **Article / BlogPosting:** `@type` from **`article.schema.type`** when `BlogPosting`, else **`Article`**; headline, description, url, optional dates, **`mainEntityOfPage`**, **`publisher`** (Sales Breakdown Institute).
- **FAQPage:** only if **`article.aeo.faqs`** has items.
- **BreadcrumbList:** Home → Articles index → current article title.

---

## Lead Magnet Placeholder

If **`article.leadMagnetId`** is set, a **“Related resource”** panel shows the id and explains that opt-in / full lead magnet UI ships in a later phase.

---

## Related Article Links

**Phase 6:** up to **five** slugs from **`relatedArticleSlugs`**, excluding the current slug, linking to **`/articles/{slug}`**. Labels are derived from slugs when titles are not fetched.

**Phase 7:** rotating / cluster-based internal links (per **`internalLinking`** metadata) can replace or augment this block.

---

## Sitemap Behavior

- **`src/app/sitemap.ts`** serves **`/sitemap.xml`** with existing static marketing paths plus **`/articles`** and each **`/articles/{slug}`** for published articles.
- **`lastModified`:** prefers **`updatedAt`**, then **`publishedAt`**, else now.
- If listing articles throws, returns **static URLs only** (catch block).

---

## Admin Revalidation Behavior

On **`POST`** publish / unpublish / archive, when **`contentType === "article"`** and **`id`** is the article slug, **`revalidateArticlePublicPaths(id)`** runs (Next **`next/cache`**).

---

## What This Phase Does Not Implement

- Public **dynamic landing pages**
- **Rotating** cross-article internal links (only static related list)
- **GHL**, **lead capture**, **uploads**, **breakdowns**
- **Draft preview** for non-published articles
- Changes to **existing marketing page copy** beyond the new `/articles` index content and admin helper text

---

## Phase 7 Readiness

Phase 7 can implement **rotating / cluster-based** related article logic using **`internalLinking`** (and optional Firestore queries), without changing the public URL scheme established here.
