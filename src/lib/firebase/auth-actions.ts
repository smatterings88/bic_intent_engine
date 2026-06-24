"use server";

import { createUserProfileIfMissing, updateUserLastLogin } from "@/lib/firebase/users";

/**
 * Ensure Firestore `users/{uid}` exists and refresh login timestamps.
 * Called from the client after successful Firebase Auth sign-in / sign-up.
 */
export async function syncUserProfileAfterAuth(
  uid: string,
  email: string,
  displayName?: string | null,
): Promise<void> {
  await createUserProfileIfMissing({ uid, email, displayName });
  await updateUserLastLogin(uid);
}
