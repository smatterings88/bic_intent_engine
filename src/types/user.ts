export type UserRole = "user" | "admin" | "super_admin";

export type UserProfile = {
  uid: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
  role: UserRole;
  createdAt: unknown;
  updatedAt: unknown;
  lastLoginAt?: unknown;
};
