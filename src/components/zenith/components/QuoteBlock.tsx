import { QuoteBlockMicroProof } from "@/components/zenith/variants/QuoteBlockMicroProof";
import type { QuoteBlockComponent } from "@/types/zenith-content";

export function QuoteBlock({ component }: { component: QuoteBlockComponent }) {
  if (component.variant === "micro-proof") {
    return <QuoteBlockMicroProof component={component} />;
  }
  if (!component.quote?.trim()) return null;
  return (
    <figure className="my-10 border-l-4 border-[#1e3560]/40 pl-6">
      <blockquote className="font-serif text-2xl font-medium italic leading-snug text-slate-900 sm:text-3xl">
        “{component.quote}”
      </blockquote>
      {component.attribution ? (
        <figcaption className="mt-4 text-sm font-medium text-slate-600">
          — {component.attribution}
        </figcaption>
      ) : null}
    </figure>
  );
}
