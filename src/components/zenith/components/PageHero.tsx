import type { PageHeroComponent, ZenithPage } from "@/types/zenith-content";

import { ZenithCtaButton } from "@/components/zenith/components/ZenithCtaButton";
import { PageHeroForensicNavy } from "@/components/zenith/variants/PageHeroForensicNavy";
import { PageHeroToolStrip } from "@/components/zenith/variants/PageHeroToolStrip";
import type { ZenithComponentRenderContext } from "@/components/zenith/types";
import type { ZenithPageTheme } from "@/lib/zenith/theme";

export function PageHero({
  component,
  page,
  theme,
  isArticle,
}: {
  component: PageHeroComponent;
  page: ZenithPage;
  theme: ZenithPageTheme;
} & Pick<ZenithComponentRenderContext, "isArticle">) {
  if (component.variant === "forensic-navy") {
    return (
      <PageHeroForensicNavy component={component} page={page} isArticle={Boolean(isArticle)} />
    );
  }
  if (component.variant === "tool-strip") {
    return <PageHeroToolStrip component={component} page={page} isArticle={Boolean(isArticle)} />;
  }

  const isWebinar = theme.shell === "webinar" || component.variant === "webinar";
  const isMinimal = component.variant === "minimal";
  const wrapClass = isWebinar
    ? "rounded-2xl border border-white/10 bg-white/5 px-5 py-10 sm:px-10"
    : isMinimal
      ? "py-8"
      : "rounded-2xl border border-slate-200/80 bg-white/60 px-5 py-10 shadow-sm sm:px-10";

  const HeadTag = isArticle ? "h2" : "h1";

  return (
    <header className={`${wrapClass} my-6`}>
      {component.eyebrow ? (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          {component.eyebrow}
        </p>
      ) : null}
      {component.headline ? (
        <HeadTag
          className={`font-serif font-bold tracking-tight ${
            isWebinar ? "text-3xl text-white sm:text-4xl" : "text-3xl text-slate-900 sm:text-4xl"
          }`}
        >
          {component.headline}
        </HeadTag>
      ) : null}
      {component.subheadline ? (
        <p
          className={`mt-4 max-w-3xl text-lg leading-relaxed ${
            isWebinar ? "text-white/85" : "text-slate-600"
          }`}
        >
          {component.subheadline}
        </p>
      ) : null}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        {component.primaryCta ? (
          <ZenithCtaButton
            cta={component.primaryCta}
            page={page}
            variant={isWebinar ? "light" : "primary"}
          />
        ) : null}
        {component.secondaryCta ? (
          <ZenithCtaButton
            cta={component.secondaryCta}
            page={page}
            variant={isWebinar ? "secondary" : "secondary"}
            className={isWebinar ? "border-white text-white" : ""}
          />
        ) : null}
      </div>
    </header>
  );
}
