/** GTM dataLayer event fired after a successful lead form redirect lands on a thank-you page. */
export const FORM_SUBMISSION_CONVERSION_EVENT = "form_submission";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function isThankYouConversionPage(page: { contentType: string; slug: string }): boolean {
  if (page.contentType === "thank_you_page") return true;
  if (page.contentType === "cta_page" && page.slug.startsWith("thank-you")) return true;
  return false;
}

export type FormSubmissionConversionPayload = {
  pageSlug: string;
  contentType: string;
  pagePath?: string;
};

/** Push once per thank-you page view for GTM → Google Ads / GA4 conversion tags. */
export function pushFormSubmissionConversion(payload: FormSubmissionConversionPayload): void {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({
    event: FORM_SUBMISSION_CONVERSION_EVENT,
    page_slug: payload.pageSlug,
    page_type: payload.contentType,
    page_path: payload.pagePath ?? window.location.pathname,
  });
}
