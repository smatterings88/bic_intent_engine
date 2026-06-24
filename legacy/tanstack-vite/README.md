# Archived TanStack Start / Vite / Cloudflare workspace

This folder holds the **pre–Phase 1.5** application shell that powered the site before the **Next.js App Router** migration.

**Contents (not built or typechecked by the current repo):**

- `routes/` — former `src/routes/**` (TanStack Router file routes, including `__root.tsx`)
- `router.tsx`, `routeTree.gen.ts` — TanStack Router wiring
- `SiteLayout.tsx` — former `src/components/SiteLayout.tsx` (TanStack `Link` / `Outlet`)
- `vite.config.ts` — `@lovable.dev/vite-tanstack-config` entry (requires removed npm packages to run)
- `wrangler.jsonc` — Cloudflare Workers config for TanStack Start
- `styles.css.reference` — duplicate of the old global CSS (live styles are `src/app/globals.css`)
- `bunfig.toml`, `bun.lockb` — optional Bun lockfiles from the earlier workflow

**Do not import from here** in the Next.js app. Keep for historical diff only; safe to delete after a retention policy if desired.
