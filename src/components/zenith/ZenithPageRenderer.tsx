"use client";

import type { ReactNode } from "react";
import type { PageHeroComponent } from "@/types/zenith-content";
import type { RelatedZenithCard } from "@/lib/zenith/related";
import type { ZenithPage } from "@/types/zenith-content";

import { RelatedArticlesSection } from "@/components/zenith/components/RelatedArticles";
import { ZenithSchemaJsonLd } from "@/components/zenith/components/ZenithSchemaJsonLd";
import type { ZenithRenderMode } from "@/components/zenith/types";
import { ZenithArticleShell } from "@/components/zenith/ZenithArticleShell";
import { ZenithCtaShell } from "@/components/zenith/ZenithCtaShell";
import { ZenithComponentRenderer } from "@/components/zenith/ZenithComponentRenderer";
import { ZenithHtmlSnippetShell } from "@/components/zenith/ZenithHtmlSnippetShell";
import { ZenithLandingShell } from "@/components/zenith/ZenithLandingShell";
import { ZenithLeadMagnetShell } from "@/components/zenith/ZenithLeadMagnetShell";
import { ZenithResearchShell } from "@/components/zenith/ZenithResearchShell";
import { ZenithWebinarShell } from "@/components/zenith/ZenithWebinarShell";
import {
  getPageRenderMode,
  getRenderableHtml,
  usesHtmlRendering,
  usesStructuredComponents,
} from "@/lib/zenith/render-mode";
import { getZenithPageTheme } from "@/lib/zenith/theme";
import { ThankYouConversionTracker } from "@/components/analytics/ThankYouConversionTracker";
import { ZenithSiteLayoutRegistrar } from "@/components/site/ZenithSiteLayoutContext";
import { ZenithHtmlRenderer } from "@/components/zenith/ZenithHtmlRenderer";
import { isThankYouConversionPage } from "@/lib/analytics/data-layer";
import { shouldHideGlobalSiteFooter } from "@/lib/zenith/page-layout";

function ZenithFallbackTitle({ page }: { page: ZenithPage }) {
  if (page.contentType === "article") return null;
  const first = page.components?.[0];
  if (first?.type === "page-hero" && (first as PageHeroComponent).headline?.trim()) {
    return null;
  }
  if (getPageRenderMode(page) === "html_snippet") {
    return null;
  }
  if (!page.title?.trim()) return null;
  const dark = page.contentType === "webinar_page" || page.contentType === "cta_page";
  return (
    <header className="mb-8 text-center sm:text-left">
      <h1
        className={`font-serif text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl ${
          dark ? "text-white" : "text-slate-950"
        }`}
      >
        {page.title}
      </h1>
      {page.seo?.metaDescription?.trim() ? (
        <p className={`mt-4 text-lg leading-relaxed ${dark ? "text-white/80" : "text-slate-600"}`}>
          {page.seo.metaDescription}
        </p>
      ) : null}
    </header>
  );
}

export function ZenithPageRenderer({
  page,
  mode,
  relatedCards = [],
  baseUrl,
}: {
  page: ZenithPage;
  mode: ZenithRenderMode;
  relatedCards?: RelatedZenithCard[];
  baseUrl?: string;
}) {
  const theme = getZenithPageTheme(page.contentType);
  const isArticle = page.contentType === "article";
  const renderMode = getPageRenderMode(page);
  const htmlBody = getRenderableHtml(page);
  const showComponents = usesStructuredComponents(page) && page.components.length > 0;
  const showHtml = usesHtmlRendering(page) && htmlBody && page.html;

  const componentFlow = showComponents
    ? page.components.map((c, i) => (
        <ZenithComponentRenderer
          key={`${c.type}-${i}`}
          component={c}
          page={page}
          theme={theme}
          isArticle={isArticle}
        />
      ))
    : null;

  const pageHtmlFlow =
    renderMode === "html_snippet" && showHtml && page.html ? (
      <ZenithHtmlRenderer page={page} html={page.html} slots={page.slots} />
    ) : null;

  const contentFlow = (
    <>
      {pageHtmlFlow}
      {componentFlow}
    </>
  );

  const related = <RelatedArticlesSection items={relatedCards} />;
  const jsonLd = <ZenithSchemaJsonLd page={page} baseUrl={baseUrl} />;

  const previewStrip =
    mode === "preview" ? (
      <>
        {page.status === "draft" ? (
          <div className="border-b border-amber-400/50 bg-amber-50 py-2.5 text-center text-sm font-medium text-amber-950">
            Draft Preview — Not Indexed
          </div>
        ) : null}
        <div className="border-b border-slate-200/80 bg-slate-100/90 px-4 py-2 text-center text-xs text-slate-600">
          <span className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <span className="font-medium capitalize text-slate-800">{page.status}</span>
            <span className="rounded bg-slate-200/80 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide">
              {renderMode}
            </span>
            <span>{page.components.length} components</span>
            {page.slots?.length ? <span>{page.slots.length} slots</span> : null}
            <span className="font-mono text-slate-500">{page.slug}</span>
          </span>
        </div>
      </>
    ) : null;

  let body: ReactNode;
  switch (page.contentType) {
    case "article":
      body = (
        <ZenithArticleShell page={page}>
          {contentFlow}
          {related}
        </ZenithArticleShell>
      );
      break;
    case "landing_page":
      body =
        renderMode === "html_snippet" ? (
          <ZenithHtmlSnippetShell>
            {contentFlow}
            {related}
          </ZenithHtmlSnippetShell>
        ) : (
          <ZenithLandingShell>
            <ZenithFallbackTitle page={page} />
            {contentFlow}
            {related}
          </ZenithLandingShell>
        );
      break;
    case "thank_you_page":
      body =
        renderMode === "html_snippet" ? (
          <ZenithHtmlSnippetShell>{contentFlow}</ZenithHtmlSnippetShell>
        ) : (
          <ZenithLandingShell>
            <ZenithFallbackTitle page={page} />
            {contentFlow}
          </ZenithLandingShell>
        );
      break;
    case "lead_magnet_page":
      body = (
        <ZenithLeadMagnetShell>
          <ZenithFallbackTitle page={page} />
          {contentFlow}
          {related}
        </ZenithLeadMagnetShell>
      );
      break;
    case "webinar_page":
      body = (
        <ZenithWebinarShell>
          <ZenithFallbackTitle page={page} />
          {contentFlow}
          {related}
        </ZenithWebinarShell>
      );
      break;
    case "cta_page":
      body = (
        <ZenithCtaShell>
          <ZenithFallbackTitle page={page} />
          {contentFlow}
        </ZenithCtaShell>
      );
      break;
    case "research_page":
      body = (
        <ZenithResearchShell>
          <ZenithFallbackTitle page={page} />
          {contentFlow}
          {related}
        </ZenithResearchShell>
      );
      break;
    default:
      body = <ZenithArticleShell page={page}>{contentFlow}</ZenithArticleShell>;
  }

  const hideGlobalFooter = shouldHideGlobalSiteFooter(page);
  const trackFormSubmissionConversion = mode === "public" && isThankYouConversionPage(page);

  return (
    <div className={`${theme.pageClassName} overflow-x-hidden`}>
      <ZenithSiteLayoutRegistrar hideGlobalFooter={hideGlobalFooter} />
      {trackFormSubmissionConversion ? (
        <ThankYouConversionTracker pageSlug={page.slug} contentType={page.contentType} />
      ) : null}
      {jsonLd}
      {previewStrip}
      {body}
    </div>
  );
}
