/**
 * Public webinar links (NEXT_PUBLIC_*). Used for post–opt-in CTAs only.
 */
export function getConversionUrl(nextStep?: string): string | null {
  const step = nextStep?.trim();
  if (!step) return null;

  const webinar = process.env.NEXT_PUBLIC_WEBINAR_URL?.trim();

  switch (step) {
    case "webinar":
      return webinar || null;
    case "download":
      return null;
    case "upload":
    case "book_call":
    case "sherpa_offer":
    default:
      return null;
  }
}

export function getConversionCtaLabel(nextStep?: string): string {
  const step = nextStep?.trim() ?? "";
  switch (step) {
    case "download":
      return "Get the resource";
    case "webinar":
      return "Watch the training";
    case "upload":
      return "Upload your materials";
    case "book_call":
      return "Book a call";
    default:
      return "Continue";
  }
}
