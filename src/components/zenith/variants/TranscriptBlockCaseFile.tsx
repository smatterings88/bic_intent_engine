import { ZenithBleed } from "@/components/zenith/ZenithBleed";
import type { TranscriptBlockComponent, TranscriptCaseFileExchange } from "@/types/zenith-content";

function isCaseExchange(ex: unknown): ex is TranscriptCaseFileExchange {
  return Boolean(ex && typeof ex === "object" && ("buyer" in ex || "salesperson" in ex));
}

export function TranscriptBlockCaseFile({ component }: { component: TranscriptBlockComponent }) {
  const exchanges = (component.exchanges ?? []).filter(isCaseExchange);
  if (!component.caseLabel && !exchanges.length && !component.summary?.length) return null;

  return (
    <ZenithBleed className="my-10">
      <section className="tb-case-file" aria-label="Case file transcript">
        <div className="tbcf-header">
          {component.caseLabel ? (
            <span className="tbcf-meta">{component.caseLabel}</span>
          ) : (
            <span />
          )}
          {component.verdictBadge ? (
            <span className="tbcf-verdict-badge">{component.verdictBadge}</span>
          ) : null}
        </div>
        <div className="tbcf-timeline">
          {exchanges.map((ex, i) => (
            <div key={i}>
              <div className="tbcf-ex">
                {ex.timestamp ? <span className="tbcf-ex-ts">{ex.timestamp}</span> : <span />}
                <div>
                  {ex.salesperson ? (
                    <p className="tbcf-ex-text">
                      <span className="spk">SALESPERSON: </span>
                      {ex.salesperson}
                    </p>
                  ) : null}
                  {ex.buyer ? (
                    <p className="tbcf-ex-text">
                      <span className="spk">BUYER: </span>
                      <span className="buyer">{ex.buyer}</span>
                    </p>
                  ) : null}
                </div>
              </div>
              {ex.marker?.type ? (
                <div className={`tbcf-marker ${ex.marker.type}`}>
                  {ex.marker.label ? <p className="tbcf-marker-label">{ex.marker.label}</p> : null}
                  {ex.marker.description ? (
                    <p className="tbcf-marker-desc">{ex.marker.description}</p>
                  ) : null}
                  {ex.marker.note ? <p className="tbcf-marker-note">{ex.marker.note}</p> : null}
                </div>
              ) : null}
            </div>
          ))}
        </div>
        {component.summary?.length ? (
          <div className="tbcf-summary">
            {component.summary.map((row) => (
              <div key={row.label}>
                <p className="tbcf-sum-label">{row.label}</p>
                <p className={`tbcf-sum-value${row.highlight ? " highlight" : ""}`}>{row.value}</p>
              </div>
            ))}
          </div>
        ) : null}
        {component.attribution ? <p className="tbcf-attribution">{component.attribution}</p> : null}
      </section>
    </ZenithBleed>
  );
}
