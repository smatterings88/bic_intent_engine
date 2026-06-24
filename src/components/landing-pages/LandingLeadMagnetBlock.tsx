import type { LandingPage } from "@/types/landing-page";

import { LandingOptInForm } from "./LandingOptInForm";

export function LandingLeadMagnetBlock({ landingPage }: { landingPage: LandingPage }) {
  const { primaryLeadMagnetId, leadMagnetIds } = landingPage;
  const unique = [...new Set([primaryLeadMagnetId, ...leadMagnetIds].filter(Boolean))];

  return (
    <aside className="surface-card mx-auto my-12 max-w-4xl border-border/70 px-4 py-8 sm:my-16 sm:px-8 sm:py-10">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Lead magnet
      </h2>
      <p className="mt-2 font-medium text-foreground">Primary: {primaryLeadMagnetId}</p>
      {unique.length > 1 ? (
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          Related resources: {unique.join(", ")}
        </p>
      ) : null}
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Use the form below to request this resource.
      </p>
      <LandingOptInForm
        landingPageSlug={landingPage.slug}
        primaryLeadMagnetId={primaryLeadMagnetId}
        campaignType={landingPage.campaignType}
        ghlTags={landingPage.conversion.ghlTags}
        thankYouMessage={landingPage.conversion.thankYouMessage}
        nextStep={landingPage.conversion.nextStep}
      />
    </aside>
  );
}
