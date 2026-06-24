import "server-only";

import { revalidatePath, revalidateTag } from "next/cache";

import { getPublicPathForZenithPage } from "@/lib/zenith/routes";
import type { ZenithContentType, ZenithPage } from "@/types/zenith-content";

/** Invalidate ISR + OG + preview after Zenith page writes. */
export function revalidateZenithPagePaths(page: Pick<ZenithPage, "slug" | "contentType">): void {
  const slug = page.slug;
  const publicPath = getPublicPathForZenithPage(page);

  revalidatePath(publicPath, "page");
  revalidatePath(`/preview/${slug}`, "page");
  revalidatePath(`/api/og/${slug}`, "page");
  revalidateTag(`zenith-page:${slug}`);
  revalidatePath("/sitemap.xml");

  revalidateZenithListPaths(page.contentType);
}

function revalidateZenithListPaths(contentType: ZenithContentType): void {
  switch (contentType) {
    case "article":
      revalidatePath("/articles");
      break;
    case "lead_magnet_page":
      revalidatePath("/guides");
      break;
    case "webinar_page":
      revalidatePath("/webinars");
      break;
    case "cta_page":
      revalidatePath("/cta");
      break;
    case "research_page":
      revalidatePath("/research");
      break;
    default:
      break;
  }
}
