import { siteConfig } from "@/lib/site";
import { getOgImageUrlForPage } from "@/lib/zenith/og";
import { buildAbsoluteUrl, getBaseUrl, getCanonicalPathForZenithPage } from "@/lib/zenith/routes";
import type { ZenithComponent, ZenithPage } from "@/types/zenith-content";

const ORG_NAME = siteConfig.name;
const ORG_URL = siteConfig.url;

function orgSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: ORG_NAME,
    url: ORG_URL,
  };
}

function webPageSchema(page: ZenithPage, canonicalUrl: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title ?? page.seo?.metaTitle,
    description: page.seo?.metaDescription ?? page.seo?.ogDescription,
    url: canonicalUrl,
    isPartOf: { "@type": "WebSite", name: ORG_NAME, url: ORG_URL },
  };
}

function breadcrumbSchema(path: string): Record<string, unknown> {
  const segments = path.split("/").filter(Boolean);
  const items = segments.map((seg, i) => {
    const p = `/${segments.slice(0, i + 1).join("/")}`;
    return {
      "@type": "ListItem",
      position: i + 1,
      name: seg.replace(/-/g, " "),
      item: buildAbsoluteUrl(p),
    };
  });
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}

function faqFromComponents(components: ZenithComponent[]): Record<string, unknown> | null {
  const faqs = components
    .filter((c): c is Extract<ZenithComponent, { type: "faq-section" }> => c.type === "faq-section")
    .flatMap((c) => c.faqs ?? []);
  if (!faqs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

function eventFromPage(page: ZenithPage, canonicalUrl: string): Record<string, unknown> | null {
  if (page.contentType !== "webinar_page") return null;
  const urgency = page.components.find(
    (c): c is Extract<ZenithComponent, { type: "webinar-urgency-block" }> =>
      c.type === "webinar-urgency-block",
  );
  const start = urgency?.eventDate?.trim();
  if (!start) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: page.title ?? page.seo?.metaTitle,
    description: page.seo?.metaDescription,
    startDate: start,
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    url: canonicalUrl,
    organizer: { "@type": "Organization", name: ORG_NAME, url: ORG_URL },
  };
}

export function buildZenithJsonLd(page: ZenithPage, baseUrl?: string): Record<string, unknown>[] {
  const base = baseUrl ?? getBaseUrl();
  const path = getCanonicalPathForZenithPage(page);
  const canonicalUrl = buildAbsoluteUrl(path);
  const ogUrl = getOgImageUrlForPage(page, base);
  const out: Record<string, unknown>[] = [orgSchema(), webPageSchema(page, canonicalUrl)];
  if (path.length > 1) {
    out.push(breadcrumbSchema(path));
  }

  if (page.contentType === "article") {
    out.push({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: page.title ?? page.seo?.metaTitle,
      description: page.seo?.metaDescription ?? page.seo?.ogDescription,
      image: ogUrl,
      mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
      publisher: { "@type": "Organization", name: ORG_NAME },
      url: canonicalUrl,
    });
  }

  if (page.contentType === "research_page") {
    out.push({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: page.title ?? page.seo?.metaTitle,
      description: page.seo?.metaDescription,
      url: canonicalUrl,
      publisher: { "@type": "Organization", name: ORG_NAME },
    });
  }

  const faq = faqFromComponents(page.components);
  if (faq) out.push(faq);

  const ev = eventFromPage(page, canonicalUrl);
  if (ev) out.push(ev);

  return out;
}
