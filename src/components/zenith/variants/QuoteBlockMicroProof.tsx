import type { QuoteBlockComponent } from "@/types/zenith-content";

export function QuoteBlockMicroProof({ component }: { component: QuoteBlockComponent }) {
  if (!component.quote?.trim()) return null;
  const light = component.theme === "light";
  return (
    <figure className={`qb-micro-proof${light ? " light" : ""}`}>
      <p className="qbmp-line">
        {component.speakerLabel ? (
          <span className="qbmp-label">{component.speakerLabel}</span>
        ) : null}
        {component.quote}
      </p>
      {component.reviewLine ? (
        <p className="qbmp-line review">
          {component.reviewLabel ? (
            <span className="qbmp-label">{component.reviewLabel}</span>
          ) : null}
          {component.reviewLine}
        </p>
      ) : null}
    </figure>
  );
}
