# Phase 2 — Firebase Foundation

## Summary

This phase adds **Firebase Auth (email/password)**, **Firestore** user profiles (`users/{uid}`), **Firebase Storage** bootstrap (Admin + client SDK), **Firebase Admin SDK** for server-side profile sync, **Zod-backed env validation** (lazy, so **public marketing pages still build without Firebase env**), and a minimal **`/app/*` authenticated shell** (login, dashboard, account) that does **not** wrap the public marketing site.

The marketing site was moved under the **`(marketing)`** route group so **`SiteLayout`** (public header/footer) only wraps public pages; **`/app`** uses a separate **`AppShell`** with its own header.

No GHL, ZenithMind, articles, landing pages, uploads, or breakdown features were added.

---

## Files Created

| Path                                     | Purpose                                                                                               |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `src/lib/env.ts`                         | Zod validation for public vs server Firebase env (called only when Firebase is used)                  |
| `src/lib/firebase/client.ts`             | Browser Firebase app / Auth / Firestore / Storage (lazy `ensureFirebaseClient`, `firebase` namespace) |
| `src/lib/firebase/admin.ts`              | Server-only Admin SDK (`server-only`, lazy `ensureFirebaseAdmin`, `admin` namespace)                  |
| `src/lib/firebase/users.ts`              | Firestore helpers: `getUserProfile`, `createUserProfileIfMissing`, `updateUserLastLogin`              |
| `src/lib/firebase/auth-actions.ts`       | Server action `syncUserProfileAfterAuth`                                                              |
| `src/types/user.ts`                      | `UserRole`, `UserProfile`                                                                             |
| `src/types/content.ts`                   | Placeholder `ArticleStatus`, `ContentSource`                                                          |
| `src/components/auth/AuthProvider.tsx`   | Client auth context + `useAuth()`                                                                     |
| `src/components/auth/LoginForm.tsx`      | Email/password sign-in & sign-up                                                                      |
| `src/components/app/AppShell.tsx`        | Protected chrome, redirect to login, sign out                                                         |
| `src/components/app/DashboardClient.tsx` | Signed-in email on dashboard                                                                          |
| `src/components/app/AccountClient.tsx`   | Account placeholders                                                                                  |
| `src/app/(marketing)/layout.tsx`         | Wraps marketing routes with `SiteLayout`                                                              |
| `src/app/app/layout.tsx`                 | `AuthProvider` + `AppShell`; `metadata.robots` noindex                                                |
| `src/app/app/login/page.tsx`             | Login page                                                                                            |
| `src/app/app/dashboard/page.tsx`         | Dashboard placeholder                                                                                 |
| `src/app/app/account/page.tsx`           | Account placeholder                                                                                   |
| `firestore.rules`                        | Starter Firestore security rules                                                                      |
| `storage.rules`                          | Starter Storage security rules                                                                        |
| `docs/phase-2-firebase-foundation.md`    | This document                                                                                         |

---

## Files Changed

| Path                                 | Change                                                                               |
| ------------------------------------ | ------------------------------------------------------------------------------------ |
| `package.json` / `package-lock.json` | Added `firebase`, `firebase-admin` (`zod` already present)                           |
| `.env.example`                       | Firebase client + server + optional App Check variables                              |
| `src/app/layout.tsx`                 | Root layout no longer wraps all pages in `SiteLayout` (marketing group handles that) |
| `src/app/not-found.tsx`              | Wraps 404 content in `SiteLayout` so global 404 keeps public chrome                  |
| Public pages                         | Moved under `src/app/(marketing)/` (URLs unchanged: `/`, `/about`, …)                |

---

## Dependencies Added

- **`firebase`** — Web SDK (Auth, Firestore client, Storage client)
- **`firebase-admin`** — Admin SDK (Auth verify, Firestore writes, Storage admin)

**`zod`** — Already in the project; used by `src/lib/env.ts`.

---

## Environment Variables

See **`.env.example`**. Summary:

**Client (`NEXT_PUBLIC_*`):** `API_KEY`, `AUTH_DOMAIN`, `PROJECT_ID`, `STORAGE_BUCKET`, `MESSAGING_SENDER_ID`, `APP_ID`  
**Optional:** `NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY`  
**Server only:** `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (use `\n` escapes in `.env`; code replaces `\\n` with real newlines)

---

## Firebase Services Needed

| Service                     | Used in Phase 2                                      |
| --------------------------- | ---------------------------------------------------- |
| **Firebase Authentication** | Email / password sign-in & registration              |
| **Cloud Firestore**         | `users/{uid}` profiles (client rules + Admin writes) |
| **Cloud Storage**           | SDK bootstrapped; rules stub `userUploads/{uid}/**`  |
| **Firebase Admin**          | Server action profile sync                           |

---

## Firebase Console Setup Steps

1. **Create a Firebase project** (or use an existing one) in the [Firebase console](https://console.firebase.google.com/).
2. **Register a Web app** and copy the **client** config into `NEXT_PUBLIC_*` variables.
3. **Authentication → Sign-in method** — Enable **Email/Password**.
4. **Firestore** — Create database (production mode is fine once rules are deployed); deploy **`firestore.rules`** when ready.
5. **Storage** — Enable default bucket; deploy **`storage.rules`** when ready.
6. **Project settings → Service accounts** — Generate a new private key JSON; map `project_id`, `client_email`, `private_key` to `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (paste private key as one line with `\n` for newlines).
7. **Local:** Copy `.env.example` → `.env.local` and fill values.
8. **Vercel:** Add the same env vars in the project **Environment Variables** (use separate Preview/Production scopes as needed).
9. **CI / builds:** Marketing pages build **without** these vars; `/app` features need **both** client and **server** vars for sign-in + profile sync to succeed end-to-end.

---

## App Routes Added

| Route            | File                             |
| ---------------- | -------------------------------- |
| `/app/login`     | `src/app/app/login/page.tsx`     |
| `/app/dashboard` | `src/app/app/dashboard/page.tsx` |
| `/app/account`   | `src/app/app/account/page.tsx`   |

All use `src/app/app/layout.tsx` (`AuthProvider` + `AppShell`). Login is excluded from the authenticated chrome; other `/app/*` routes (extensible later) get the shell after sign-in.

---

## Security Rules Added

- **`firestore.rules`** — Users may **read/create/update** only their own `users/{userId}` document; **no delete**; default **deny** elsewhere (TODOs for future collections).
- **`storage.rules`** — Signed-in users may read/write **`userUploads/{userId}/**`** only; default **deny\*\* elsewhere (TODO for transcripts, etc.).

Deploy with Firebase CLI (`firebase deploy --only firestore:rules,storage`) when the Firebase project is linked.

---

## Known Issues

1. **Profile sync** requires **server** Firebase env on Vercel/local; if only client vars are set, users can still authenticate but **`syncUserProfileAfterAuth`** will fail until Admin credentials are configured.
2. **`next lint` deprecation** (Next 16) — unchanged from earlier phases; migrate to ESLint CLI when upgrading.
3. **No email verification / password reset** — intentionally deferred.
4. **OG / marketing** — unchanged from Phase 1.5.

---

## Phase 3 Readiness

The repo is ready for **content pipeline** work (e.g. ZenithMind ingestion, article models, ISR routes) on top of Firestore types in `src/types/content.ts` and expanded security rules, without reworking the Auth/App shell added here.

---

## Build / lint

Run **`npm run build`** and **`npm run lint`** after wiring env locally; the default **marketing** app must **build without any Firebase variables** (verified in CI-style empty env).
