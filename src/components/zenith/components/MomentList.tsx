import { ZenithBleed } from "@/components/zenith/ZenithBleed";
import type { MomentListComponent } from "@/types/zenith-content";

export function MomentList({ component }: { component: MomentListComponent }) {
  const moments = component.moments ?? [];
  if (!moments.length) return null;
  return (
    <ZenithBleed>
      <section
        className="moments"
        aria-labelledby={component.heading ? "moments-heading" : undefined}
      >
        <div className="moments-inner">
          {component.kicker ? <p className="moments-kicker">{component.kicker}</p> : null}
          {component.heading ? (
            <h2 id="moments-heading" className="moments-heading">
              {component.heading}
            </h2>
          ) : null}
          {component.subheading ? (
            <p className="moments-subheading">{component.subheading}</p>
          ) : null}
          <ol className="moment-list">
            {moments.map((m, i) => (
              <li key={`${m.title ?? i}-${m.timestamp ?? ""}`} className="moment-item">
                <div className="mi-num-ts">
                  {m.number ? <span className="mi-num">{m.number}</span> : null}
                  {m.timestamp ? <span className="mi-ts">{m.timestamp}</span> : null}
                </div>
                <div className="mi-content">
                  {m.title ? <h3 className="mi-title">{m.title}</h3> : null}
                  {m.description ? <p className="mi-desc">{m.description}</p> : null}
                  {m.snippet ? (
                    <p className="mi-snippet">
                      <span className="snip-buyer">Buyer: </span>
                      {m.snippet}
                    </p>
                  ) : null}
                  {m.signal ? <p className="mi-signal">{m.signal}</p> : null}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </ZenithBleed>
  );
}
