import { ZenithBleed } from "@/components/zenith/ZenithBleed";
import type { SignalBreakdownComponent } from "@/types/zenith-content";

function isEvidenceSignal(
  s: NonNullable<SignalBreakdownComponent["signals"]>[number],
): s is { number?: string; label: string; description?: string } {
  return "description" in s || "number" in s;
}

export function SignalBreakdownEvidenceCards({
  component,
}: {
  component: SignalBreakdownComponent;
}) {
  const signals = component.signals?.filter(isEvidenceSignal) ?? [];
  if (!component.heading && !component.subheading && !signals.length) return null;

  return (
    <ZenithBleed>
      <section className="sb-evidence-cards">
        <div className="sbec-inner">
          {component.heading ? <h2 className="sbec-h2">{component.heading}</h2> : null}
          {component.subheading ? <p className="sbec-sub">{component.subheading}</p> : null}
          {signals.length ? (
            <div className="sbec-grid">
              {signals.map((s) => (
                <div key={s.label} className="sbec-card">
                  {s.number ? <span className="sbec-num">{s.number}</span> : null}
                  <div>
                    <p className="sbec-name">{s.label}</p>
                    {s.description ? <p className="sbec-desc">{s.description}</p> : null}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </ZenithBleed>
  );
}
