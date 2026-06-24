/**
 * One-time or occasional bootstrap: promote configured super-user emails in Firestore.
 *
 * Run: `npm run bootstrap:super-users`
 *
 * Requires Firebase Admin env (same as Next server). Does not create Auth users.
 */
import { FieldValue } from "firebase-admin/firestore";

import { SUPER_ADMIN_ROLE } from "../src/lib/admin/roles";
import { SUPER_USER_EMAILS, normalizeEmail } from "../src/lib/admin/super-users";
import { ensureFirebaseAdmin } from "../src/lib/firebase/admin";

function isUserNotFound(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "auth/user-not-found"
  );
}

async function main() {
  const { adminAuth, adminDb } = ensureFirebaseAdmin();
  let hadUnexpectedError = false;

  for (const raw of SUPER_USER_EMAILS) {
    const email = normalizeEmail(raw);
    try {
      const userRecord = await adminAuth.getUserByEmail(email);
      const ref = adminDb.collection("users").doc(userRecord.uid);
      const snap = await ref.get();
      const existing = snap.data();

      if (!snap.exists) {
        await ref.set({
          uid: userRecord.uid,
          email,
          displayName: userRecord.displayName ?? null,
          photoURL: userRecord.photoURL ?? null,
          role: SUPER_ADMIN_ROLE,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
          lastLoginAt: FieldValue.serverTimestamp(),
        });
      } else {
        await ref.set(
          {
            uid: userRecord.uid,
            email,
            displayName: userRecord.displayName ?? existing?.displayName ?? null,
            photoURL: userRecord.photoURL ?? existing?.photoURL ?? null,
            role: SUPER_ADMIN_ROLE,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      }
      process.stdout.write(
        `bootstrap-super-users: updated Firestore users/${userRecord.uid} (${email})\n`,
      );
    } catch (err) {
      if (isUserNotFound(err)) {
        process.stdout.write(
          `bootstrap-super-users: no Firebase Auth user for ${email} yet — will become ${SUPER_ADMIN_ROLE} on first profile sync\n`,
        );
        continue;
      }
      hadUnexpectedError = true;
      const msg = err instanceof Error ? err.message : String(err);
      process.stderr.write(`bootstrap-super-users: error for ${email}: ${msg}\n`);
    }
  }

  if (hadUnexpectedError) {
    process.exitCode = 1;
  }
}

main().catch((e) => {
  const msg = e instanceof Error ? e.message : String(e);
  process.stderr.write(`bootstrap-super-users: fatal: ${msg}\n`);
  process.exit(1);
});
