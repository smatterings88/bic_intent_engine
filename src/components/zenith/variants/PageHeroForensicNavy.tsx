import Link from "next/link";

import { ZenithBleed } from "@/components/zenith/ZenithBleed";
import { ForensicHeroArtifact } from "@/components/zenith/variants/ForensicHeroArtifact";
import { getHrefForZenithDestination } from "@/lib/zenith/destinations";
import type { PageHeroComponent, ZenithPage } from "@/types/zenith-content";

export function PageHeroForensicNavy({
  component,
  page,
  isArticle,
}: {
  component: PageHeroComponent;
  page: ZenithPage;
  isArticle: boolean;
}) {
  const HeadTag = isArticle ? "h2" : "h1";
  const highlight = component.headlineHighlight?.trim();
  const headline = component.headline?.trim() ?? "";
  const lead =
    highlight && headline.includes(highlight)
      ? headline
          .replace(highlight, "")
          .trim()
          .replace(/[.\s]+$/, "")
      : "";

  const ctaHref = component.primaryCta
    ? getHrefForZenithDestination(component.primaryCta.destination, page)
    : null;
  const artifact = component.forensicArtifact;
  const microProof = component.microProof;

  return (
    <ZenithBleed>
      <header className="page-hero--forensic-navy">
        <div className="pfn-inner">
          <div className="pfn-copy">
            {component.eyebrow ? (
              <p className="pfn-kicker">
                <span className="pfn-kicker-dot" aria-hidden />
                {component.eyebrow}
              </p>
            ) : null}
            {headline ? (
              <HeadTag className="pfn-h1">
                {highlight ? (
                  <>
                    {lead ? <>{lead}. </> : null}
                    <span className="pfn-hl">{highlight}</span>
                  </>
                ) : (
                  headline
                )}
              </HeadTag>
            ) : null}
            {component.subheadline ? <p className="pfn-h2">{component.subheadline}</p> : null}
            {component.bullets?.length ? (
              <ul className="pfn-bullets">
                {component.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            ) : null}
            {ctaHref && component.primaryCta ? (
              <Link href={ctaHref} className="pfn-btn">
                {component.primaryCta.label}
              </Link>
            ) : null}
            {component.microcopy ? <p className="pfn-microcopy">{component.microcopy}</p> : null}
            {microProof?.buyerLine || microProof?.analysisLine ? (
              <div className="micro-proof">
                {microProof.buyerLine ? (
                  <p className="micro-proof-line">
                    {microProof.buyerLabel ? (
                      <span className="micro-label">{microProof.buyerLabel}</span>
                    ) : null}
                    {microProof.buyerLine}
                  </p>
                ) : null}
                {microProof.analysisLine ? (
                  <p className="micro-proof-line review">
                    {microProof.analysisLabel ? (
                      <span className="micro-label">{microProof.analysisLabel}</span>
                    ) : null}
                    {microProof.analysisLine}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          {artifact ? <ForensicHeroArtifact artifact={artifact} /> : null}
        </div>
      </header>
    </ZenithBleed>
  );
}
