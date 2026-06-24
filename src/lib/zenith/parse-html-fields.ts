import { parseZenithHtmlFramework } from "@/lib/zenith/parse-html-framework";
import { successBehaviorToThankYouPath } from "@/lib/zenith/slot-config";
import { sanitizeZenithCss } from "@/lib/zenith/zenith-css-safety";
import { sanitizeZenithHtmlBody, extractSlotIdsFromHtml } from "@/lib/zenith/sanitize-html";
import type {
  ZenithHtmlSnippet,
  ZenithPageRenderMode,
  ZenithSlotConfig,
  ZenithSuccessBehavior,
} from "@/types/zenith-content";

import { parseGhlTagStrategy } from "@/lib/ghl/tag-strategy";

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const item of value) {
    if (typeof item === "string" && item.trim()) out.push(item.trim());
  }
  return out;
}

export function parseRenderMode(raw: unknown, hasHtml: boolean): ZenithPageRenderMode {
  if (raw === "html_snippet" || raw === "hybrid" || raw === "components") {
    return raw;
  }
  if (hasHtml) return "html_snippet";
  return "components";
}

export function parseSuccessBehavior(raw: unknown): ZenithSuccessBehavior | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const type = o.type;
  if (type === "inline_message") {
    const message = str(o.message);
    if (!message) return undefined;
    return { type: "inline_message", message };
  }
  if (type === "redirect" && o.targetType === "thank_you_page") {
    const targetSlug = str(o.targetSlug);
    if (!targetSlug) return undefined;
    return { type: "redirect", targetType: "thank_you_page", targetSlug };
  }
  return undefined;
}

export type ParseZenithHtmlSnippetOptions = {
  pageSlug?: string;
};

export function parseZenithHtmlSnippet(
  raw: unknown,
  errors: string[],
  label: string,
  options?: ParseZenithHtmlSnippetOptions,
): ZenithHtmlSnippet | undefined {
  if (raw === undefined || raw === null) {
    return undefined;
  }
  if (typeof raw !== "object") {
    errors.push(`${label}: html must be an object`);
    return undefined;
  }
  const o = raw as Record<string, unknown>;
  const body = typeof o.body === "string" ? o.body : "";
  if (!body.trim()) {
    errors.push(`${label}: html.body is required`);
    return undefined;
  }

  const framework = parseZenithHtmlFramework(o.framework);
  const cssRaw = typeof o.css === "string" ? o.css : undefined;

  if (cssRaw !== undefined && typeof o.css !== "string") {
    errors.push(`${label}: html.css must be a string when present`);
    return undefined;
  }

  if (cssRaw?.trim() && !options?.pageSlug?.trim()) {
    errors.push(`${label}: page slug is required to sanitize html.css`);
    return undefined;
  }

  try {
    const sanitizedBody = sanitizeZenithHtmlBody(body);
    let sanitizedCss: string | undefined;
    let css: string | undefined;

    if (cssRaw?.trim()) {
      css = cssRaw;
      sanitizedCss = sanitizeZenithCss(cssRaw, options!.pageSlug!.trim());
      if (!sanitizedCss.trim()) {
        errors.push(`${label}: html.css was empty after sanitization`);
        return undefined;
      }
    }

    return {
      framework,
      body,
      sanitizedBody,
      ...(css ? { css } : {}),
      ...(sanitizedCss ? { sanitizedCss } : {}),
    };
  } catch (e) {
    errors.push(`${label}: ${e instanceof Error ? e.message : String(e)}`);
    return undefined;
  }
}

export function parseZenithSlots(
  raw: unknown,
  errors: string[],
  warnings: string[],
): ZenithSlotConfig[] {
  void warnings;
  if (!Array.isArray(raw)) return [];
  const slots: ZenithSlotConfig[] = [];
  raw.forEach((item, index) => {
    if (!item || typeof item !== "object") {
      errors.push(`slots[${index}] must be an object`);
      return;
    }
    const o = item as Record<string, unknown>;
    const slot = str(o.slot);
    const type = o.type;
    if (!slot) {
      errors.push(`slots[${index}] requires slot`);
      return;
    }
    if (type !== "lead-form" && type !== "cta") {
      errors.push(`slots[${index}] type must be lead-form or cta`);
      return;
    }
    const successBehavior = parseSuccessBehavior(o.successBehavior);
    if (o.successBehavior && !successBehavior) {
      errors.push(`slots[${index}] invalid successBehavior`);
      return;
    }
    const ghlTagStrategy = parseGhlTagStrategy(o.ghlTagStrategy);
    const redirectPath = successBehaviorToThankYouPath(successBehavior);
    const thankYouPageUrl = str(o.thankYouPageUrl) ?? str(o.redirect) ?? redirectPath;
    const config: ZenithSlotConfig = {
      slot,
      type,
      variant: str(o.variant),
      destination: str(o.destination),
      headline: str(o.headline),
      description: str(o.description),
      ctaText: str(o.ctaText),
      fields: parseStringArray(o.fields),
      successBehavior,
      ghlTagStrategy,
      ghlTags: ghlTagStrategy ? [] : parseStringArray(o.ghlTags),
      thankYouMessage: str(o.thankYouMessage),
      thankYouPageUrl,
      redirect: str(o.redirect),
      label: str(o.label),
      href: str(o.href),
    };
    if (type === "lead-form" && !config.destination) {
      errors.push(`slots[${index}] lead-form requires destination`);
      return;
    }
    slots.push(config);
  });
  return slots;
}

export function validateHtmlSlotsAlignment(
  html: ZenithHtmlSnippet | undefined,
  slots: ZenithSlotConfig[],
  errors: string[],
  warnings: string[],
): void {
  if (!html?.sanitizedBody) return;
  const found = extractSlotIdsFromHtml(html.sanitizedBody);
  for (const id of found) {
    const leadSlots = slots.filter((s) => s.type === "lead-form");
    if (leadSlots.length && !slots.some((s) => s.slot === id)) {
      errors.push(`HTML references data-sbi-slot="${id}" but no matching slots[] entry`);
    }
  }
  for (const slot of slots) {
    if (!found.includes(slot.slot)) {
      warnings.push(`slots[] entry "${slot.slot}" not found in HTML (unused slot)`);
    }
  }
}
