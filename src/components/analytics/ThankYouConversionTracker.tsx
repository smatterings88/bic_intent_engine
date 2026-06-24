"use client";

import { useEffect, useRef } from "react";

import { pushFormSubmissionConversion } from "@/lib/analytics/data-layer";

/** Fires a GTM dataLayer conversion event once when a public thank-you page mounts. */
export function ThankYouConversionTracker({
  pageSlug,
  contentType,
}: {
  pageSlug: string;
  contentType: string;
}) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    pushFormSubmissionConversion({ pageSlug, contentType });
  }, [pageSlug, contentType]);

  return null;
}
