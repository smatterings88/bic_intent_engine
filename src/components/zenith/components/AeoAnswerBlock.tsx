import type { AeoAnswerBlockComponent } from "@/types/zenith-content";

export function AeoAnswerBlock({ component }: { component: AeoAnswerBlockComponent }) {
  if (!component.answer?.trim()) return null;
  return (
    <aside
      className="my-8 rounded-r-2xl border-l-4 border-[#1e3560] bg-white/70 p-5 shadow-sm sm:p-6"
      aria-label="Short answer"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#1e3560]">
        The short answer
      </p>
      <p className="mt-3 text-base leading-relaxed text-slate-800 sm:text-lg">{component.answer}</p>
    </aside>
  );
}
