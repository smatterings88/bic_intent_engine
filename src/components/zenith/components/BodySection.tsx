import type { BodySectionComponent } from "@/types/zenith-content";

import { BodySectionLayerDiagram } from "@/components/zenith/variants/BodySectionLayerDiagram";
import { BodySectionSherpaBridge } from "@/components/zenith/variants/BodySectionSherpaBridge";
import { BodySectionStatCallout } from "@/components/zenith/variants/BodySectionStatCallout";
import { BodySectionStoryFile } from "@/components/zenith/variants/BodySectionStoryFile";

function paragraphs(body?: string): string[] {
  if (!body?.trim()) return [];
  return body
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function BodySection({ component }: { component: BodySectionComponent }) {
  if (component.variant === "stat-callout") {
    return <BodySectionStatCallout component={component} />;
  }
  if (component.variant === "story-file") {
    return <BodySectionStoryFile component={component} />;
  }
  if (component.variant === "layer-diagram") {
    return <BodySectionLayerDiagram component={component} />;
  }
  if (component.variant === "sherpa-bridge") {
    return <BodySectionSherpaBridge component={component} />;
  }

  const paras = paragraphs(component.body);
  const callout = component.emphasis === "callout";
  const inner = (
    <>
      {component.heading ? (
        <h2 className="font-serif text-2xl font-semibold text-slate-900">{component.heading}</h2>
      ) : null}
      {paras.map((p) => (
        <p key={p.slice(0, 24)} className="mt-4 text-base leading-relaxed text-slate-700">
          {p}
        </p>
      ))}
      {component.bullets?.length ? (
        <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
          {component.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      ) : null}
    </>
  );
  if (!component.heading && !paras.length && !component.bullets?.length) return null;
  if (callout) {
    return (
      <section className="my-10 rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
        {inner}
      </section>
    );
  }
  return <section className="my-10">{inner}</section>;
}
