import { ZenithBleed } from "@/components/zenith/ZenithBleed";
import type { BodySectionComponent } from "@/types/zenith-content";

export function BodySectionStatCallout({ component }: { component: BodySectionComponent }) {
  if (!component.heading && !component.body && !component.stat?.number) return null;
  return (
    <ZenithBleed className="my-0">
      <section className="bs-stat-callout">
        <div className="bssc-inner">
          {component.kicker ? <p className="bssc-kicker">{component.kicker}</p> : null}
          {component.heading ? <h2 className="bssc-h2">{component.heading}</h2> : null}
          {component.body ? <p className="bssc-sub">{component.body}</p> : null}
          {component.stat ? (
            <div className="bssc-stat-block">
              <div className="bssc-stat-text">
                {component.stat.premise ? (
                  <p className="bssc-stat-premise">{component.stat.premise}</p>
                ) : null}
                {component.stat.number ? (
                  <span className="bssc-stat-number">{component.stat.number}</span>
                ) : null}
                {component.stat.consequence ? (
                  <p className="bssc-stat-consequence">{component.stat.consequence}</p>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </ZenithBleed>
  );
}
