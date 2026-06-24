import type { ZenithContentType, ZenithPageStatus } from "@/types/zenith-content";

export function formatZenithStatus(status: ZenithPageStatus | string): string {
  if (status === "draft") return "Draft";
  if (status === "published") return "Published";
  return String(status || "Unknown");
}

export function formatZenithContentType(type: ZenithContentType | string): string {
  switch (type) {
    case "article":
      return "Article";
    case "landing_page":
      return "Landing";
    case "lead_magnet_page":
      return "Lead Magnet";
    case "webinar_page":
      return "Webinar";
    case "cta_page":
      return "CTA";
    case "research_page":
      return "Research";
    default:
      return String(type || "Unknown");
  }
}

export function getZenithAdminListPath(): string {
  return "/app/admin/zenith";
}

export function getZenithAdminDetailPath(slug: string): string {
  return `/app/admin/zenith/${encodeURIComponent(slug)}`;
}
