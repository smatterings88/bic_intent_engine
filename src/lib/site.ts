/**
 * Central site configuration for URLs, branding, and default SEO strings.
 * Used by Next.js metadata (see app/layout.tsx and per-route metadata).
 */
export const siteConfig = {
  name: "Business Impact Canada",
  tagline: "Communicate Clearly. Build Something That Matters.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://businessimpactcanada.com",
  /** Default description (root layout); some pages override via metadata. */
  description:
    "Free communication education for entrepreneurs who are ready to make the impact they came here to make. Nonprofit-backed, always free.",
  /**
   * First-party default for Open Graph / Twitter preview images (served from `public/`).
   * TODO: Add a dedicated 1200×630 `public/og.png` when a designed asset is ready.
   */
  openGraphImagePath: "/favicon.png" as const,
} as const;
