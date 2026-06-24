import { RESERVED_TOP_LEVEL_ROUTES } from "./constants";

/** Lowercase URL segment: letters, digits, single hyphens between tokens */
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isValidSlug(input: string): boolean {
  return input.length > 0 && SLUG_REGEX.test(input);
}

export function assertValidSlug(input: string): void {
  if (!isValidSlug(input)) {
    throw new Error(
      `Invalid slug: "${input}". Expected lowercase URL-friendly segments matching ${SLUG_REGEX}.`,
    );
  }
}

export function isReservedTopLevelSlug(input: string): boolean {
  const normalized = normalizeSlug(input);
  return (RESERVED_TOP_LEVEL_ROUTES as readonly string[]).includes(normalized);
}
