# Phase 7 — Rotating Cross-Article Links

## Summary

Public article pages now build **deterministic rotating internal links** from the full **published** article inventory, using **`Article.internalLinking`** (clusters, required/excluded slugs, `maxLinks`) plus **`relatedArticleSlugs`** as a lower-priority pool. Selection runs **server-side** during ISR render/revalidation; the same article in the **same ISO week** yields the same link set (no per-refresh randomness). If listing all published articles fails, the page still renders and **`RelatedArticlesBlock`** falls back to **`relatedArticleSlugs`** only.

---

## Files Created

| Path                                           | Purpose                                                                  |
| ---------------------------------------------- | ------------------------------------------------------------------------ |
| `src/types/internal-links.ts`                  | `InternalLinkReason`, `RotatingArticleLink`, `RotatingArticleLinkResult` |
| `src/lib/articles/rotation.ts`                 | ISO week key, rotation key, `stableHash`, `deterministicShuffle`         |
| `src/lib/articles/internal-links.ts`           | `selectRotatingArticleLinks`                                             |
| `scripts/validate-article-rotation.ts`         | Smoke checks: no self-link, maxLinks, determinism, week key              |
| `docs/phase-7-rotating-cross-article-links.md` | This document                                                            |

---

## Files Changed

| Path                                               | Change                                                             |
| -------------------------------------------------- | ------------------------------------------------------------------ |
| `src/types/index.ts`                               | Export internal-link types                                         |
| `src/lib/articles/read.ts`                         | `listPublishedArticlesForInternalLinks()` (alias for clarity)      |
| `src/components/articles/ArticleTemplate.tsx`      | Optional `rotatingLinks` prop                                      |
| `src/components/articles/RelatedArticlesBlock.tsx` | Prefer rotating links; slug fallback; heading **Related research** |
| `src/app/(marketing)/articles/[slug]/page.tsx`     | Fetch all published, `selectRotatingArticleLinks`, safe try/catch  |
| `src/app/app/admin/articles/page.tsx`              | Optional **Cluster** / **Max links** columns                       |
| `package.json`                                     | `validate:article-rotation` script                                 |

---

## Rotation Strategy

- **Deterministic:** `stableHash` + Fisher–Yates shuffle with a seed derived from `createArticleRotationKey(slug, date)`.
- **ISO week window:** `getIsoWeekKey` via **`date-fns`** `getISOWeek` / `getISOWeekYear` → strings like `2026-W20`.
- **Rotation key:** `{articleSlug}::{isoWeekKey}`.
- **Stable within the week:** same slug + same calendar week → same ordering for the same candidate pools.
- **Changes across weeks:** a new ISO week changes the seed, so ordering (and which candidates surface when capped by `maxLinks`) can change.
- **Not client-randomized:** all logic runs on the server during page generation / ISR.

---

## Link Selection Priority

For a published **current** article, candidates are **published** documents other than the current slug and not in **`internalLinking.excludedLinks`**.

1. **`required`** — slugs in **`internalLinking.requiredLinks`** that resolve to published articles (group shuffled, then taken in shuffled order up to `maxLinks`).
2. **`same_cluster`** — `primaryCluster` matches current (case-insensitive, trimmed), excluding already chosen.
3. **`related_cluster`** — candidate `primaryCluster` is in current **`relatedClusters`** (and not the same as current primary).
4. **`explicit_related`** — **`relatedArticleSlugs`** that resolve to published articles in inventory.
5. **`fallback`** — remaining published articles.

Within each bucket, candidates are **`deterministicShuffle`d** with a seed suffix unique to that stage. **`maxLinks`** is clamped to **1–12**. Descriptions on links use **`subtitle`** or else **`seo.metaDescription`**.

---

## SEO / ISR Behavior

- Links are chosen **at render time** on the server (including static generation and ISR revalidation).
- Until the page is regenerated, the HTML for that build reflects the selection at generation time.
- After **admin publish/unpublish/archive** (Phase 6), **`revalidatePath`** can refresh `/articles/[slug]` so the next render can apply a new week or inventory.

---

## Public UI Behavior

- **`RelatedArticlesBlock`** uses **`rotatingLinks.links`** when non-empty: shows title, optional description, links to **`/articles/{slug}`**.
- **`InternalLinkReason`** is **not** shown in the UI; links may carry a subtle **`data-internal-link-reason`** attribute for debugging.
- If rotation yields **no** links (e.g. empty inventory) or the inventory fetch **throws**, the block falls back to **`relatedArticleSlugs`** (still capped by **`internalLinking.maxLinks`**).

---

## Sitemap Update

No change in Phase 7.

---

## What This Phase Does Not Implement

- Public **landing page** renderer
- **GHL** or CRM automation
- **Lead capture** forms or opt-in flows
- **Uploads** or **breakdown** analysis
- **Admin editing** of internal-link fields (read-only visibility only)
- **Draft preview** for internal links

---

## Phase 8 Readiness

Phase 8 can add the **public landing page renderer** (dynamic `/[slug]` or equivalent) while keeping article URLs and internal linking contracts established in Phases 6–7.

---

## Scripts

| Command                             | Purpose                           |
| ----------------------------------- | --------------------------------- |
| `npm run validate:article-rotation` | Deterministic rotation smoke test |
