import { ZenithBleed } from "@/components/zenith/ZenithBleed";
import type { WhyMissSectionComponent } from "@/types/zenith-content";

export function WhyMissSection({ component }: { component: WhyMissSectionComponent }) {
  const blocks = component.blocks ?? [];
  if (!component.heading?.trim() && !blocks.length) return null;
  return (
    <ZenithBleed>
      <section
        className="why-miss"
        aria-labelledby={component.heading ? "why-miss-heading" : undefined}
      >
        <div className="why-miss-inner">
          {component.kicker ? <p className="why-miss-kicker">{component.kicker}</p> : null}
          {component.heading ? (
            <h2 id="why-miss-heading" className="why-miss-heading">
              {component.heading}
            </h2>
          ) : null}
          {blocks.length ? (
            <div className="why-miss-blocks">
              {blocks.map((b, i) => (
                <div key={`${b.title ?? i}`} className="wmb">
                  {b.number ? <span className="wmb-num">{b.number}</span> : null}
                  <div className="wmb-text">
                    {b.title ? <h3 className="wmb-title">{b.title}</h3> : null}
                    {b.body ? <p className="wmb-body">{b.body}</p> : null}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          {component.closing ? <p className="why-miss-anchor">{component.closing}</p> : null}
        </div>
      </section>
    </ZenithBleed>
  );
}
