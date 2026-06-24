import { ZenithBleed } from "@/components/zenith/ZenithBleed";
import type { ComparisonTableComponent } from "@/types/zenith-content";

export function ComparisonTableBeforeAfter({ component }: { component: ComparisonTableComponent }) {
  const rows = component.flatRows ?? [];
  if (!component.heading && !rows.length) return null;
  const colAStyle = component.colA?.style === "forensic" ? "forensic" : "neutral";
  const colBStyle = component.colB?.style === "neutral" ? "neutral" : "forensic";

  return (
    <ZenithBleed className="my-10">
      <section className="ct-before-after">
        <div className="ctba-inner">
          {component.heading ? <h2 className="ctba-h2">{component.heading}</h2> : null}
          <div className="ctba-grid">
            <div className={`ctba-col ${colAStyle}`}>
              {component.colA?.label ? (
                <p className="ctba-col-label">{component.colA.label}</p>
              ) : null}
              <ul className="ctba-list">
                {rows.map((row, i) => (
                  <li key={i}>{row.a}</li>
                ))}
              </ul>
            </div>
            <div className={`ctba-col ${colBStyle}`}>
              {component.colB?.label ? (
                <p className="ctba-col-label">{component.colB.label}</p>
              ) : null}
              <ul className="ctba-list">
                {rows.map((row, i) => (
                  <li key={i}>{row.b}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </ZenithBleed>
  );
}
