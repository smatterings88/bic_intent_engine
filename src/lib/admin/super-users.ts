/**
 * Bootstrap list: these Auth emails are promoted to `super_admin` in Firestore `users/{uid}`.
 * Not secret material; server-side only. Compare with {@link normalizeEmail}.
 */
export const SUPER_USER_EMAILS = [
  "mgzobel@icloud.com",
  "kenergizer@mac.com",
  "katlinzobel@icloud.com",
] as const;

const SUPER_USER_SET = new Set<string>(SUPER_USER_EMAILS);

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isConfiguredSuperUserEmail(email?: string | null): boolean {
  if (email == null || typeof email !== "string") {
    return false;
  }
  const normalized = normalizeEmail(email);
  if (!normalized) {
    return false;
  }
  return SUPER_USER_SET.has(normalized);
}
