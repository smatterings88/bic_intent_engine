import type { ZenithComponent, ZenithPage } from "@/types/zenith-content";

import { AeoAnswerBlock } from "@/components/zenith/components/AeoAnswerBlock";
import { BodySection } from "@/components/zenith/components/BodySection";
import { ComparisonTable } from "@/components/zenith/components/ComparisonTable";
import { CredibilityBar } from "@/components/zenith/components/CredibilityBar";
import { ForensicDownloadSection } from "@/components/zenith/components/ForensicDownloadSection";
import { MomentList } from "@/components/zenith/components/MomentList";
import { WhyMissSection } from "@/components/zenith/components/WhyMissSection";
import { FaqSection } from "@/components/zenith/components/FaqSection";
import { FooterCta } from "@/components/zenith/components/FooterCta";
import { InlineCta } from "@/components/zenith/components/InlineCta";
import { LeadForm } from "@/components/zenith/components/LeadForm";
import { LeadMagnetCallout } from "@/components/zenith/components/LeadMagnetCallout";
import { PageHero } from "@/components/zenith/components/PageHero";
import { QuoteBlock } from "@/components/zenith/components/QuoteBlock";
import { ResearchCallout } from "@/components/zenith/components/ResearchCallout";
import { SignalBreakdown } from "@/components/zenith/components/SignalBreakdown";
import { SpeakerBlock } from "@/components/zenith/components/SpeakerBlock";
import { TranscriptBlock } from "@/components/zenith/components/TranscriptBlock";
import { WebinarUrgencyBlock } from "@/components/zenith/components/WebinarUrgencyBlock";
import { ZenithHtmlRenderer } from "@/components/zenith/ZenithHtmlRenderer";
import type { HtmlSectionComponent } from "@/types/zenith-content";
import type { ZenithPageTheme } from "@/lib/zenith/theme";

export function ZenithComponentRenderer({
  component,
  page,
  theme,
  isArticle,
}: {
  component: ZenithComponent;
  page: ZenithPage;
  theme: ZenithPageTheme;
  isArticle?: boolean;
}) {
  try {
    switch (component.type) {
      case "page-hero":
        return <PageHero component={component} page={page} theme={theme} isArticle={isArticle} />;
      case "aeo-answer-block":
        return <AeoAnswerBlock component={component} />;
      case "body-section":
        return <BodySection component={component} />;
      case "transcript-block":
        return <TranscriptBlock component={component} />;
      case "signal-breakdown":
        return <SignalBreakdown component={component} />;
      case "inline-cta":
        return <InlineCta component={component} page={page} />;
      case "faq-section":
        return <FaqSection component={component} />;
      case "lead-form":
        return (
          <LeadForm component={component} pageSlug={page.slug} contentType={page.contentType} />
        );
      case "footer-cta":
        return <FooterCta component={component} page={page} />;
      case "lead-magnet-callout":
        return <LeadMagnetCallout component={component} page={page} />;
      case "quote-block":
        return <QuoteBlock component={component} />;
      case "research-callout":
        return <ResearchCallout component={component} />;
      case "speaker-block":
        return <SpeakerBlock component={component} />;
      case "webinar-urgency-block":
        return <WebinarUrgencyBlock component={component} page={page} />;
      case "comparison-table":
        return <ComparisonTable component={component} />;
      case "credibility-bar":
        return <CredibilityBar component={component} />;
      case "moment-list":
        return <MomentList component={component} />;
      case "why-miss-section":
        return <WhyMissSection component={component} />;
      case "forensic-download-section":
        return (
          <ForensicDownloadSection
            component={component}
            pageSlug={page.slug}
            contentType={page.contentType}
          />
        );
      case "html-section": {
        const section = component as HtmlSectionComponent;
        if (!section.html) return null;
        return (
          <ZenithHtmlRenderer page={page} html={section.html} slots={section.slots ?? page.slots} />
        );
      }
      default:
        return null;
    }
  } catch {
    return null;
  }
}
