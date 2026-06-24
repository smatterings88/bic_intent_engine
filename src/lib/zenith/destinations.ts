import type { ZenithPage } from "@/types/zenith-content";

export type CtaDestinationKind = "call-upload" | "lead-magnet" | "webinar" | "contact" | "unknown";

export function resolveCtaDestination(destination: string): {
  kind: CtaDestinationKind;
  id?: string;
} {
  const d = destination.trim();
  if (d === "call-upload") {
    return { kind: "call-upload" };
  }
  if (d === "contact-inbox") {
    return { kind: "contact" };
  }
  const lm = /^lead-magnet:([a-z0-9-]+)$/i.exec(d);
  if (lm) {
    return { kind: "lead-magnet", id: lm[1].toLowerCase() };
  }
  const wb = /^webinar:([a-z0-9-]+)$/i.exec(d);
  if (wb) {
    return { kind: "webinar", id: wb[1].toLowerCase() };
  }
  return { kind: "unknown" };
}

export function getZenithFormAnchorId(destination: string): string {
  const safe =
    destination
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "form";
  return `zenith-form-${safe}`;
}

/**
 * Client-safe href resolver for Zenith CTA destinations (mirrors server registry in forms.ts).
 */
export function getHrefForZenithDestination(
  destination: string,
  page?: Pick<ZenithPage, "slug" | "components">,
): string {
  const d = destination.trim();
  if (!d) return "#";

  const hasLeadFormWithDestination =
    page?.components?.some(
      (c) => c.type === "lead-form" && "destination" in c && c.destination === d,
    ) ?? false;
  if (hasLeadFormWithDestination) {
    return `#${getZenithFormAnchorId(d)}`;
  }

  if (d === "call-upload") {
    const demo = process.env.NEXT_PUBLIC_SHERPA_DEMO_URL?.trim();
    return demo && demo.length > 0 ? demo : "/app";
  }
  if (d === "contact-inbox") {
    return "/contact";
  }
  const lm = /^lead-magnet:([a-z0-9-]+)$/i.exec(d);
  if (lm) {
    return `/guides/${lm[1]}`;
  }
  const wb = /^webinar:([a-z0-9-]+)$/i.exec(d);
  if (wb) {
    return `/webinars/${wb[1]}`;
  }
  return "#";
}
