# Phase 8.5 — Super User Bootstrap

## Summary

Three **configured email addresses** are treated as **`super_admin`** in Firestore **`users/{uid}`** once their Firebase Auth account exists and profile sync (or the manual bootstrap script) runs. This is **server-side** configuration only: admin API routes **still** verify `users/{uid}.role` after verifying the ID token; nothing trusts the browser alone.

---

## Super User Emails

These addresses are normalized (trim, lowercase) before comparison:

- `mgzobel@icloud.com`
- `kenergizer@mac.com`
- `katlinzobel@icloud.com`

Source of truth: `SUPER_USER_EMAILS` in `src/lib/admin/super-users.ts`.

---

## Files Created

| Path                                     | Purpose                                                                        |
| ---------------------------------------- | ------------------------------------------------------------------------------ |
| `src/lib/admin/super-users.ts`           | `SUPER_USER_EMAILS`, `normalizeEmail`, `isConfiguredSuperUserEmail`            |
| `scripts/bootstrap-super-users.ts`       | Optional Admin SDK script to upsert Firestore profiles for existing Auth users |
| `docs/phase-8-5-super-user-bootstrap.md` | This document                                                                  |

---

## Files Changed

| Path                                   | Change                                                                           |
| -------------------------------------- | -------------------------------------------------------------------------------- |
| `src/lib/admin/roles.ts`               | Export `SUPER_ADMIN_ROLE`; `isAdminRole` uses it                                 |
| `src/lib/firebase/users.ts`            | New users and sync upgrades for configured emails → `super_admin`; no downgrades |
| `package.json`                         | `bootstrap:super-users` script                                                   |
| `docs/phase-5-admin-review-publish.md` | Short pointer to Phase 8.5                                                       |

---

## Runtime Behavior

- **First profile creation** (`createUserProfileIfMissing` when `users/{uid}` is missing): if the Auth email matches a configured super user → **`role: "super_admin"`**; otherwise **`role: "user"`**.
- **Existing profile on sign-in sync**: if the email is a configured super user and **`role` is not already `super_admin`** → set **`role`** to **`super_admin`** (upgrades **`user`** or **`admin`** for those emails only). Existing **`super_admin`** profiles only get email / displayName / timestamp updates, not a role downgrade.
- **Other users**: default remains **`user`**; existing **`admin`** (non–super-user list) is unchanged except for email/displayName/login timestamps.

`syncUserProfileAfterAuth` in `src/lib/firebase/auth-actions.ts` already calls `createUserProfileIfMissing` then `updateUserLastLogin`, so **no auth-action code change was required** beyond the user helper.

---

## Manual Bootstrap Script

```bash
npm run bootstrap:super-users
```

- Requires the **same Firebase Admin environment variables** as the Next.js server (`getServerFirebaseConfig` / `ensureFirebaseAdmin`).
- For each configured email: looks up **Firebase Auth** by email; if found, **creates or merges** **`users/{uid}`** with **`role: "super_admin"`** and Auth-derived **email**, **displayName**, **photoURL**.
- **Does not** create Firebase Auth accounts; if no Auth user exists yet, the script logs that promotion will happen on **first profile sync** after they sign up/sign in.
- **Does not** print private keys or raw env secrets.
- **Per-email `auth/user-not-found`**: logs and continues; other errors are logged and set **exit code 1** after the loop if any occurred.

---

## Security Notes

- Admin **mutations and list APIs** still use **`assertCurrentUserIsAdmin`**: verify **Bearer ID token**, load **`users/{uid}`**, require **`admin`** or **`super_admin`**.
- Super-user bootstrap only **sets** Firestore data; it does **not** bypass Auth or token checks.
- Email matching is **case-insensitive** after trim.
- **Client UI** must not be the only gate for privileged actions (unchanged).

---

## How To Verify

1. Ensure Firebase Admin env vars are set locally (see `.env.example` / deployment docs).
2. Optionally run `npm run bootstrap:super-users` (or rely on next sign-in).
3. In Firestore, open **`users/{uid}`** for a listed email and confirm **`role`** is **`super_admin`**.
4. Sign in as that user and open **`/app/admin`** — admin tables and actions should load.

---

## What This Phase Does Not Implement

- GHL, lead capture, uploads, breakdowns, or new public content routes.

---

## Phase 9 Readiness

After super users are present in Auth + Firestore (via script and/or login sync), **Phase 9** (GHL / opt-in) can proceed on top of the same admin and content model.
