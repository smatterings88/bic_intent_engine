# Phase 1.5 — Legacy Cleanup

## Findings classification (repo search)

| Finding                                                                                       | Class                    | Action                                                                |
| --------------------------------------------------------------------------------------------- | ------------------------ | --------------------------------------------------------------------- |
| `vite.config.ts`, `wrangler.jsonc`, `src/routes/**`, `src/router.tsx`, `src/routeTree.gen.ts` | **B** Safe to archive    | Moved to `legacy/tanstack-vite/`                                      |
| Old `src/components/SiteLayout.tsx`, `src/styles.css`, Bun lockfiles                          | **B** Safe to archive    | Moved to `legacy/tanstack-vite/`                                      |
| Lovable/R2 OG URL in `siteConfig`                                                             | **D** / **E**            | Replaced with first-party `/favicon.png`; TODO for dedicated `og.png` |
| `docs/phase-0-*` (TanStack/Vite narrative)                                                    | **C** Remain temporarily | Kept as historical audit                                              |
| `components.json` shadcn `$schema` URL                                                        | **C**                    | Normal upstream reference                                             |
| `.gitignore` entries (`.vinxi`, `.wrangler`, etc.)                                            | **C**                    | Harmless; optional later prune                                        |

---

## Summary

The repository is now **Next.js / Vercel–oriented** for production. TanStack Start, Vite, Lovable’s bundled TanStack config, Cloudflare Wrangler entrypoints, and the old `src/routes` tree were **moved** (not deleted) into **`legacy/tanstack-vite/`** so history remains available without participating in builds. TypeScript and ESLint **exclude `legacy/**`\*\*.

**OG / social preview:** The external **Lovable/R2** image URL was removed from active config. **`siteConfig.openGraphImagePath`** now points to the first-party **`/favicon.png`** (existing `public` asset). A dedicated **`public/og.png`** (e.g. 1200×630) remains a documented follow-up in `src/lib/site.ts`.

No public page **copy** or **layout** was intentionally changed; only archive moves, config cleanup, metadata image source, and documentation/comments were updated.

---

## Files Deleted

None. Everything formerly under active `src/` or repo root for the old runtime was **archived** under `legacy/tanstack-vite/` to satisfy the “prefer safe archival” constraint.

---

## Files Archived

| Original path                   | New path                                    |
| ------------------------------- | ------------------------------------------- |
| `src/routes/**`                 | `legacy/tanstack-vite/routes/**`            |
| `src/router.tsx`                | `legacy/tanstack-vite/router.tsx`           |
| `src/routeTree.gen.ts`          | `legacy/tanstack-vite/routeTree.gen.ts`     |
| `src/components/SiteLayout.tsx` | `legacy/tanstack-vite/SiteLayout.tsx`       |
| `vite.config.ts`                | `legacy/tanstack-vite/vite.config.ts`       |
| `wrangler.jsonc`                | `legacy/tanstack-vite/wrangler.jsonc`       |
| `src/styles.css`                | `legacy/tanstack-vite/styles.css.reference` |
| `bunfig.toml`                   | `legacy/tanstack-vite/bunfig.toml`          |
| `bun.lockb`                     | `legacy/tanstack-vite/bun.lockb`            |

**Added:** `legacy/tanstack-vite/README.md` describing the archive.

---

## Files Changed

| Path                                         | Change                                                                                                      |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `src/lib/site.ts`                            | Removed `legacyOpenGraphImageUrl`; added `openGraphImagePath: "/favicon.png"` + TODO for dedicated OG asset |
| `src/lib/build-metadata.ts`                  | OG/Twitter image URLs use `siteConfig.openGraphImagePath`; comment updated                                  |
| `src/app/layout.tsx`                         | Root metadata images use `openGraphImagePath`                                                               |
| `src/components/site/ContactInquiryForm.tsx` | Comment no longer references “TanStack” by name                                                             |
| `tsconfig.json`                              | Removed per-file TanStack excludes; **`exclude`: `legacy/**`\*\* only                                       |
| `eslint.config.mjs`                          | Replaced scattered legacy ignores with **`legacy/**`\*\*                                                    |
| `.prettierignore`                            | Replaced `routeTree.gen.ts` with **`legacy/tanstack-vite/**`\*\*                                            |
| `docs/phase-1-next-public-site-migration.md` | Phase 1.5 supersession notes (legacy archived, OG path, known issues trimmed)                               |
| `docs/phase-1-5-legacy-cleanup.md`           | This document                                                                                               |

**Historical docs unchanged:** `docs/phase-0-next-migration-audit.md` and `docs/phase-0-migration-inventory.json` still describe the pre-migration repo for audit traceability.

---

## Package Cleanup

**No `package.json` dependency changes** in Phase 1.5 — Phase 1 had already removed TanStack/Vite/Cloudflare/Lovable packages. Verified the active **`src/`** tree does not import those packages.

---

## Legacy References Remaining

| Location                                                      | Reference                                        | Why it remains                                                    |
| ------------------------------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------- |
| `docs/phase-0-*.md` / `docs/phase-0-migration-inventory.json` | TanStack, Vite, Lovable, R2, paths               | Historical audit record                                           |
| `docs/phase-1-next-public-site-migration.md`                  | TanStack, former paths in tables                 | Migration narrative; updated where Phase 1.5 supersedes           |
| `legacy/tanstack-vite/**`                                     | Full old stack                                   | Intentional archive (excluded from build/lint/tsc)                |
| `components.json`                                             | `"$schema": "https://ui.shadcn.com/schema.json"` | Upstream shadcn schema URL (not Lovable)                          |
| `.gitignore`                                                  | `.output`, `.vinxi`, `.wrangler`, `dist`         | Harmless leftovers from old deploy tooling; optional manual prune |

---

## OG Image / Asset Notes

- **Replaced** the Lovable/R2 absolute URL in **runtime** metadata with **`/favicon.png`** (resolved via `metadataBase` in Next).
- **TODO:** Add **`public/og.png`** (recommended 1200×630) and set `siteConfig.openGraphImagePath` to `/og.png` when a designed asset exists.

---

## Route Verification

All **nine** public App Router routes remain:

| Route                | File                                 |
| -------------------- | ------------------------------------ |
| `/`                  | `src/app/page.tsx`                   |
| `/about`             | `src/app/about/page.tsx`             |
| `/research`          | `src/app/research/page.tsx`          |
| `/programs`          | `src/app/programs/page.tsx`          |
| `/insights`          | `src/app/insights/page.tsx`          |
| `/contact`           | `src/app/contact/page.tsx`           |
| `/privacy`           | `src/app/privacy/page.tsx`           |
| `/terms`             | `src/app/terms/page.tsx`             |
| `/where-deals-break` | `src/app/where-deals-break/page.tsx` |

`src/app/not-found.tsx` unchanged.

---

## Build Status

- **`npm run build`:** **Passed** (Next.js 15.5.x; all public routes static).
- **`npm run lint`:** **Passed** with no ESLint errors. **`next lint` is deprecated** in favor of the ESLint CLI in Next.js 16 — migrate when upgrading (known, non-blocking).

---

## Phase 2 Readiness

**Yes.** The tree is free of active TanStack/Vite/Wrangler config paths, OG defaults are first-party, and the Next app surface is unchanged for users. **Firebase** foundation can begin in Phase 2 without first undoing legacy runtime clutter.
