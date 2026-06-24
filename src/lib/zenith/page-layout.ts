import { isReservedTopLevelSlug, isValidSlug } from "@/lib/content/slug";
import { getPageRenderMode } from "@/lib/zenith/render-mode";
import type { ZenithPage, ZenithPageLayout } from "@/types/zenith-content";

/** Top-level marketing slug only: `/my-page`, not `/articles/my-page`. */
export function extractTopLevelMarketingSlug(pathname: string): string | null {
  const path = (pathname.split("?")[0] ?? "/").replace(/\/+$/, "") || "/";
  const segments = path.split("/").filter(Boolean);
  if (segments.length !== 1) {
    return null;
  }
  const slug = segments[0]!;
  if (!isValidSlug(slug) || isReservedTopLevelSlug(slug)) {
    return null;
  }
  return slug;
}

export function parseZenithPageLayout(
  raw: unknown,
  errors: string[],
  label: string,
): ZenithPageLayout | undefined {
  if (raw === undefined || raw === null) {
    return undefined;
  }
  if (typeof raw !== "object") {
    errors.push(`${label}: layout must be an object`);
    return undefined;
  }
  const o = raw as Record<string, unknown>;
  const layout: ZenithPageLayout = {};

  if (o.hideGlobalFooter !== undefined) {
    if (typeof o.hideGlobalFooter !== "boolean") {
      errors.push(`${label}: layout.hideGlobalFooter must be a boolean`);
    } else {
      layout.hideGlobalFooter = o.hideGlobalFooter;
    }
  }

  if (Object.keys(layout).length === 0) {
    return undefined;
  }
  return layout;
}

/** Global marketing footer is hidden only for html_snippet pages that opt out explicitly. */
export function shouldHideGlobalSiteFooter(
  page: Pick<ZenithPage, "renderMode" | "html" | "layout">,
): boolean {
  return getPageRenderMode(page) === "html_snippet" && page.layout?.hideGlobalFooter === true;
}
