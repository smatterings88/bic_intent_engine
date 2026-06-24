import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { isGlobalSiteFooterVisible } from "../src/components/site/ZenithSiteLayoutContext";
import {
  extractTopLevelMarketingSlug,
  shouldHideGlobalSiteFooter,
} from "../src/lib/zenith/page-layout";
import { renderSanitizedHtmlWithSlots } from "../src/lib/zenith/render-html-with-slots";
import { validateZenithPagePayload } from "../src/lib/zenith/validation";
import type { ZenithPage } from "../src/types/zenith-content";

type LayoutPagePick = Pick<ZenithPage, "renderMode" | "html" | "layout">;
import {
  sanitizeZenithCss,
  zenithHtmlScopeSelector,
  assertSafeZenithCssRaw,
} from "../src/lib/zenith/zenith-css-safety";

const SLUG = "why-good-calls-dont-close";

function expectThrows(fn: () => void, includes: string) {
  let msg = "";
  try {
    fn();
    assert.fail("Expected throw");
  } catch (e) {
    msg = e instanceof Error ? e.message : String(e);
  }
  assert.ok(msg.includes(includes), `Expected "${includes}" in "${msg}"`);
}

function testCssSanitizer() {
  const scoped = sanitizeZenithCss(
    `.hero h1 { color: #1e3560; font-size: 2.5rem; }
@media (max-width: 768px) { .hero h1 { font-size: 1.75rem; } }`,
    SLUG,
  );
  const scope = zenithHtmlScopeSelector(SLUG);
  assert.ok(scoped.includes(scope), "scopes standard selectors");
  assert.ok(scoped.includes("@media"), "preserves @media");
  assert.ok(!scoped.includes("@import"), "no import");

  expectThrows(() => assertSafeZenithCssRaw("@import url('x.css');"), "@import");
  expectThrows(
    () => assertSafeZenithCssRaw(".x { background: url(https://evil.com/a.png); }"),
    "url",
  );
  expectThrows(() => sanitizeZenithCss("body { margin: 0; }", SLUG), "global selector");
  expectThrows(() => sanitizeZenithCss(".a { behavior: url(x); }", SLUG), "behavior");
}

function testHtmlBodyRejectsStyle() {
  const v = validateZenithPagePayload(
    {
      id: "style-test",
      source: "zenithmind",
      contentType: "landing_page",
      renderMode: "html_snippet",
      slug: "style-test",
      html: {
        body: '<main><style>.x{color:red}</style><div data-sbi-slot="lead-form"></div></main>',
      },
      slots: [
        {
          slot: "lead-form",
          type: "lead-form",
          destination: "lead-magnet:x",
          successBehavior: { type: "redirect", targetType: "thank_you_page", targetSlug: "ty-x" },
        },
      ],
      components: [],
    },
    { deferLandingThankYou: true },
  );
  assert.ok(!v.ok, "expected style tag in body to fail validation");
  assert.ok(
    v.errors?.some((e) => /forbidden|style/i.test(e)),
    v.errors?.join("; "),
  );
}

function testSlotRendersInsideWrapper() {
  const html = '<div class="slot-wrap"><div data-sbi-slot="lead-form-primary"></div></div>';
  const markup = renderToStaticMarkup(
    <>
      {renderSanitizedHtmlWithSlots(html, (slotId) => (
        <section id={`zenith-form-${slotId}`}>FORM</section>
      ))}
    </>,
  );
  assert.ok(markup.includes('class="slot-wrap"'), "preserves slot-wrap wrapper");
  assert.ok(markup.includes("zenith-form-lead-form-primary"), "form renders inside wrapper");
  const wrapOpen = markup.indexOf('class="slot-wrap"');
  const formPos = markup.indexOf("zenith-form-lead-form-primary");
  const wrapClose = markup.lastIndexOf("</div>");
  assert.ok(
    wrapOpen >= 0 && formPos > wrapOpen && formPos < wrapClose,
    "form is nested in slot-wrap",
  );
}

function testGlobalFooterGateSsr() {
  assert.equal(isGlobalSiteFooterVisible(false), true, "global footer shown by default");
  assert.equal(
    isGlobalSiteFooterVisible(true),
    false,
    "global footer hidden when hideGlobalFooter true",
  );
  assert.equal(
    isGlobalSiteFooterVisible(shouldHideGlobalSiteFooter({
      renderMode: "html_snippet",
      html: { body: "<main></main>" },
      layout: { hideGlobalFooter: true },
    })),
    false,
  );
  assert.equal(
    isGlobalSiteFooterVisible(shouldHideGlobalSiteFooter({
      renderMode: "html_snippet",
      layout: { hideGlobalFooter: false },
    })),
    true,
  );
}

function testTopLevelSlugExtraction() {
  assert.equal(extractTopLevelMarketingSlug("/what-your-recordings-reveal"), "what-your-recordings-reveal");
  assert.equal(extractTopLevelMarketingSlug("/articles/foo"), null);
  assert.equal(extractTopLevelMarketingSlug("/about"), null);
}

function testHideGlobalFooterRules() {
  const htmlSnippet: LayoutPagePick = {
    renderMode: "html_snippet",
    html: { body: "<main></main>", sanitizedBody: "<main></main>" },
    layout: { hideGlobalFooter: true },
  };
  assert.equal(shouldHideGlobalSiteFooter(htmlSnippet), true);

  assert.equal(
    shouldHideGlobalSiteFooter({
      renderMode: "html_snippet",
      html: { body: "<main></main>" },
      layout: { hideGlobalFooter: false },
    }),
    false,
  );

  assert.equal(
    shouldHideGlobalSiteFooter({
      renderMode: "components",
      layout: { hideGlobalFooter: true },
    }),
    false,
    "structured pages keep global footer even if flag is set",
  );

  assert.equal(
    shouldHideGlobalSiteFooter({
      renderMode: "components",
    }),
    false,
    "default structured page shows global footer",
  );
}

function testIngestPayload() {
  const payload = {
    id: SLUG,
    source: "zenithmind",
    contentType: "landing_page",
    renderMode: "html_snippet",
    status: "draft",
    slug: SLUG,
    title: "Custom prototype LP",
    seo: {
      metaTitle: "Custom LP | SBI",
      metaDescription: "Prototype landing page with scoped CSS.",
      canonicalPath: `/${SLUG}`,
      noindex: true,
    },
    ogImage: { template: "forensic-article" },
    html: {
      framework: "custom",
      body: `<main class="hero"><h1>Hello</h1><div data-sbi-slot="lead-form"></div></main>`,
      css: `.hero h1 { color: #1e3560; }`,
    },
    slots: [
      {
        slot: "lead-form",
        type: "lead-form",
        variant: "lead-magnet-capture",
        destination: "lead-magnet:test",
        fields: ["name", "email"],
        successBehavior: {
          type: "redirect",
          targetType: "thank_you_page",
          targetSlug: "thank-you-test",
        },
      },
    ],
    components: [],
    schema: { type: "WebPage" },
  };

  const v = validateZenithPagePayload(payload, { deferLandingThankYou: true });
  assert.ok(v.ok, v.errors?.join("; "));
  assert.ok(v.normalized?.html?.sanitizedCss?.includes(zenithHtmlScopeSelector(SLUG)));
  assert.ok(v.normalized?.html?.sanitizedBody?.includes("data-sbi-slot"));
  assert.equal(v.normalized?.layout?.hideGlobalFooter, undefined);
}

function testIngestPayloadWithLayout() {
  const v = validateZenithPagePayload(
    {
      id: SLUG,
      source: "zenithmind",
      contentType: "landing_page",
      renderMode: "html_snippet",
      slug: SLUG,
      title: "Custom LP",
      seo: {
        metaTitle: "Custom LP",
        metaDescription: "Test",
        canonicalPath: `/${SLUG}`,
      },
      ogImage: { template: "forensic-article" },
      layout: { hideGlobalFooter: true },
      html: {
        framework: "custom",
        body: '<main><footer class="site-footer">Zenith footer</footer></main>',
      },
      slots: [
        {
          slot: "lead-form",
          type: "lead-form",
          destination: "lead-magnet:test",
          successBehavior: {
            type: "redirect",
            targetType: "thank_you_page",
            targetSlug: "thank-you-test",
          },
        },
      ],
      components: [],
    },
    { deferLandingThankYou: true },
  );
  assert.ok(v.ok, v.errors?.join("; "));
  assert.equal(v.normalized?.layout?.hideGlobalFooter, true);
  assert.equal(shouldHideGlobalSiteFooter(v.normalized!), true);
}

function main() {
  testCssSanitizer();
  testHtmlBodyRejectsStyle();
  testSlotRendersInsideWrapper();
  testGlobalFooterGateSsr();
  testTopLevelSlugExtraction();
  testHideGlobalFooterRules();
  testIngestPayload();
  testIngestPayloadWithLayout();
  process.stdout.write("Zenith HTML/CSS validation checks passed.\n");
}

main();
