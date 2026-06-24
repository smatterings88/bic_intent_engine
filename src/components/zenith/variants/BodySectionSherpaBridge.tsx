import type { BodySectionComponent } from "@/types/zenith-content";

export function BodySectionSherpaBridge({ component }: { component: BodySectionComponent }) {
  if (!component.label && !component.body && !component.nameplate?.name) return null;
  return (
    <section className="bs-sherpa-bridge">
      {component.label ? <p className="bssb-label">{component.label}</p> : null}
      {component.body ? <p className="bssb-body">{component.body}</p> : null}
      {component.nameplate ? (
        <div className="bssb-nameplate">
          {component.nameplate.name ? (
            <p className="bssb-name">{component.nameplate.name}</p>
          ) : null}
          {component.nameplate.descriptor ? (
            <p className="bssb-descriptor">{component.nameplate.descriptor}</p>
          ) : null}
          {component.nameplate.scope?.length ? (
            <ul className="bssb-scope">
              {component.nameplate.scope.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      {component.ops?.length ? (
        <div className="bssb-ops">
          {component.ops.map((op) => (
            <div key={op.label}>
              <p className="bssb-op-label">{op.label}</p>
              <p className="bssb-op-value">{op.value}</p>
            </div>
          ))}
        </div>
      ) : null}
      {component.closingLine ? <p className="bssb-closing">{component.closingLine}</p> : null}
    </section>
  );
}
