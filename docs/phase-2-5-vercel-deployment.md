# Phase 2.5 — Vercel Deployment

## Summary

This phase prepares the **Sales Breakdown Institute** Next.js app (public marketing site + Firebase-backed `/app` shell) for **first deployment on Vercel** before Phase 3 content-engine work. No new product features were added: only deployment verification, optional root `README.md`, and this documentation.

The marketing site **builds without Firebase environment variables** (`getPublicFirebaseConfig` / `getServerFirebaseConfig` run only when Firebase helpers are invoked). On Vercel, set all listed variables so `/app/login`, profile sync, and Admin-backed paths work in the environments where you test them.

---

## Current Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4 (PostCSS)
- Vercel (target hosting; framework auto-detected)
- Firebase Auth, Firestore, Storage (client + Admin SDK)
- Marketing routes under `src/app/(marketing)`; authenticated app under `src/app/app`

---

## Files Changed

| Path                                  | Change                                                                        |
| ------------------------------------- | ----------------------------------------------------------------------------- |
| `docs/phase-2-5-vercel-deployment.md` | **Created** — deployment steps, env vars, QA checklists                       |
| `README.md`                           | **Created** — minimal repo orientation (Next.js, Vercel, legacy archive path) |

**Verified, no edits required for deployment:**

- `package.json` — `dev` / `build` / `start` / `lint` use Next.js (`next build`, `next start`)
- `next.config.ts` — minimal Next config; no Vite/TanStack/Wrangler assumptions
- `tsconfig.json` — `exclude`: `legacy/**`
- `eslint.config.mjs` — ignores `legacy/**`
- `postcss.config.mjs` — Tailwind v4 PostCSS only
- `.env.example` — `NEXT_PUBLIC_SITE_URL` + Firebase client/server + optional App Check
- `src/lib/site.ts` — production URL from env with `https://salesbreakdowninstitute.com` fallback; OG/Twitter image path `/favicon.png`
- No root `vercel.json` — Vercel auto-detects Next.js (no override needed)

---

## Environment Variables for Vercel

Set these in the Vercel project (**Settings → Environment Variables**). Use **Production** (and **Preview** if you want auth working on preview URLs).

### Required (production canonical + Firebase client)

| Variable                                   | Example / note                                |
| ------------------------------------------ | --------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                     | `https://salesbreakdowninstitute.com`         |
| `NEXT_PUBLIC_FIREBASE_API_KEY`             | From Firebase Web app config                  |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`         | Typically `project-id.firebaseapp.com`        |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`          | Firebase project ID                           |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`      | Default bucket, e.g. `project-id.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | From Web app config                           |
| `NEXT_PUBLIC_FIREBASE_APP_ID`              | From Web app config                           |

### Required (server — profile sync / Admin SDK)

| Variable                | Note                                  |
| ----------------------- | ------------------------------------- |
| `FIREBASE_PROJECT_ID`   | Same project as client                |
| `FIREBASE_CLIENT_EMAIL` | Service account email                 |
| `FIREBASE_PRIVATE_KEY`  | Private key from service account JSON |

**`FIREBASE_PRIVATE_KEY` newline formatting:** Vercel and many hosts expect the key as a single line. If newlines were escaped in `.env`, use `\n` in the string; `src/lib/env.ts` applies `process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")` so those become real newlines before `firebase-admin` uses the key.

### Optional

| Variable                                  | Note                              |
| ----------------------------------------- | --------------------------------- |
| `NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY` | Reserved for App Check when wired |

Do **not** add GHL or ZenithMind variables in this phase.

---

## Vercel Project Settings

| Setting               | Value                                                           |
| --------------------- | --------------------------------------------------------------- |
| **Framework preset**  | Next.js (auto-detected on import)                               |
| **Build command**     | `npm run build` (default)                                       |
| **Install command**   | `npm install` (default)                                         |
| **Output directory**  | Leave default (do not override Next’s `.next` output)           |
| **Production branch** | `main`, unless your repo uses another default production branch |

---

## First Deploy Steps

1. Push the repository to GitHub (or Git provider Vercel supports).
2. Open [Vercel](https://vercel.com) and sign in.
3. **Add New… → Project** (or **New Project**).
4. **Import** the Git repository containing this app.
5. Confirm the **framework** is **Next.js** and root directory is the app root (where `package.json` lives).
6. Add **environment variables** (see tables above) for **Preview** and/or **Production** as needed.
7. Click **Deploy** and wait for the build to finish.
8. Open the generated **Vercel URL** (e.g. `*.vercel.app`).
9. Walk the **public route checklist** below.
10. Open **`/app/login`** and confirm the page loads (Firebase init errors only if client env is missing or wrong).
11. If Firebase Auth (Email/Password) is enabled, create a **test account** or sign in.
12. Confirm **`/app/dashboard`** redirects to **`/app/login`** when signed out.
13. After sign-in, confirm **`/app/dashboard`** and **`/app/account`** load.
14. In Vercel, attach **custom domain** `salesbreakdowninstitute.com` (and `www` if used) per your DNS plan.
15. Follow Vercel’s **DNS** instructions at your registrar until the domain verifies.
16. Confirm **SSL** is active for the custom domain in the Vercel dashboard.
17. Set **`NEXT_PUBLIC_SITE_URL`** to `https://salesbreakdowninstitute.com` for **Production** (adjust if you standardize on `www`).
18. **Redeploy** after changing production env or domain settings so all nodes pick up values.

---

## Route Verification Checklist

Public (marketing):

- [ ] `/`
- [ ] `/about`
- [ ] `/research`
- [ ] `/programs`
- [ ] `/insights`
- [ ] `/contact`
- [ ] `/privacy`
- [ ] `/terms`
- [ ] `/where-deals-break`

App (Firebase-dependent for full behavior):

- [ ] `/app/login`
- [ ] `/app/dashboard` (protected when signed out)
- [ ] `/app/account` (protected when signed out)

---

## Post-Deploy QA Checklist

- [ ] Homepage loads and matches expectations (no copy/layout redesign in this phase).
- [ ] Header navigation works between main sections.
- [ ] Footer links work (privacy, terms, contact, etc.).
- [ ] Public pages render **without** Firebase console errors when Firebase env is **not** required for static HTML (client-only Firebase runs in the browser on `/app` routes).
- [ ] **Metadata** title/description look correct in the tab and in “View source” / devtools.
- [ ] **Canonical** and OG URLs resolve to `https://salesbreakdowninstitute.com` (or your configured `NEXT_PUBLIC_SITE_URL`) when production env is set.
- [ ] **Mobile** layout: header, content, footer usable on a narrow viewport.
- [ ] **`/app/login`** loads; errors are clear if `NEXT_PUBLIC_*` Firebase vars are missing.
- [ ] **Email/password sign-up / sign-in** works when Firebase Auth and env vars are configured.
- [ ] **`/app/dashboard`** sends unauthenticated users to **`/app/login`**.
- [ ] Signed-in user can open **`/app/dashboard`** and **`/app/account`**.
- [ ] No **Lovable/R2** runtime image URLs in active metadata (`siteConfig.openGraphImagePath` is `/favicon.png`).
- [ ] **Public** pages: no unexpected console errors (third-party blockers aside).
- [ ] **Vercel build logs** are clean (no failed steps).

---

## Firebase Console Setup Reminder

Before or right after first deploy, in the [Firebase console](https://console.firebase.google.com/) for the same project as your env vars:

1. **Authentication → Sign-in method** — Enable **Email/Password**.
2. **Firestore** — Create the database; deploy **`firestore.rules`** from the repo (CLI or Console rules editor) when ready.
3. **Storage** — Enable default bucket; deploy **`storage.rules`** from the repo when ready.
4. **Authentication → Settings → Authorized domains** — Add:
   - `salesbreakdowninstitute.com` (and `www` if applicable)
   - Your **Vercel preview** host (e.g. `*.vercel.app`) if you test auth on previews

See **`docs/phase-2-firebase-foundation.md`** for local `.env.local` and service account mapping.

---

## Known Issues

1. **Profile sync** (`syncUserProfileAfterAuth`) requires **server** Firebase env on Vercel; without it, users may still sign in client-side but Firestore profile creation can fail until `FIREBASE_*` is set.
2. **`next lint` deprecation** — Next.js 15 may print that `next lint` will be removed in Next.js 16; migration to the ESLint CLI is a future housekeeping item (does not block deploy).

---

## Phase 3 Readiness

After Vercel deployment is verified (custom domain, SSL, `NEXT_PUBLIC_SITE_URL`, and Firebase rules/domains as needed), **Phase 3** can begin: content models, article/landing schemas, and related features **outside** this deployment-only phase.
