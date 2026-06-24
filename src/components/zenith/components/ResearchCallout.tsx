import { ResearchCalloutArtifactBox } from "@/components/zenith/variants/ResearchCalloutArtifactBox";
import type { ResearchCalloutComponent } from "@/types/zenith-content";

export function ResearchCallout({ component }: { component: ResearchCalloutComponent }) {
  if (component.variant === "artifact-box") {
    return <ResearchCalloutArtifactBox component={component} />;
  }
  if (!component.claim?.trim() && !component.context?.trim() && !component.caveat?.trim())
    return null;
  return (
    <aside className="my-10 rounded-r-2xl border-l-4 border-slate-500 bg-slate-50 p-6 sm:p-8">
      {component.claim ? (
        <p className="text-lg font-semibold leading-snug text-slate-900">{component.claim}</p>
      ) : null}
      {component.context ? (
        <p className="mt-3 text-base leading-relaxed text-slate-700">{component.context}</p>
      ) : null}
      {component.caveat ? <p className="mt-3 text-sm text-slate-500">{component.caveat}</p> : null}
    </aside>
  );
}
