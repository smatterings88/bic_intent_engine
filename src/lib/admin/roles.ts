import type { UserRole } from "@/types/user";

export const SUPER_ADMIN_ROLE = "super_admin" as const satisfies UserRole;

export function isAdminRole(role: UserRole | string | undefined | null): boolean {
  return role === "admin" || role === SUPER_ADMIN_ROLE;
}

export function assertAdminRole(role: UserRole | string | undefined | null): void {
  if (!isAdminRole(role)) {
    throw new Error("Admin role required");
  }
}
