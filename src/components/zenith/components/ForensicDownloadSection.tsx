import { ZenithBleed } from "@/components/zenith/ZenithBleed";
import { LeadForm } from "@/components/zenith/components/LeadForm";
import type {
  ForensicDownloadSectionComponent,
  LeadFormComponent,
  ZenithContentType,
} from "@/types/zenith-content";

export function ForensicDownloadSection({
  component,
  pageSlug,
  contentType,
}: {
  component: ForensicDownloadSectionComponent;
  pageSlug: string;
  contentType?: ZenithContentType;
}) {
  const card = component.card;
  const form = component.form;
  const hasCopy =
    component.kicker ||
    component.heading ||
    component.paragraphs?.length ||
    component.tension ||
    component.legalNote;
  if (!hasCopy && !card && !form) return null;

  const leadForm: LeadFormComponent | null = form
    ? {
        type: "lead-form",
        variant: form.variant ?? "lead-magnet-capture",
        destination: form.destination,
        ctaText: form.ctaText,
        fields: form.fields,
        ghlTags: form.ghlTags,
        ghlTagStrategy: form.ghlTagStrategy,
        thankYouMessage: form.thankYouMessage,
        thankYouPageUrl: form.thankYouPageUrl,
        redirect: form.redirect,
      }
    : null;

  return (
    <ZenithBleed>
      <section
        id={component.id?.trim() || "lead"}
        className="download"
        aria-labelledby={component.heading ? "download-heading" : undefined}
      >
        <div className="download-inner">
          <div className="dl-copy">
            {component.kicker ? <p className="dl-kicker">{component.kicker}</p> : null}
            {component.heading ? (
              <h2 id="download-heading" className="dl-h">
                {component.heading}
              </h2>
            ) : null}
            {component.paragraphs?.map((p) => (
              <p key={p.slice(0, 40)} className="dl-p">
                {p}
              </p>
            ))}
            {component.legalNote ? <p className="dl-legal">{component.legalNote}</p> : null}
          </div>
          <div className="dl-right">
            {component.tension ? <p className="dl-tension">{component.tension}</p> : null}
            {card || leadForm ? (
              <div className="dl-card">
                {card?.eyebrow ? <p className="dlc-eyebrow">{card.eyebrow}</p> : null}
                {card?.title ? <h3 className="dlc-h">{card.title}</h3> : null}
                {card?.subtitle ? <p className="dlc-sub">{card.subtitle}</p> : null}
                {card?.previewTitle || card?.previewDetail ? (
                  <div className="mp" aria-hidden>
                    <div className="mp-thumb" />
                    <div className="mp-l">
                      {card.previewTitle ? (
                        <p className="mp-meta-title">{card.previewTitle}</p>
                      ) : null}
                      {card.previewDetail ? (
                        <p className="mp-meta-detail">{card.previewDetail}</p>
                      ) : null}
                    </div>
                  </div>
                ) : null}
                {leadForm ? (
                  <div className="optin-form">
                    {card?.caseLabel ? <p className="form-case-label">{card.caseLabel}</p> : null}
                    <LeadForm component={leadForm} pageSlug={pageSlug} contentType={contentType} />
                    {card?.nextStep ? <p className="form-next-step">{card.nextStep}</p> : null}
                    {card?.privacy ? <p className="dlc-privacy">{card.privacy}</p> : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </ZenithBleed>
  );
}
