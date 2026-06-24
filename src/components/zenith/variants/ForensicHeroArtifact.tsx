import type { ForensicArtifact } from "@/types/zenith-content";

import {
  isFlaggedExchange,
  markerDisplayLabel,
  normalizeMarkerClass,
  renderHighlightedLine,
  resolveWaveformBars,
} from "@/components/zenith/variants/forensic-hero-helpers";

const DEFAULT_TIMESTAMPS = ["00:00", "19:08", "41:22"];
const DEFAULT_DRIFT_PERCENT = 54;
const DEFAULT_DRIFT_LABEL = "DRIFT DETECTED";
const DEFAULT_STATUS = "Forensic Complete";
const DEFAULT_VERDICT_LABEL = "Sherpa Verdict";
const DEFAULT_FOOTER = "Free Forensic Analysis · BusinessImpactCanada.com";

export function ForensicHeroArtifact({ artifact }: { artifact: ForensicArtifact }) {
  const bars = resolveWaveformBars(artifact.waveform);
  const driftPercent = artifact.driftPositionPercent ?? DEFAULT_DRIFT_PERCENT;
  const driftLabel = artifact.driftLabel?.trim() || DEFAULT_DRIFT_LABEL;
  const timestamps =
    artifact.timestamps?.length && artifact.timestamps.length >= 2
      ? artifact.timestamps
      : DEFAULT_TIMESTAMPS;
  const status = artifact.status?.trim() || DEFAULT_STATUS;
  const verdictLabel = artifact.verdictLabel?.trim() || DEFAULT_VERDICT_LABEL;
  const footer = artifact.footer?.trim() || DEFAULT_FOOTER;

  return (
    <div className="fa" aria-label="Forensic artifact preview">
      <div className="fa-header">
        <span className="fa-title">{artifact.caseId ?? "Case file"}</span>
        <span className="fa-status">
          <span className="fa-status-dot" aria-hidden />
          {status}
        </span>
      </div>
      <div className="fa-waveform">
        {bars.map((bar, i) => (
          <span
            key={i}
            className={`wv ${bar.tone}`}
            style={{ height: `${Math.min(100, Math.max(8, bar.height))}%` }}
            aria-hidden
          />
        ))}
        <span className="fa-drift-line" style={{ left: `${driftPercent}%` }} aria-hidden />
        <span className="fa-drift-tag" style={{ left: `${driftPercent}%` }}>
          {driftLabel}
        </span>
        <div className="fa-waveform-label">
          {timestamps.map((ts) => (
            <span key={ts} className="wv-ts">
              {ts}
            </span>
          ))}
        </div>
      </div>
      {artifact.exchanges?.length ? (
        <div className="fa-exchanges">
          {artifact.exchanges.map((ex, i) => {
            const flagged = isFlaggedExchange(ex);
            const markerCls = normalizeMarkerClass(ex);
            return (
              <div key={i} className={`fa-ex${flagged ? " flagged" : ""}`}>
                {ex.timestamp ? <span className="fa-ex-ts">{ex.timestamp}</span> : <span />}
                <p className="fa-ex-line">
                  {ex.speaker ? (
                    <>
                      <span className="buyer">{ex.speaker}: </span>
                    </>
                  ) : null}
                  {renderHighlightedLine(ex.line, ex.highlight)}
                </p>
                {ex.marker || ex.markerTone ? (
                  <span className={`fa-marker ${markerCls}`}>{markerDisplayLabel(ex)}</span>
                ) : (
                  <span />
                )}
                {ex.annotation ? <p className="fa-annotation">{ex.annotation}</p> : null}
              </div>
            );
          })}
        </div>
      ) : null}
      {artifact.verdict ? (
        <div className="fa-verdict">
          <p className="fa-verdict-label">{verdictLabel}</p>
          <p className="fa-verdict-text">{artifact.verdict}</p>
        </div>
      ) : null}
      <p className="fa-free">{footer}</p>
    </div>
  );
}
