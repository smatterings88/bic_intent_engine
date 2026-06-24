import { ZenithBleed } from "@/components/zenith/ZenithBleed";
import type { BodySectionComponent } from "@/types/zenith-content";

export function BodySectionStoryFile({ component }: { component: BodySectionComponent }) {
  if (!component.paragraphs?.length && !component.fileLabel) return null;
  return (
    <ZenithBleed>
      <section className="bs-story-file">
        <div className="bssf-inner">
          {(component.fileLabel || component.fileBadge) && (
            <div className="bssf-file-header">
              {component.fileLabel ? (
                <span className="bssf-file-label">{component.fileLabel}</span>
              ) : (
                <span />
              )}
              {component.fileBadge ? (
                <span className="bssf-file-badge">{component.fileBadge}</span>
              ) : null}
            </div>
          )}
          <div className="bssf-body">
            {component.paragraphs?.map((p) => (
              <p key={p.slice(0, 32)}>{p}</p>
            ))}
            {component.verdictRows?.length ? (
              <div className="bssf-verdict">
                {component.verdictRows.map((row) => (
                  <div key={row.label} className="bssf-verdict-item">
                    <p className="label">{row.label}</p>
                    <p className="value">{row.value}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </ZenithBleed>
  );
}
