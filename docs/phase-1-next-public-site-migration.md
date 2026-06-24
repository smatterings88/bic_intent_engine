# Phase 1 — Next.js Public Site Migration

## Summary

The public Sales Breakdown Institute site was migrated from **TanStack Start on Vite** (Cloudflare-oriented) to **Next.js 15 App Router** with **Tailwind CSS v4** (PostCSS). Default `npm run dev`, `npm run build`, and `npm run start` target Next.js only. **Phase 1.5** moved remaining TanStack/Vite/Wrangler sources to `legacy/tanstack-vite/` — see `docs/phase-1-5-legacy-cleanup.md`.

**Fonts:** `next/font/google` loads **Inter** and **Source Serif 4** with CSS variables `--font-inter` and `--font-source-serif` wired into the existing `@theme` font stacks in `globals.css` (replacing the previous Google Fonts `<link>` tags).

**Metadata:** Route-level `head()` from TanStack was ported to **`export const metadata`** (and shared helpers in `src/lib/build-metadata.ts`) with **canonical URLs** from `NEXT_PUBLIC_SITE_URL` / `siteConfig.url`. **Open Graph** and **Twitter** images use **`siteConfig.openGraphImagePath`** (first-party `/favicon.png` after Phase 1.5; a dedicated `og.png` is a documented follow-up).

**Contact:** UI and mock submit behavior are unchanged; only **`ContactInquiryForm`** is a client component, with a **TODO** for future server-side submission (GHL / etc.).

A repo-wide **`npx prettier --write`** run during Phase 1 also formatted files that were later **archived** under `legacy/tanstack-vite/` (formatting only, no copy changes).

---

## Files Created

| Path                                         | Purpose                                                                     |
| -------------------------------------------- | --------------------------------------------------------------------------- |
| `next.config.ts`                             | Next.js configuration                                                       |
| `postcss.config.mjs`                         | Tailwind v4 PostCSS pipeline                                                |
| `next-env.d.ts`                              | Next.js TypeScript references                                               |
| `eslint.config.mjs`                          | ESLint flat config (Next + Prettier); **`legacy/**` ignored\*\* (Phase 1.5) |
| `.env.example`                               | Documents `NEXT_PUBLIC_SITE_URL`                                            |
| `src/app/globals.css`                        | Live global styles + Tailwind `@theme` / tokens                             |
| `src/app/layout.tsx`                         | Root layout, default `metadata`, fonts, `SiteLayout` shell                  |
| `src/app/not-found.tsx`                      | 404 UI (ported from `__root.tsx` `notFoundComponent` inner content)         |
| `src/app/page.tsx`                           | Home `/`                                                                    |
| `src/app/about/page.tsx`                     | `/about`                                                                    |
| `src/app/research/page.tsx`                  | `/research`                                                                 |
| `src/app/programs/page.tsx`                  | `/programs`                                                                 |
| `src/app/insights/page.tsx`                  | `/insights`                                                                 |
| `src/app/contact/page.tsx`                   | `/contact`                                                                  |
| `src/app/privacy/page.tsx`                   | `/privacy`                                                                  |
| `src/app/terms/page.tsx`                     | `/terms`                                                                    |
| `src/app/where-deals-break/page.tsx`         | `/where-deals-break`                                                        |
| `src/components/site/SiteLayout.tsx`         | Shell (header + main + footer)                                              |
| `src/components/site/Header.tsx`             | Sticky header + nav (`next/link` + `usePathname` for active state)          |
| `src/components/site/Footer.tsx`             | Footer columns and legal links                                              |
| `src/components/site/PageHeader.tsx`         | Shared page title band                                                      |
| `src/components/site/ContactInquiryForm.tsx` | Client-only mock contact form + TODO                                        |
| `src/lib/site.ts`                            | `siteConfig` (name, url, description, legacy OG image)                      |
| `src/lib/build-metadata.ts`                  | `absoluteUrl`, `buildPageMetadata`, OG defaults                             |
| `docs/phase-1-next-public-site-migration.md` | This document                                                               |

---

## Files Changed

| Path                                                                      | Change                                                                                                                                |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `package.json`                                                            | Scripts → Next; removed TanStack/Vite/Cloudflare deps; added `next`, `@tailwindcss/postcss`, `eslint-config-next`, `@eslint/eslintrc` |
| `tsconfig.json`                                                           | Next-oriented compiler options; **`exclude`: `legacy/**`\*\* (Phase 1.5)                                                              |
| `.gitignore`                                                              | Added `.next`                                                                                                                         |
| `components.json`                                                         | `tailwind.css` → `src/app/globals.css`; `rsc`: true                                                                                   |
| `src/styles.css`                                                          | Header comment noting migration to `globals.css`                                                                                      | **Superseded:** archived as `legacy/tanstack-vite/styles.css.reference` (Phase 1.5) |
| `vite.config.ts`                                                          | Top comment: legacy, not used by Next build                                                                                           | **Superseded:** archived under `legacy/tanstack-vite/` (Phase 1.5)                  |
| `wrangler.jsonc`                                                          | Top comment: legacy Cloudflare / TanStack Start                                                                                       | **Superseded:** archived under `legacy/tanstack-vite/` (Phase 1.5)                  |
| `eslint.config.js`                                                        | **Removed** (replaced by `eslint.config.mjs`)                                                                                         |
| Legacy `src/routes/**`, `src/components/SiteLayout.tsx`, `src/router.tsx` | Prettier-only formatting when running format across `src/`                                                                            |

---

## Route Mapping

| Current Route        | Old File                                      | New Next.js File                     | Status   |
| -------------------- | --------------------------------------------- | ------------------------------------ | -------- |
| `/`                  | `src/routes/index.tsx`                        | `src/app/page.tsx`                   | Migrated |
| `/about`             | `src/routes/about.tsx`                        | `src/app/about/page.tsx`             | Migrated |
| `/research`          | `src/routes/research.tsx`                     | `src/app/research/page.tsx`          | Migrated |
| `/programs`          | `src/routes/programs.tsx`                     | `src/app/programs/page.tsx`          | Migrated |
| `/insights`          | `src/routes/insights.tsx`                     | `src/app/insights/page.tsx`          | Migrated |
| `/contact`           | `src/routes/contact.tsx`                      | `src/app/contact/page.tsx`           | Migrated |
| `/privacy`           | `src/routes/privacy.tsx`                      | `src/app/privacy/page.tsx`           | Migrated |
| `/terms`             | `src/routes/terms.tsx`                        | `src/app/terms/page.tsx`             | Migrated |
| `/where-deals-break` | `src/routes/where-deals-break.tsx`            | `src/app/where-deals-break/page.tsx` | Migrated |
| 404                  | `src/routes/__root.tsx` (`notFoundComponent`) | `src/app/not-found.tsx`              | Migrated |

---

## Components Ported

| Component     | Old Path                         | New Path                                     | Notes                                                            |
| ------------- | -------------------------------- | -------------------------------------------- | ---------------------------------------------------------------- |
| Site shell    | `src/components/SiteLayout.tsx`  | `src/components/site/SiteLayout.tsx`         | No `Outlet`; children only                                       |
| Header        | (inline in old `SiteLayout`)     | `src/components/site/Header.tsx`             | `"use client"` for `usePathname` active nav                      |
| Footer        | (inline)                         | `src/components/site/Footer.tsx`             | Server component; `next/link`                                    |
| PageHeader    | (exported from old `SiteLayout`) | `src/components/site/PageHeader.tsx`         | Server component                                                 |
| Contact form  | `src/routes/contact.tsx`         | `src/components/site/ContactInquiryForm.tsx` | `"use client"`; TODO for real backend                            |
| `cn`          | `src/lib/utils.ts`               | `src/lib/utils.ts`                           | Unchanged                                                        |
| shadcn `ui/*` | `src/components/ui/*`            | Same paths                                   | Not required by public pages today; kept for future admin/app UI |

---

## Styling Ported

- **Canonical stylesheet:** `src/app/globals.css` — Tailwind v4 `@import "tailwindcss" source(none)`, `@source` globs for `app/`, `components/`, and `hooks/`, `tw-animate-css`, `@theme` inline tokens, `:root` OKLCH palette, `@layer base` and `@layer components` (`.eyebrow`, `.prose-research`, `.rule`).
- **Legacy file:** `src/styles.css` retains the same token/CSS structure for diff reference, with a comment pointing to `globals.css`.
- **PostCSS:** `@tailwindcss/postcss` (replacing the old Vite Tailwind plugin).

---

## Metadata Ported

- **Root defaults** (`src/app/layout.tsx`): Same default **title**, **description**, **Open Graph**, and **Twitter** fields as the former `__root.tsx` `head.meta`, plus **`metadataBase`** from `siteConfig.url`, **`icons`** for `/favicon.png`, and **OG/Twitter images** from `siteConfig.openGraphImagePath` (first-party `/favicon.png` after Phase 1.5).
- **Per-page:** Each route uses **`buildPageMetadata({ title, description, path, openGraph? })`** for **canonical** (`alternates.canonical`), **OG** (`title`, `description`, `url`, `siteName`, `locale`, `type`, `images`), and **Twitter** (`card`, `title`, `description`, `images`).
- **`/where-deals-break`:** Passes **`openGraph.title`** and **`openGraph.description`** overrides to match the extra OG tags from the TanStack route (page `<title>` remains the shorter “Where Deals Break — …” string).

---

## Client Components

| File                                         | Reason                                        |
| -------------------------------------------- | --------------------------------------------- |
| `src/components/site/Header.tsx`             | `usePathname()` for active navigation styling |
| `src/components/site/ContactInquiryForm.tsx` | `useState` for mock form submission           |

All other public page modules are **Server Components** by default.

---

## Legacy TanStack / Vite sources (archived)

As of **Phase 1.5**, former `src/routes/**`, `src/router.tsx`, `src/routeTree.gen.ts`, root `vite.config.ts`, `wrangler.jsonc`, old `src/components/SiteLayout.tsx`, and related artifacts live under **`legacy/tanstack-vite/`** and are excluded from TypeScript and ESLint. See **`docs/phase-1-5-legacy-cleanup.md`** for the authoritative list.

---

## Build Status

- **`npm install`**: Succeeded (clean lockfile regenerated during migration).
- **`npm run build`**: **Passed** (Next.js 15.5.x; static generation for all public routes).
- **`npm run lint`**: **Passed** (`next lint`; note deprecation warning for Next 16 — migrate to ESLint CLI when upgrading).

---

## Known Issues / Follow-ups

1. **`next lint` deprecation:** Next.js 16 will drop `next lint`; plan migration to flat ESLint CLI per Next guidance.
2. **Privacy/terms copy in JSX:** Some punctuation uses HTML entities (`&quot;`, `&apos;`) where useful for linting; rendered text matches the prior site.
3. **Twitter metadata on `/where-deals-break`:** Next page metadata sets Twitter `title`/`description` from **`buildPageMetadata`** (page-level). The former TanStack child route did not override Twitter tags, so they may have inherited the **root** Twitter strings. If strict parity matters, add a one-off metadata tweak in a follow-up.
4. **Dedicated OG asset:** `openGraphImagePath` uses `/favicon.png` as a first-party placeholder; add **`public/og.png`** (e.g. 1200×630) when ready (see `siteConfig` TODO).

---

## Phase 2 Readiness

**Yes.** The Next.js public shell is stable, builds on Vercel-compatible commands (`npm run build` / `npm run start`), and contains **no Firebase, GHL, ZenithMind, or authenticated `/app` routes**. The codebase is ready to add **Firebase client/admin bootstrap**, env validation, and auth boundaries in Phase 2 without reworking the public layout.

---

## Vercel

- **Build command:** `npm run build`
- **Start command:** `npm run start`
- **Framework:** Next.js
- Set **`NEXT_PUBLIC_SITE_URL`** in the Vercel project (e.g. `https://salesbreakdowninstitute.com`) for correct canonical and absolute OG URLs.
