import "server-only";

import { getPublishedZenithPageBySlug } from "@/lib/zenith/firestore";
import { extractTopLevelMarketingSlug, shouldHideGlobalSiteFooter } from "@/lib/zenith/page-layout";

export { extractTopLevelMarketingSlug } from "@/lib/zenith/page-layout";

export async function resolveHideGlobalFooterForPathname(pathname: string): Promise<boolean> {
  const slug = extractTopLevelMarketingSlug(pathname);
  if (!slug) {
    return false;
  }
  const page = await getPublishedZenithPageBySlug(slug);
  if (!page) {
    return false;
  }
  return shouldHideGlobalSiteFooter(page);
}
