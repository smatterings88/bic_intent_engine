import {
  buildLandingPageBreadcrumbJsonLd,
  buildLandingPageFaqJsonLd,
  buildLandingPageJsonLd,
} from "@/lib/landing-pages/schema";
import type { LandingPage } from "@/types/landing-page";
import { LandingAnswerBlock } from "./LandingAnswerBlock";
import { LandingFAQBlock } from "./LandingFAQBlock";
import { LandingHero } from "./LandingHero";
import { LandingJsonLdScript } from "./LandingJsonLdScript";
import { LandingLeadMagnetBlock } from "./LandingLeadMagnetBlock";
import { LandingProofBlock } from "./LandingProofBlock";
import { LandingSections } from "./LandingSections";
import { RelatedLandingArticlesBlock } from "./RelatedLandingArticlesBlock";
import { RelatedLandingPagesBlock } from "./RelatedLandingPagesBlock";

export function LandingPageTemplate({ landingPage }: { landingPage: LandingPage }) {
  const faqLd = buildLandingPageFaqJsonLd(landingPage);
  return (
    <article className="pb-24">
      <LandingJsonLdScript data={buildLandingPageJsonLd(landingPage)} />
      <LandingJsonLdScript data={buildLandingPageBreadcrumbJsonLd(landingPage)} />
      {faqLd ? <LandingJsonLdScript data={faqLd} /> : null}
      <LandingHero landingPage={landingPage} />
      <LandingAnswerBlock text={landingPage.aeo.answerBlock} />
      <LandingSections landingPage={landingPage} />
      <LandingProofBlock landingPage={landingPage} />
      <LandingFAQBlock landingPage={landingPage} />
      <RelatedLandingArticlesBlock slugs={landingPage.relatedArticleSlugs} />
      <RelatedLandingPagesBlock
        slugs={landingPage.relatedLandingPageSlugs}
        currentSlug={landingPage.slug}
      />
      <LandingLeadMagnetBlock landingPage={landingPage} />
    </article>
  );
}
