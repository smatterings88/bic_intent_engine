"use client";

import { useState, type FormEvent } from "react";

import { getConversionCtaLabel, getConversionUrl } from "@/lib/conversion/routes";

const NEXT_STEP_LABELS: Record<string, string> = {
  download: "Download your resource",
  webinar: "Join the webinar",
  upload: "Upload your materials",
  book_call: "Book a call",
  sherpa_offer: "Review the Sherpa offer",
};

function labelForNextStep(next?: string): string | null {
  if (!next?.trim()) return null;
  return NEXT_STEP_LABELS[next] ?? next;
}

function readUtmFromSearch(): {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
} {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  const pick = (k: string) => {
    const v = p.get(k)?.trim();
    return v || undefined;
  };
  return {
    source: pick("utm_source"),
    medium: pick("utm_medium"),
    campaign: pick("utm_campaign"),
    term: pick("utm_term"),
    content: pick("utm_content"),
  };
}

export function LandingOptInForm({
  landingPageSlug,
  primaryLeadMagnetId,
  campaignType,
  ghlTags,
  thankYouMessage,
  nextStep,
}: {
  landingPageSlug: string;
  primaryLeadMagnetId: string;
  campaignType: string;
  ghlTags: string[];
  thankYouMessage: string;
  nextStep?: string;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const utm = readUtmFromSearch();
      const sourcePage =
        typeof window !== "undefined" ? window.location.pathname : `/${landingPageSlug}`;
      const res = await fetch("/api/landing-pages/opt-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          phone: phone || undefined,
          landingPageSlug,
          leadMagnetId: primaryLeadMagnetId,
          sourcePage,
          campaignType,
          ghlTags,
          utm: Object.keys(utm).length ? utm : undefined,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: { message?: string } };
      if (!res.ok) {
        setError(data.error?.message ?? "Something went wrong. Please try again.");
        return;
      }
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    const nextLabel = labelForNextStep(nextStep);
    const href = getConversionUrl(nextStep);
    return (
      <div
        className="animate-sbi-fade-in rounded-xl border border-border/80 bg-muted/40 px-5 py-7 sm:px-6 sm:py-8"
        role="status"
        aria-live="polite"
      >
        <p className="text-base leading-relaxed text-foreground">{thankYouMessage}</p>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-5 w-full sm:mt-6 sm:w-auto"
          >
            {getConversionCtaLabel(nextStep ?? "")}
          </a>
        ) : nextLabel ? (
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Next step: <span className="text-foreground">{nextLabel}</span>
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="optin-first" className="block text-xs font-medium text-muted-foreground">
            First name <span className="font-normal text-muted-foreground/80">(optional)</span>
          </label>
          <input
            id="optin-first"
            name="firstName"
            type="text"
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="input-research mt-2"
          />
        </div>
        <div>
          <label htmlFor="optin-last" className="block text-xs font-medium text-muted-foreground">
            Last name <span className="font-normal text-muted-foreground/80">(optional)</span>
          </label>
          <input
            id="optin-last"
            name="lastName"
            type="text"
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="input-research mt-2"
          />
        </div>
      </div>
      <div>
        <label htmlFor="optin-email" className="block text-xs font-medium text-muted-foreground">
          Email <span className="text-destructive">*</span>
        </label>
        <input
          id="optin-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-research mt-2"
        />
      </div>
      <div>
        <label htmlFor="optin-phone" className="block text-xs font-medium text-muted-foreground">
          Phone <span className="font-normal text-muted-foreground/80">(optional)</span>
        </label>
        <input
          id="optin-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="input-research mt-2"
        />
      </div>
      {error ? (
        <p
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        className="btn-primary w-full disabled:pointer-events-none disabled:opacity-60 sm:w-auto"
      >
        {loading ? "Submitting…" : "Request access"}
      </button>
    </form>
  );
}
