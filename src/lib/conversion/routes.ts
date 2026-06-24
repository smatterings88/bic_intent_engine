/**
 * Public Sherpa / webinar links (NEXT_PUBLIC_*). Used for post–opt-in CTAs only.
 */
export function getConversionUrl(nextStep?: string): string | null {
  const step = nextStep?.trim();
  if (!step) return null;

  const demo = process.env.NEXT_PUBLIC_SHERPA_DEMO_URL?.trim();
  const webinar = process.env.NEXT_PUBLIC_WEBINAR_URL?.trim();
  const offer = process.env.NEXT_PUBLIC_SHERPA_OFFER_URL?.trim();

  switch (step) {
    case "webinar":
      return webinar || null;
    case "upload":
    case "book_call":
      return demo || null;
    case "sherpa_offer":
      return offer || null;
    case "download":
      return null;
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
      return "Go to the Sherpa demo";
    case "book_call":
      return "Book a call";
    case "sherpa_offer":
      return "See the Sherpa offer";
    default:
      return "Continue";
  }
}
