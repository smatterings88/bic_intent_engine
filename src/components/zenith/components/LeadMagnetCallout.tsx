import type { LeadMagnetCalloutComponent } from "@/types/zenith-content";

import { ZenithCtaButton } from "@/components/zenith/components/ZenithCtaButton";
import type { ZenithComponentRenderContext } from "@/components/zenith/types";

export function LeadMagnetCallout({
  component,
  page,
}: {
  component: LeadMagnetCalloutComponent;
  page: ZenithComponentRenderContext["page"];
}) {
  if (!component.title && !component.description && !component.destination) return null;
  const dest = component.destination?.trim();
  const cta = dest
    ? { label: component.ctaText?.trim() || "Get the guide", destination: dest }
    : undefined;
  return (
    <aside className="my-10 rounded-2xl border border-slate-200 bg-[#FAF7F2] p-6 shadow-sm sm:p-8">
      {component.title ? (
        <h3 className="font-serif text-xl font-semibold text-slate-900">{component.title}</h3>
      ) : null}
      {component.description ? (
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{component.description}</p>
      ) : null}
      {cta ? (
        <div className="mt-4">
          <ZenithCtaButton cta={cta} page={page} variant="primary" />
        </div>
      ) : null}
    </aside>
  );
}
