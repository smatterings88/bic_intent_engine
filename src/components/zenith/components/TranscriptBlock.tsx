import { TranscriptBlockCaseFile } from "@/components/zenith/variants/TranscriptBlockCaseFile";
import { getVerdictTheme } from "@/lib/zenith/theme";
import type { TranscriptBlockComponent } from "@/types/zenith-content";

export function TranscriptBlock({ component }: { component: TranscriptBlockComponent }) {
  if (component.variant === "case-file") {
    return <TranscriptBlockCaseFile component={component} />;
  }
  const verdict = getVerdictTheme(component.verdict);
  const hasBody =
    component.timestamp?.trim() ||
    (component.exchanges && component.exchanges.length > 0) ||
    (component.signals && component.signals.length > 0);
  if (!hasBody) return null;
  return (
    <section
      className="my-10 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/80"
      aria-label="Transcript excerpt"
    >
      {component.timestamp ? (
        <div className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Timestamp
          </p>
          <p className="font-mono text-lg font-semibold text-[#1e3560]">{component.timestamp}</p>
        </div>
      ) : null}
      {component.exchanges?.length ? (
        <div className="space-y-3 border-b border-slate-200 px-4 py-5 font-mono text-sm leading-relaxed text-slate-800 sm:px-6 sm:text-base">
          {component.exchanges.map((ex, i) => {
            if (!("speaker" in ex) || !("line" in ex)) return null;
            return (
              <div key={i} className="border-l-2 border-slate-300 pl-3">
                <span className="font-semibold text-slate-900">{ex.speaker}:</span>{" "}
                <span>{ex.line}</span>
              </div>
            );
          })}
        </div>
      ) : null}
      {component.signals?.length ? (
        <div className="grid gap-3 px-4 py-5 sm:grid-cols-2 sm:px-6">
          {component.signals.map((s, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="font-semibold text-slate-900">{s.label}</p>
              {s.description ? (
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.description}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
      {component.verdict ? (
        <div
          className={`border-t px-4 py-4 sm:px-6 ${verdict.bgClass} ${verdict.borderClass} border-l-4`}
        >
          <p className={`text-sm font-semibold uppercase tracking-wide ${verdict.textClass}`}>
            Verdict: {verdict.label}
          </p>
        </div>
      ) : null}
      {component.attribution ? (
        <p className="border-t border-slate-200 px-4 py-3 text-xs italic text-slate-500 sm:px-6">
          {component.attribution}
        </p>
      ) : null}
    </section>
  );
}
