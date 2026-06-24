import "server-only";

import { FieldValue, type DocumentData } from "firebase-admin/firestore";
import { SUPER_ADMIN_ROLE } from "@/lib/admin/roles";
import { isConfiguredSuperUserEmail } from "@/lib/admin/super-users";
import { ensureFirebaseAdmin } from "@/lib/firebase/admin";
import type { UserProfile, UserRole } from "@/types/user";

function mapDoc(uid: string, data: DocumentData): UserProfile {
  return {
    uid,
    email: typeof data.email === "string" ? data.email : "",
    displayName: data.displayName ?? null,
    photoURL: data.photoURL ?? null,
    role: (data.role as UserRole) ?? "user",
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    lastLoginAt: data.lastLoginAt,
  };
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const { adminDb } = ensureFirebaseAdmin();
  const snap = await adminDb.collection("users").doc(uid).get();
  if (!snap.exists) {
    return null;
  }
  return mapDoc(uid, snap.data() ?? {});
}

export async function createUserProfileIfMissing(args: {
  uid: string;
  email: string;
  displayName?: string | null;
}): Promise<void> {
  const { adminDb } = ensureFirebaseAdmin();
  const ref = adminDb.collection("users").doc(args.uid);
  const snap = await ref.get();
  const superUser = isConfiguredSuperUserEmail(args.email);

  if (!snap.exists) {
    const initialRole = superUser ? SUPER_ADMIN_ROLE : ("user" satisfies UserRole);
    await ref.set({
      uid: args.uid,
      email: args.email,
      displayName: args.displayName ?? null,
      photoURL: null,
      role: initialRole,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      lastLoginAt: FieldValue.serverTimestamp(),
    });
    return;
  }

  const existing = snap.data();
  const role = (existing?.role as UserRole | undefined) ?? "user";

  if (role === SUPER_ADMIN_ROLE) {
    await ref.set(
      {
        email: args.email,
        displayName: args.displayName ?? existing?.displayName ?? null,
        updatedAt: FieldValue.serverTimestamp(),
        lastLoginAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    return;
  }

  if (superUser) {
    await ref.set(
      {
        email: args.email,
        displayName: args.displayName ?? existing?.displayName ?? null,
        role: SUPER_ADMIN_ROLE,
        updatedAt: FieldValue.serverTimestamp(),
        lastLoginAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    return;
  }

  if (role === "admin") {
    await ref.set(
      {
        email: args.email,
        displayName: args.displayName ?? existing?.displayName ?? null,
        updatedAt: FieldValue.serverTimestamp(),
        lastLoginAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    return;
  }

  await ref.set(
    {
      email: args.email,
      displayName: args.displayName ?? existing?.displayName ?? null,
      updatedAt: FieldValue.serverTimestamp(),
      lastLoginAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

export async function updateUserLastLogin(uid: string): Promise<void> {
  const { adminDb } = ensureFirebaseAdmin();
  await adminDb.collection("users").doc(uid).set(
    {
      lastLoginAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}
