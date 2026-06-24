import "server-only";

import { ensureFirebaseAdmin } from "@/lib/firebase/admin";
import { getUserProfile } from "@/lib/firebase/users";
import type { UserProfile } from "@/types/user";
import { assertAdminRole, isAdminRole } from "@/lib/admin/roles";

export class AdminApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "AdminApiError";
  }
}

/**
 * Extract `Authorization: Bearer <token>` (Firebase ID token for signed-in user).
 */
export function getBearerIdToken(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice("Bearer ".length).trim();
  return token.length > 0 ? token : null;
}

export type AuthenticatedRequestUser = {
  uid: string;
  email?: string;
};

/**
 * Verifies Firebase ID token and returns uid/email claims.
 */
export async function getAuthenticatedUserFromRequest(
  request: Request,
): Promise<AuthenticatedRequestUser> {
  const token = getBearerIdToken(request);
  if (!token) {
    throw new AdminApiError(
      401,
      "Missing or invalid Authorization header (expected Bearer ID token)",
    );
  }
  try {
    const { adminAuth } = ensureFirebaseAdmin();
    const decoded = await adminAuth.verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email };
  } catch {
    throw new AdminApiError(401, "Invalid or expired ID token");
  }
}

export async function getUserProfileForAdminCheck(uid: string): Promise<UserProfile | null> {
  return getUserProfile(uid);
}

/**
 * Verifies ID token and ensures Firestore `users/{uid}.role` is admin or super_admin.
 */
export async function assertCurrentUserIsAdmin(request: Request): Promise<{
  uid: string;
  profile: UserProfile;
}> {
  const { uid } = await getAuthenticatedUserFromRequest(request);
  const profile = await getUserProfileForAdminCheck(uid);
  if (!profile) {
    throw new AdminApiError(403, "User profile not found");
  }
  if (!isAdminRole(profile.role)) {
    throw new AdminApiError(403, "Admin or super_admin role required");
  }
  assertAdminRole(profile.role);
  return { uid, profile };
}
