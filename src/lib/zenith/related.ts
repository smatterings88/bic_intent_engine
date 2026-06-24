import "server-only";

import { getPublishedZenithPageBySlug } from "@/lib/zenith/firestore";
import { getPublicPathForZenithPage } from "@/lib/zenith/routes";
import type { ZenithContentType } from "@/types/zenith-content";

export type RelatedZenithCard = {
  slug: string;
  title: string;
  description?: string;
  contentType: ZenithContentType;
  publicUrl: string;
};

const RELATED_TYPES: ZenithContentType[] = ["article", "research_page", "landing_page"];

export async function getRelatedPublishedZenithPages(
  slugs: string[],
): Promise<RelatedZenithCard[]> {
  const out: RelatedZenithCard[] = [];
  for (const raw of slugs) {
    const slug = raw?.trim();
    if (!slug) continue;
    try {
      const page = await getPublishedZenithPageBySlug(slug);
      if (!page || !RELATED_TYPES.includes(page.contentType)) continue;
      const publicPath = getPublicPathForZenithPage(page);
      out.push({
        slug: page.slug,
        title: page.title?.trim() || page.seo?.metaTitle?.trim() || page.slug,
        description: page.seo?.metaDescription?.trim() || page.seo?.ogDescription?.trim(),
        contentType: page.contentType,
        publicUrl: publicPath,
      });
    } catch {
      /* ignore */
    }
  }
  return out;
}
