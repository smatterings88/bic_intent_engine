import Link from "next/link";

import { ZenithBleed } from "@/components/zenith/ZenithBleed";
import { getHrefForZenithDestination } from "@/lib/zenith/destinations";
import type { PageHeroComponent, ZenithPage } from "@/types/zenith-content";

export function PageHeroToolStrip({
  component,
  page,
  isArticle,
}: {
  component: PageHeroComponent;
  page: ZenithPage;
  isArticle: boolean;
}) {
  const HeadTag = isArticle ? "h2" : "h1";
  const ctaHref = component.primaryCta
    ? getHrefForZenithDestination(component.primaryCta.destination, page)
    : null;

  return (
    <ZenithBleed>
      <header className="page-hero--tool-strip">
        <div className="phts-inner">
          {component.eyebrow ? (
            <p className="phts-eyebrow">
              <span className="phts-eyebrow-dot" aria-hidden />
              {component.eyebrow}
            </p>
          ) : null}
          {component.headline ? <HeadTag className="phts-h1">{component.headline}</HeadTag> : null}
          {component.subheadline ? <p className="phts-sub">{component.subheadline}</p> : null}
          {component.tools?.length || component.sbiBadge ? (
            <div className="phts-tool-strip">
              {component.tools?.map((t) => (
                <span key={t.name} className="phts-tool-badge">
                  <span className="phts-tool-check" aria-hidden>
                    ✓
                  </span>
                  <strong>{t.name}</strong>
                  {t.detail ? <> · {t.detail}</> : null}
                </span>
              ))}
              {component.sbiBadge ? (
                <span className="phts-sbi-badge">{component.sbiBadge}</span>
              ) : null}
            </div>
          ) : null}
          {ctaHref && component.primaryCta ? (
            <Link href={ctaHref} className="pfn-btn">
              {component.primaryCta.label}
            </Link>
          ) : null}
          {component.proofLine ? <p className="phts-proof">{component.proofLine}</p> : null}
        </div>
      </header>
    </ZenithBleed>
  );
}
