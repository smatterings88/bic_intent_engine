import { absoluteUrl } from "@/lib/build-metadata";
import { siteConfig } from "@/lib/site";
import type { LandingPage } from "@/types/landing-page";

function landingPageUrl(landingPage: LandingPage): string {
  const path = landingPage.seo.canonicalPath.startsWith("/")
    ? landingPage.seo.canonicalPath
    : `/${landingPage.seo.canonicalPath}`;
  return absoluteUrl(path);
}

function iso(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function jsonLdType(landingPage: LandingPage): string {
  if (landingPage.schema.type === "Article") {
    return "Article";
  }
  return "WebPage";
}

export function buildLandingPageJsonLd(landingPage: LandingPage): Record<string, unknown> {
  const url = landingPageUrl(landingPage);
  const schemaType = jsonLdType(landingPage);
  const publisher = {
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url.replace(/\/$/, ""),
  };
  const name = landingPage.hero.headline;
  const out: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": schemaType,
    name,
    headline: name,
    description: landingPage.seo.metaDescription,
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    publisher,
  };
  const pub = iso(landingPage.publishedAt);
  const mod = iso(landingPage.updatedAt);
  if (pub) out.datePublished = pub;
  if (mod) out.dateModified = mod;
  return out;
}

export function buildLandingPageFaqJsonLd(
  landingPage: LandingPage,
): Record<string, unknown> | null {
  const faqs = landingPage.aeo?.faqs;
  if (!faqs?.length) {
    return null;
  }
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}

export function buildLandingPageBreadcrumbJsonLd(
  landingPage: LandingPage,
): Record<string, unknown> {
  const home = siteConfig.url.replace(/\/$/, "");
  const self = landingPageUrl(landingPage);
  const label = landingPage.hero.headline;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${home}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: label,
        item: self,
      },
    ],
  };
}
