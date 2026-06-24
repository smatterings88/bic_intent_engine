import type { Metadata } from "next";

import { absoluteUrl, defaultOpenGraphExtras } from "@/lib/build-metadata";
import { siteConfig } from "@/lib/site";
import type { LandingPage } from "@/types/landing-page";

function landingPageUrl(landingPage: LandingPage): string {
  const path = landingPage.seo.canonicalPath.startsWith("/")
    ? landingPage.seo.canonicalPath
    : `/${landingPage.seo.canonicalPath}`;
  return absoluteUrl(path);
}

export function buildLandingPageMetadata(landingPage: LandingPage): Metadata {
  const url = landingPageUrl(landingPage);
  const robots: Metadata["robots"] = landingPage.seo.noindex
    ? { index: false, follow: false }
    : { index: true, follow: true };

  return {
    metadataBase: new URL(siteConfig.url),
    title: landingPage.seo.metaTitle,
    description: landingPage.seo.metaDescription,
    alternates: {
      canonical: url,
    },
    robots,
    openGraph: {
      ...defaultOpenGraphExtras(),
      type: "website",
      title: landingPage.seo.metaTitle,
      description: landingPage.seo.metaDescription,
      url,
      siteName: siteConfig.name,
      locale: "en_US",
    },
    twitter: {
      card: "summary",
      title: landingPage.seo.metaTitle,
      description: landingPage.seo.metaDescription,
      images: [siteConfig.openGraphImagePath],
    },
  };
}
