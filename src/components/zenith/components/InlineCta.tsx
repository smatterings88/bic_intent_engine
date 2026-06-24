import { getInlineCtaTheme } from "@/lib/zenith/theme";
import type { InlineCtaComponent } from "@/types/zenith-content";

import { ZenithCtaButton } from "@/components/zenith/components/ZenithCtaButton";
import type { ZenithComponentRenderContext } from "@/components/zenith/types";

function paragraphs(body?: string): string[] {
  if (!body?.trim()) return [];
  return body
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function InlineCta({
  component,
  page,
}: {
  component: InlineCtaComponent;
  page: ZenithComponentRenderContext["page"];
}) {
  const { wrapperClass, visual } = getInlineCtaTheme(component.variant);
  const paras = paragraphs(component.body);
  const isFull = visual === "full-block";
  if (!component.headline && !component.subtext && !paras.length && !component.cta) return null;

  const inner = (
    <div className={isFull ? "mx-auto max-w-3xl px-4 py-2" : ""}>
      {component.headline ? (
        <h3
          className={`font-serif text-xl font-bold sm:text-2xl ${
            isFull ? "text-white" : "text-slate-900"
          }`}
        >
          {component.headline}
        </h3>
      ) : null}
      {component.subtext ? (
        <p
          className={`mt-3 text-sm leading-relaxed ${isFull ? "text-white/90" : "text-slate-600"}`}
        >
          {component.subtext}
        </p>
      ) : null}
      {paras.map((p) => (
        <p
          key={p.slice(0, 20)}
          className={`mt-3 text-sm leading-relaxed sm:text-base ${
            isFull ? "text-white/90" : "text-slate-700"
          }`}
        >
          {p}
        </p>
      ))}
      {component.cta ? (
        <div className="mt-6">
          <ZenithCtaButton cta={component.cta} page={page} variant={isFull ? "light" : "primary"} />
        </div>
      ) : null}
    </div>
  );

  return <div className={`my-10 ${wrapperClass}`}>{inner}</div>;
}
