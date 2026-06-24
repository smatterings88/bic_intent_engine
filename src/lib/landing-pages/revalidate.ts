import "server-only";

import { revalidatePath } from "next/cache";

/** Invalidate public landing ISR + sitemap after admin content changes. */
export function revalidateLandingPagePublicPaths(slug: string): void {
  revalidatePath(`/${slug}`);
  revalidatePath("/sitemap.xml");
  // TODO: revalidate a dedicated landing page index route if one is added later.
}
