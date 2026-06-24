import "server-only";

import { revalidatePath } from "next/cache";

/** Invalidate public article ISR + sitemap after admin content changes. */
export function revalidateArticlePublicPaths(slug: string): void {
  revalidatePath(`/articles/${slug}`);
  revalidatePath("/articles");
  revalidatePath("/sitemap.xml");
}
