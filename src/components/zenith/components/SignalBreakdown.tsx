import { SignalBreakdownEvidenceCards } from "@/components/zenith/variants/SignalBreakdownEvidenceCards";
import type { SignalBreakdownComponent } from "@/types/zenith-content";

export function SignalBreakdown({ component }: { component: SignalBreakdownComponent }) {
  if (component.variant === "evidence-cards") {
    return <SignalBreakdownEvidenceCards component={component} />;
  }
  if (!component.intro?.trim() && !component.signals?.length) return null;
  return (
    <section className="my-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      {component.intro ? (
        <p className="text-base leading-relaxed text-slate-700">{component.intro}</p>
      ) : null}
      {component.signals?.length ? (
        <ul className="mt-6 space-y-4">
          {component.signals.map((s, i) => (
            <li key={i}>
              <p className="font-semibold text-slate-900">{s.label}</p>
              {"detail" in s && s.detail ? (
                <p className="mt-1 text-sm text-slate-600">{s.detail}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
