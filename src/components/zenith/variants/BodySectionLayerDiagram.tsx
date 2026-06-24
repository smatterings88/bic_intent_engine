import { ZenithBleed } from "@/components/zenith/ZenithBleed";
import type { BodySectionComponent } from "@/types/zenith-content";

function paragraphs(body?: string): string[] {
  if (!body?.trim()) return [];
  return body
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function BodySectionLayerDiagram({ component }: { component: BodySectionComponent }) {
  const paras = paragraphs(component.body);
  const diagram = component.diagram;
  if (!component.heading && !paras.length && !diagram) return null;

  return (
    <ZenithBleed>
      <section className="bs-layer-diagram">
        <div className="bsld-inner">
          {diagram ? (
            <div className="bsld-diagram">
              {diagram.recordingLayer ? (
                <>
                  <div className="bsld-row tools">
                    <span className="bsld-icon gray">{diagram.recordingLayer.icon ?? "🎙"}</span>
                    <span className="bsld-label">
                      <strong>{diagram.recordingLayer.label}</strong>
                      <span>{diagram.recordingLayer.tools}</span>
                    </span>
                  </div>
                  {diagram.recordingLayer.outputs ? (
                    <p className="bsld-outputs">{diagram.recordingLayer.outputs}</p>
                  ) : null}
                </>
              ) : null}
              <div className="bsld-row arrow">
                <span className="bsld-arrow" aria-hidden>
                  ↓
                </span>
              </div>
              {diagram.interpretationLayer ? (
                <>
                  <div className="bsld-row sbi">
                    <span className="bsld-icon red">
                      {diagram.interpretationLayer.icon ?? "🔬"}
                    </span>
                    <span className="bsld-label">
                      <strong>{diagram.interpretationLayer.label}</strong>
                      <span>{diagram.interpretationLayer.tools}</span>
                    </span>
                  </div>
                  {diagram.interpretationLayer.outputs ? (
                    <p className="bsld-outputs forensic">{diagram.interpretationLayer.outputs}</p>
                  ) : null}
                </>
              ) : null}
              {diagram.caption ? <p className="bsld-caption">{diagram.caption}</p> : null}
            </div>
          ) : null}
          <div className="bsld-copy">
            {component.heading ? <h2>{component.heading}</h2> : null}
            {paras.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </div>
      </section>
    </ZenithBleed>
  );
}
