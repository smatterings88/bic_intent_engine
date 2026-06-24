"use client";

import Link from "next/link";

import { LeadForm } from "@/components/zenith/components/LeadForm";
import { shouldLoadBootstrapCss } from "@/lib/zenith/parse-html-framework";
import {
  createSlotRenderer,
  renderSanitizedHtmlWithSlots,
} from "@/lib/zenith/render-html-with-slots";
import { slotConfigToLeadForm } from "@/lib/zenith/slot-config";
import { ZENITH_HTML_SNIPPET_CLASS } from "@/lib/zenith/zenith-css-safety";
import type { ZenithHtmlSnippet, ZenithPage, ZenithSlotConfig } from "@/types/zenith-content";

function BootstrapStyles() {
  return (
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
      integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXg0+tmH55Xt/z2n0GB0"
      crossOrigin="anonymous"
    />
  );
}

function ScopedPageCss({ css }: { css: string }) {
  if (!css.trim()) return null;
  return <style data-zenith-scoped-css="true" dangerouslySetInnerHTML={{ __html: css }} />;
}

function SlotCta({ slot }: { slot: ZenithSlotConfig }) {
  const href = slot.href?.trim() || "#";
  const label = slot.ctaText?.trim() || slot.label?.trim() || "Continue";
  if (href.startsWith("/") || href.startsWith("http://") || href.startsWith("https://")) {
    if (href.startsWith("/")) {
      return (
        <Link href={href} className="btn btn-primary">
          {label}
        </Link>
      );
    }
    return (
      <a href={href} className="btn btn-primary" rel="noopener noreferrer" target="_blank">
        {label}
      </a>
    );
  }
  return <span className="text-sm text-amber-800">Invalid CTA href for slot {slot.slot}</span>;
}

export function ZenithHtmlRenderer({
  page,
  html,
  slots = [],
}: {
  page: ZenithPage;
  html: ZenithHtmlSnippet;
  slots?: ZenithSlotConfig[];
}) {
  const body = html.sanitizedBody?.trim() || html.body?.trim() || "";
  const scopedCss = html.sanitizedCss?.trim() || "";

  const renderSlot = createSlotRenderer({
    page,
    slots,
    renderMissing: (slotId) => (
      <div className="my-4 rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        Missing slot configuration for <code>{slotId}</code>
      </div>
    ),
    renderInvalid: (slotId) => (
      <div className="my-4 rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
        Invalid lead-form slot <code>{slotId}</code>
      </div>
    ),
    renderLeadForm: (slotId, config) => {
      const form = slotConfigToLeadForm(config, page);
      if (!form) {
        return (
          <div className="my-4 rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
            Invalid lead-form slot <code>{slotId}</code>
          </div>
        );
      }
      return (
        <LeadForm
          component={form}
          pageSlug={page.slug}
          contentType={page.contentType}
          slotId={slotId}
          successBehavior={config.successBehavior}
        />
      );
    },
    renderCta: (slotId, config) => (
      <div className="my-6" data-zenith-slot-cta={slotId}>
        <SlotCta slot={config} />
      </div>
    ),
  });

  const parsedBody = renderSanitizedHtmlWithSlots(body, renderSlot);

  return (
    <div
      className={ZENITH_HTML_SNIPPET_CLASS}
      data-zenith-page={page.slug}
      data-render-mode="html_snippet"
    >
      {shouldLoadBootstrapCss(html.framework) ? <BootstrapStyles /> : null}
      <ScopedPageCss css={scopedCss} />
      <div className="zenith-html-snippet-body">{parsedBody}</div>
    </div>
  );
}
