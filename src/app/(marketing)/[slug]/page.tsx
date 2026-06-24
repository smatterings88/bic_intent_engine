import { notFound } from "next/navigation";

import { LandingPageTemplate } from "@/components/landing-pages/LandingPageTemplate";
import { ZenithPageRenderer } from "@/components/zenith/ZenithPageRenderer";
import { isReservedTopLevelSlug, isValidSlug } from "@/lib/content/slug";
import { buildLandingPageMetadata } from "@/lib/landing-pages/metadata";
import {
  getPublishedLandingPageBySlug,
  listPublishedLandingPageSlugs,
} from "@/lib/landing-pages/read";
import { getRelatedPublishedZenithPages } from "@/lib/zenith/related";
import {
  getPublishedZenithPageBySlug,
  listPublishedZenithSlugsByContentType,
} from "@/lib/zenith/firestore";
import { buildZenithPageMetadata } from "@/lib/zenith/metadata";
import { getBaseUrl } from "@/lib/zenith/routes";

/** ISR interval in seconds — keep in sync with `DEFAULT_LANDING_PAGE_REVALIDATE_SECONDS` in `src/lib/content/constants.ts`. */
export const revalidate = 900;

export async function generateStaticParams() {
  const legacy = await listPublishedLandingPageSlugs();
  const zenithLanding = await listPublishedZenithSlugsByContentType("landing_page");
  const zenithThankYou = await listPublishedZenithSlugsByContentType("thank_you_page");
  const seen = new Set(legacy.map((x) => x.slug));
  const zenith = [...zenithLanding, ...zenithThankYou];
  return [...legacy, ...zenith.filter((z) => !seen.has(z.slug) && !isReservedTopLevelSlug(z.slug))];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isValidSlug(slug) || isReservedTopLevelSlug(slug)) {
    return {
      title: "Page | Business Impact Canada",
      robots: { index: false, follow: false },
    };
  }
  const landingPage = await getPublishedLandingPageBySlug(slug);
  if (landingPage) {
    return buildLandingPageMetadata(landingPage);
  }
  const zenith = await getPublishedZenithPageBySlug(slug);
  if (
    zenith &&
    (zenith.contentType === "landing_page" || zenith.contentType === "thank_you_page")
  ) {
    return buildZenithPageMetadata(zenith);
  }
  return {
    title: "Page | Business Impact Canada",
    robots: { index: false, follow: false },
  };
}

export default async function PublicLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isValidSlug(slug) || isReservedTopLevelSlug(slug)) {
    notFound();
  }
  const landingPage = await getPublishedLandingPageBySlug(slug);
  if (landingPage) {
    return <LandingPageTemplate landingPage={landingPage} />;
  }
  const zenith = await getPublishedZenithPageBySlug(slug);
  if (
    !zenith ||
    (zenith.contentType !== "landing_page" && zenith.contentType !== "thank_you_page")
  ) {
    notFound();
  }
  const relatedCards = await getRelatedPublishedZenithPages(zenith.relatedArticleSlugs ?? []);
  return (
    <ZenithPageRenderer
      page={zenith}
      mode="public"
      relatedCards={relatedCards}
      baseUrl={getBaseUrl()}
    />
  );
}
