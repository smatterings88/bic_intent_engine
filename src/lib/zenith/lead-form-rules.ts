import { successBehaviorToThankYouPath } from "@/lib/zenith/slot-config";
import { getPageRenderMode } from "@/lib/zenith/render-mode";
import type {
  LeadFormComponent,
  ZenithComponent,
  ZenithContentType,
  ZenithPage,
  ZenithSlotConfig,
} from "@/types/zenith-content";

/** Required on every opt-in form for `landing_page`. */
export const LANDING_LEAD_FORM_FIELDS = ["name", "email"] as const;

export function resolveThankYouPageUrl(
  thankYouPageUrl?: string,
  redirect?: string,
): string | undefined {
  const raw = thankYouPageUrl?.trim() || redirect?.trim();
  return raw || undefined;
}

/** Normalize path or absolute URL for client redirect after submit. */
export function normalizeThankYouPageUrlForRedirect(url: string): string {
  const t = url.trim();
  if (!t) return t;
  if (t.startsWith("http://") || t.startsWith("https://") || t.startsWith("/")) {
    return t;
  }
  return `/${t.replace(/^\/+/, "")}`;
}

export function resolveLeadFormFields(
  explicit: string[] | undefined,
  contentType: ZenithContentType | undefined,
  variant: string,
): string[] {
  if (contentType === "landing_page") {
    return [...LANDING_LEAD_FORM_FIELDS];
  }
  if (explicit?.length) {
    return explicit;
  }
  if (variant === "webinar-signup") {
    return ["first_name", "email"];
  }
  if (variant === "contact") {
    return ["name", "email", "message"];
  }
  return ["email"];
}

export function applyLandingPageLeadFormDefaults(
  contentType: ZenithContentType,
  components: ZenithComponent[],
): void {
  if (contentType !== "landing_page") return;
  for (const c of components) {
    if (c.type === "lead-form") {
      (c as LeadFormComponent).fields = [...LANDING_LEAD_FORM_FIELDS];
    }
    if (c.type === "forensic-download-section" && c.form) {
      c.form.fields = [...LANDING_LEAD_FORM_FIELDS];
    }
  }
}

function validateLandingLeadFormSlot(
  slot: ZenithSlotConfig,
  errors: string[],
  label: string,
): void {
  if (!slot.destination?.trim()) {
    errors.push(`${label}: lead-form requires destination`);
  }
  const redirect =
    resolveThankYouPageUrl(slot.thankYouPageUrl, slot.redirect) ??
    successBehaviorToThankYouPath(slot.successBehavior);
  if (!redirect) {
    errors.push(
      `${label}: lead-form requires thankYouPageUrl or successBehavior.redirect for landing_page`,
    );
  }
  const fields = slot.fields ?? [];
  if (!fields.includes("name") || !fields.includes("email")) {
    errors.push(`${label}: lead-form fields must include "name" and "email" for landing_page`);
  }
}

export function validateLandingPageLeadForms(
  contentType: ZenithContentType,
  components: ZenithComponent[],
  errors: string[],
  page?: Pick<ZenithPage, "slots" | "renderMode" | "html">,
): void {
  if (contentType !== "landing_page") return;

  const mode = page ? getPageRenderMode(page) : "components";
  const slotForms = (page?.slots ?? []).filter((s) => s.type === "lead-form");
  const hasComponentForms = components.some(
    (c) => c.type === "lead-form" || (c.type === "forensic-download-section" && c.form),
  );

  if ((mode === "html_snippet" || mode === "hybrid") && !hasComponentForms && !slotForms.length) {
    errors.push("landing_page requires at least one lead-form in slots[] or components[]");
  }

  for (const slot of slotForms) {
    validateLandingLeadFormSlot(slot, errors, `slot "${slot.slot}"`);
  }

  components.forEach((c, index) => {
    if (c.type === "lead-form") {
      const form = c as LeadFormComponent;
      if (!resolveThankYouPageUrl(form.thankYouPageUrl, form.redirect)) {
        errors.push(
          `components[${index}] lead-form requires thankYouPageUrl for landing_page (set explicitly, include a paired cta_page in the same bulk ingest, or rely on title-based auto-linking)`,
        );
      }
      const fields = form.fields ?? [];
      if (!fields.includes("name") || !fields.includes("email")) {
        errors.push(
          `components[${index}] lead-form fields must include "name" and "email" for landing_page`,
        );
      }
    }
    if (c.type === "forensic-download-section" && c.form) {
      if (!resolveThankYouPageUrl(c.form.thankYouPageUrl, c.form.redirect)) {
        errors.push(
          `components[${index}] forensic-download-section form requires thankYouPageUrl for landing_page`,
        );
      }
      const fields = c.form.fields ?? [];
      if (!fields.includes("name") || !fields.includes("email")) {
        errors.push(
          `components[${index}] forensic-download-section form fields must include "name" and "email" for landing_page`,
        );
      }
    }
  });
}

export function findLeadFormThankYouPageUrl(
  page: Pick<{ components: ZenithComponent[] }, "components"> | null | undefined,
  destination: string,
  variant?: string,
): string | undefined {
  if (!page?.components?.length) return undefined;
  const dest = destination.trim();
  const forms = page.components.filter((c): c is LeadFormComponent => c.type === "lead-form");
  const match = forms.find(
    (f) => f.destination === dest && (!variant || f.variant === variant || forms.length === 1),
  );
  if (match) {
    return resolveThankYouPageUrl(match.thankYouPageUrl, match.redirect);
  }
  for (const c of page.components) {
    if (c.type === "forensic-download-section" && c.form?.destination === dest) {
      return resolveThankYouPageUrl(c.form.thankYouPageUrl, c.form.redirect);
    }
  }
  return undefined;
}
