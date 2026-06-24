import type { FooterCtaComponent } from "@/types/zenith-content";

import { ZenithBleed } from "@/components/zenith/ZenithBleed";
import { ZenithCtaButton } from "@/components/zenith/components/ZenithCtaButton";
import type { ZenithComponentRenderContext } from "@/components/zenith/types";

function paragraphs(body?: string): string[] {
  if (!body?.trim()) return [];
  return body
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function FooterCta({
  component,
  page,
}: {
  component: FooterCtaComponent;
  page: ZenithComponentRenderContext["page"];
}) {
  if (!component.headline && !component.body && !component.cta) return null;
  const paras = paragraphs(component.body);

  if (component.variant === "forensic-final") {
    return (
      <ZenithBleed>
        <section className="footer-forensic-final" aria-label="Call to action">
          <div className="fff-inner">
            {component.headline ? <h2 className="fff-h">{component.headline}</h2> : null}
            {paras.map((p) => (
              <p key={p.slice(0, 24)} className="fff-body">
                {p}
              </p>
            ))}
            {component.cta ? (
              <div className="fff-cta">
                <ZenithCtaButton cta={component.cta} page={page} variant="light" />
              </div>
            ) : null}
          </div>
        </section>
      </ZenithBleed>
    );
  }

  return (
    <section
      className="relative left-1/2 right-1/2 -mx-[50vw] mt-16 w-screen bg-[#1e3560] px-4 py-14 text-white sm:px-8"
      aria-label="Call to action"
    >
      <div className="mx-auto max-w-3xl text-center">
        {component.headline ? (
          <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
            {component.headline}
          </h2>
        ) : null}
        {paras.map((p) => (
          <p key={p.slice(0, 24)} className="mt-4 text-lg leading-relaxed text-white/90">
            {p}
          </p>
        ))}
        {component.cta ? (
          <div className="mt-8">
            <ZenithCtaButton cta={component.cta} page={page} variant="light" />
          </div>
        ) : null}
      </div>
    </section>
  );
}
