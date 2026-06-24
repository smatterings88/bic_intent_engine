import type { ZenithPage, ZenithPageRenderMode } from "@/types/zenith-content";

export function getPageRenderMode(
  page: Pick<ZenithPage, "renderMode" | "html">,
): ZenithPageRenderMode {
  const mode = page.renderMode;
  if (mode === "html_snippet" || mode === "hybrid" || mode === "components") {
    return mode;
  }
  if (page.html?.sanitizedBody?.trim() || page.html?.body?.trim()) {
    return "html_snippet";
  }
  return "components";
}

export function usesStructuredComponents(
  page: Pick<ZenithPage, "renderMode" | "components">,
): boolean {
  const mode = getPageRenderMode(page);
  return mode === "components" || mode === "hybrid";
}

export function usesHtmlRendering(page: Pick<ZenithPage, "renderMode" | "html">): boolean {
  const mode = getPageRenderMode(page);
  return mode === "html_snippet" || mode === "hybrid";
}

export function getRenderableHtml(page: Pick<ZenithPage, "html">): string | undefined {
  const html = page.html?.sanitizedBody?.trim() || page.html?.body?.trim();
  return html || undefined;
}
