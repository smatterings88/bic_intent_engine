import { FAQBlock } from "@/components/articles/FAQBlock";
import type { LandingPage } from "@/types/landing-page";

export function LandingFAQBlock({ landingPage }: { landingPage: LandingPage }) {
  return <FAQBlock faqs={landingPage.aeo.faqs} />;
}
