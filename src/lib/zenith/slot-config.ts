import { normalizeSlug } from "@/lib/content/slug";
import { resolveThankYouPageUrl } from "@/lib/zenith/lead-form-rules";
import { getPublicPathForZenithPage } from "@/lib/zenith/routes";
import type {
  GhlTagStrategy,
  LeadFormComponent,
  ZenithPage,
  ZenithRelationship,
  ZenithSlotConfig,
  ZenithSuccessBehavior,
} from "@/types/zenith-content";

export function successBehaviorToThankYouPath(
  behavior: ZenithSuccessBehavior | undefined,
): string | undefined {
  if (!behavior || behavior.type !== "redirect") return undefined;
  if (behavior.targetType !== "thank_you_page") return undefined;
  const slug = behavior.targetSlug?.trim();
  if (!slug) return undefined;
  const clean = normalizeSlug(slug.replace(/^\/+|\/+$/g, ""));
  return `/${clean}`;
}

export function slotConfigToLeadForm(
  slot: ZenithSlotConfig,
  page: Pick<ZenithPage, "contentType">,
): LeadFormComponent | null {
  if (slot.type !== "lead-form") return null;
  if (!slot.destination?.trim()) return null;

  const redirectPath = successBehaviorToThankYouPath(slot.successBehavior);
  const thankYouPageUrl =
    redirectPath ?? resolveThankYouPageUrl(slot.thankYouPageUrl, slot.redirect);

  let fields = slot.fields;
  if (page.contentType === "landing_page") {
    fields = ["name", "email"];
  }

  return {
    type: "lead-form",
    variant: slot.variant ?? "lead-magnet-capture",
    destination: slot.destination.trim(),
    headline: slot.headline,
    description: slot.description,
    ctaText: slot.ctaText,
    fields,
    ghlTagStrategy: slot.ghlTagStrategy,
    ghlTags: slot.ghlTags,
    thankYouMessage: slot.thankYouMessage,
    thankYouPageUrl,
    redirect: slot.redirect,
  };
}

export function findPageSlot(page: ZenithPage, slotId: string): ZenithSlotConfig | undefined {
  const id = slotId.trim();
  if (!id || !page.slots?.length) return undefined;
  return page.slots.find((s) => s.slot === id);
}

export type ResolvedZenithFormSource = {
  source: "slot" | "component" | "forensic";
  slotId?: string;
  destination: string;
  variant: string;
  thankYouMessage?: string;
  thankYouPageUrl?: string;
  successBehavior?: ZenithSuccessBehavior;
  pageStrategy?: GhlTagStrategy;
  componentStrategy?: GhlTagStrategy;
  legacyComponentTags?: string[];
};

export function resolveStoredFormSource(
  page: ZenithPage,
  input: { destination: string; variant: string; slot?: string },
): ResolvedZenithFormSource | null {
  const destination = input.destination.trim();
  const variant = input.variant.trim();
  const slotId = input.slot?.trim();

  if (slotId) {
    const slot = findPageSlot(page, slotId);
    if (!slot || slot.type !== "lead-form") return null;
    if (slot.destination?.trim() !== destination) return null;
    const form = slotConfigToLeadForm(slot, page);
    if (!form) return null;
    return {
      source: "slot",
      slotId,
      destination: form.destination,
      variant: form.variant,
      thankYouMessage: form.thankYouMessage,
      thankYouPageUrl: form.thankYouPageUrl,
      successBehavior: slot.successBehavior,
      pageStrategy: page.ghlTagStrategy,
      componentStrategy: slot.ghlTagStrategy,
      legacyComponentTags: slot.ghlTags,
    };
  }

  const forms = page.components.filter((c) => c.type === "lead-form");
  const match = forms.find(
    (f) =>
      f.destination === destination && (!variant || f.variant === variant || forms.length === 1),
  );
  if (match) {
    return {
      source: "component",
      destination: match.destination,
      variant: match.variant,
      thankYouMessage: match.thankYouMessage,
      thankYouPageUrl: resolveThankYouPageUrl(match.thankYouPageUrl, match.redirect),
      pageStrategy: page.ghlTagStrategy,
      componentStrategy: match.ghlTagStrategy,
      legacyComponentTags: match.ghlTags,
    };
  }

  const forensic = page.components.find(
    (c) => c.type === "forensic-download-section" && c.form?.destination === destination,
  );
  if (forensic?.type === "forensic-download-section" && forensic.form) {
    const f = forensic.form;
    return {
      source: "forensic",
      destination,
      variant: f.variant ?? variant,
      thankYouMessage: f.thankYouMessage,
      thankYouPageUrl: resolveThankYouPageUrl(f.thankYouPageUrl, f.redirect),
      pageStrategy: page.ghlTagStrategy,
      componentStrategy: f.ghlTagStrategy,
      legacyComponentTags: f.ghlTags,
    };
  }

  return null;
}

export function resolveSuccessRedirectUrl(
  page: ZenithPage,
  formSource: ResolvedZenithFormSource | null,
): string | undefined {
  const fromBehavior = successBehaviorToThankYouPath(formSource?.successBehavior);
  if (fromBehavior) return fromBehavior;
  if (formSource?.thankYouPageUrl?.trim()) return formSource.thankYouPageUrl.trim();
  return undefined;
}

export function applyBatchRelationships(
  pages: ZenithPage[],
  relationships: ZenithRelationship[] | undefined,
  errors: string[],
): void {
  if (!relationships?.length) return;

  const bySlug = new Map(pages.map((p) => [p.slug, p]));

  for (const rel of relationships) {
    if (rel.type !== "form_success_redirect") {
      errors.push(`Unsupported relationship type: ${rel.type}`);
      continue;
    }
    const from = bySlug.get(rel.from);
    const to = bySlug.get(rel.to);
    if (!from) {
      errors.push(`relationship.from "${rel.from}" not found in batch`);
      continue;
    }
    if (!to) {
      errors.push(`relationship.to "${rel.to}" not found in batch`);
      continue;
    }
    if (to.contentType !== "thank_you_page" && to.contentType !== "cta_page") {
      errors.push(`relationship.to "${rel.to}" must be contentType thank_you_page or cta_page`);
    }
    const slotName = rel.slot?.trim();
    if (!slotName) {
      errors.push(`relationship for "${rel.from}" requires slot`);
      continue;
    }
    if (!from.slots?.some((s) => s.slot === slotName && s.type === "lead-form")) {
      errors.push(`relationship slot "${slotName}" not found as lead-form on page "${rel.from}"`);
      continue;
    }

    for (const slot of from.slots ?? []) {
      if (slot.slot !== slotName) continue;
      slot.successBehavior = {
        type: "redirect",
        targetType: "thank_you_page",
        targetSlug: rel.to,
      };
      slot.thankYouPageUrl = getPublicPathForZenithPage(to);
    }
  }
}

export function validateSlotRedirectTargets(
  pages: ZenithPage[],
  errors: string[],
  warnings: string[],
  extraSlugs?: Iterable<string>,
): void {
  const slugs = new Set(pages.map((p) => p.slug));
  if (extraSlugs) {
    for (const s of extraSlugs) {
      slugs.add(s);
    }
  }

  for (const page of pages) {
    for (const slot of page.slots ?? []) {
      if (slot.successBehavior?.type === "redirect") {
        const target = slot.successBehavior.targetSlug?.trim();
        if (!target) {
          errors.push(`${page.slug}: slot "${slot.slot}" redirect missing targetSlug`);
          continue;
        }
        const norm = normalizeSlug(target.replace(/^\/+|\/+$/g, ""));
        if (!slugs.has(norm) && !slugs.has(target)) {
          errors.push(
            `${page.slug}: slot "${slot.slot}" redirect target "${target}" not in batch (publish target TY page first or include in batch)`,
          );
        }
      }
      if (slot.type === "lead-form" && !slot.destination?.trim()) {
        errors.push(`${page.slug}: slot "${slot.slot}" requires destination`);
      }
    }

    if (page.contentType === "thank_you_page" && page.seo?.noindex === false) {
      warnings.push(`${page.slug}: thank_you_page should usually have seo.noindex true`);
    }
  }
}
