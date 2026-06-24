# Sales Breakdown Institute — Next.js

Marketing site and authenticated **app shell** for the Sales Breakdown Institute, built with **Next.js** (App Router), **TypeScript**, **Tailwind CSS**, and **Firebase**. Deployed on **Vercel**.

Legacy **TanStack Start / Vite** sources are archived under **`legacy/tanstack-vite/`** and are excluded from the active Next.js build.

## Quick start

```bash
cp .env.example .env.local   # fill in Firebase, Zenith, GHL as needed
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Command | Description |
| --- | --- |
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm run start` | Run production build locally |
| `npm run lint` | ESLint (Next.js) |
| `npm run format` | Prettier |
| `npm run validate:content` | Validate content JSON schemas |
| `npm run validate:zenith-examples` | Validate Zenith example payloads |
| `npm run bootstrap:super-users` | Promote configured emails to admin in Firestore |
| `npm run ghl:diagnose` | Verify GHL PIT + location + API connectivity |

Deployment: **`docs/phase-2-5-vercel-deployment.md`**.

## Environment

Copy **`.env.example`** to **`.env.local`** (or set variables in Vercel). Required groups:

- **Public site:** `NEXT_PUBLIC_SITE_URL`, Firebase client config (`NEXT_PUBLIC_FIREBASE_*`)
- **Server:** Firebase Admin (`FIREBASE_*`), Zenith ingestion (`ZENITH_INGEST_SECRET` / `ZENITH_CONTENT_SECRET`)
- **Integrations:** GoHighLevel **Private Integration** + LeadConnector v2 (`GHL_PIT_TOKEN`, `GHL_LOCATION_ID`) — see `docs/GHL_API_Integration_Notes.md`
- **Analytics (optional):** `NEXT_PUBLIC_GTM_ID` (defaults to `GTM-KQHFRMK8` when unset)

## Architecture (high level)

- **Marketing routes** — ISR articles, landing pages, and Zenith-rendered pages (articles, guides, webinars, CTA, research, top-level landings).
- **App routes** (`/app/*`) — Firebase auth, dashboard, admin console (protected by Firestore `users/{uid}.role`).
- **ZenithMind** — Sends structured **Zenith Content v1.2** JSON; the app validates, stores in Firestore, and renders UI (no raw HTML/CSS from Zenith).
- **Admin** — Review, preview, publish/unpublish legacy content and Zenith pages; leads reporting and GHL retry.

## Public routes (Zenith)

Published Zenith pages are served at:

| `contentType` | URL |
| --- | --- |
| `article` | `/articles/[slug]` (legacy articles take precedence for the same slug) |
| `landing_page` | `/[slug]` (legacy landings first; reserved slugs excluded) |
| `lead_magnet_page` | `/guides/[slug]` |
| `webinar_page` | `/webinars/[slug]` |
| `cta_page` | `/cta/[slug]` |
| `research_page` | `/research/[slug]` |

- **Draft preview (admin):** `/preview/[slug]` — requires admin sign-in; always `noindex`.
- **OG images:** `/api/og/[slug]`

## Admin console

Sign in at **`/app/login`**, then:

| Area | URL |
| --- | --- |
| Overview | `/app/admin` |
| **Zenith pages** | `/app/admin/zenith` |
| Articles | `/app/admin/articles` |
| Landing pages | `/app/admin/landing-pages` |
| Lead magnets | `/app/admin/lead-magnets` |
| Leads | `/app/admin/leads` |
| Ingestions | `/app/admin/ingestions` |

Admin API for Zenith: `GET/POST` under **`/api/admin/zenith/pages`** (see Phase 11 docs).

## Zenith ingestion (API)

| Method | Path | Auth |
| --- | --- | --- |
| POST | `/api/zenith/content` | Zenith content secret |
| POST | `/api/zenith/content/bulk` | Zenith content secret |
| POST | `/api/zenith/forms/submit` | Public (validated; GHL server-side) |
| GET | `/api/content/pages/[slug]` | Public (published only) |

Ingestion always saves **`draft`** until an admin publishes.

## Analytics

**Google Tag Manager** is installed site-wide from the root layout (`GTM-KQHFRMK8` by default). Override with `NEXT_PUBLIC_GTM_ID`. Zenith CTAs expose `data-zenith-*` attributes for GTM triggers.

## Documentation

| Phase | Topic |
| --- | --- |
| [phase-11](docs/phase-11-zenith-content-system.md) | Zenith ingestion, Firestore, admin APIs, forms |
| [phase-12](docs/phase-12-zenith-visual-renderer.md) | Public renderer, routes, schema, lead forms |
| [phase-13](docs/phase-13-zenith-admin-ui.md) | Admin Zenith list/detail UI |
| [phase-2](docs/phase-2-firebase-foundation.md) | Firebase setup |
| [phase-2-5](docs/phase-2-5-vercel-deployment.md) | Vercel deployment |
| [phase-6](docs/phase-6-public-isr-articles.md) | Public articles (ISR) |
| [phase-8](docs/phase-8-public-isr-landing-pages.md) | Public landing pages |
| [phase-9](docs/phase-9-lead-magnet-opt-in-ghl-sync.md) | Opt-in + GHL |
| [phase-10](docs/phase-10-admin-lead-reporting.md) | Admin leads |

Earlier migration and content-model docs live under **`docs/phase-*.md`**.
