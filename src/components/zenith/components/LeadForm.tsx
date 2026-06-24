"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { getZenithFormAnchorId, resolveCtaDestination } from "@/lib/zenith/destinations";
import {
  normalizeThankYouPageUrlForRedirect,
  resolveLeadFormFields,
  resolveThankYouPageUrl,
} from "@/lib/zenith/lead-form-rules";
import { successBehaviorToThankYouPath } from "@/lib/zenith/slot-config";
import type {
  LeadFormComponent,
  ZenithContentType,
  ZenithSuccessBehavior,
} from "@/types/zenith-content";

function collectTracking(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const sp = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  const map: [string, string][] = [
    ["utm_source", "utmSource"],
    ["utm_medium", "utmMedium"],
    ["utm_campaign", "utmCampaign"],
    ["utm_term", "utmTerm"],
    ["utm_content", "utmContent"],
  ];
  for (const [q, key] of map) {
    const v = sp.get(q)?.trim();
    if (v) out[key] = v;
  }
  out.referrer = document.referrer || "";
  out.path = window.location.pathname || "";
  return out;
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LeadForm({
  component,
  pageSlug,
  contentType,
  slotId,
  successBehavior,
}: {
  component: LeadFormComponent;
  pageSlug: string;
  contentType?: ZenithContentType;
  /** When rendered from an HTML slot, server resolves config by this id. */
  slotId?: string;
  successBehavior?: ZenithSuccessBehavior;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [doneMessage, setDoneMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const resolved = resolveCtaDestination(component.destination);
  const isCallUpload = resolved.kind === "call-upload";
  const fields = useMemo(
    () => resolveLeadFormFields(component.fields, contentType, component.variant),
    [component.fields, contentType, component.variant],
  );

  const thankYou = "Thank you. We received your submission.";
  const thankYouPageUrl =
    successBehaviorToThankYouPath(successBehavior) ??
    resolveThankYouPageUrl(component.thankYouPageUrl, component.redirect);
  const preferInlineSuccess = successBehavior?.type === "inline_message";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldError(null);
    const email = values.email?.trim() ?? "";
    if (fields.includes("email")) {
      if (!email) {
        setFieldError("Please enter your email address.");
        return;
      }
      if (!emailRe.test(email)) {
        setFieldError("Please enter a valid email address.");
        return;
      }
    }
    if (fields.includes("name") && !values.name?.trim()) {
      setFieldError("Please enter your name.");
      return;
    }
    if (fields.includes("message") && !values.message?.trim()) {
      setFieldError("Please enter a message.");
      return;
    }
    if (fields.includes("first_name") && !values.first_name?.trim()) {
      setFieldError("Please enter your first name.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/zenith/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageSlug,
          slot: slotId,
          variant: component.variant,
          destination: component.destination,
          fields: values,
          tracking: collectTracking(),
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        thankYouMessage?: string;
        thankYouPageUrl?: string;
        error?: string;
        message?: string;
        ghlSyncStatus?: string;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Request failed");
      }

      const redirectTarget = preferInlineSuccess
        ? undefined
        : (resolveThankYouPageUrl(data.thankYouPageUrl, undefined) ?? thankYouPageUrl);

      if (redirectTarget) {
        window.location.assign(normalizeThankYouPageUrlForRedirect(redirectTarget));
        return;
      }

      const inlineMsg =
        preferInlineSuccess && successBehavior?.type === "inline_message"
          ? successBehavior.message
          : undefined;
      const base =
        inlineMsg ?? data.thankYouMessage?.trim() ?? component.thankYouMessage?.trim() ?? thankYou;
      const crmNote =
        data.ghlSyncStatus === "failed" && data.message
          ? ` ${data.message}`
          : data.ghlSyncStatus === "skipped"
            ? ""
            : "";
      setDoneMessage(`${base}${crmNote}`);
      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div
        className="my-10 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-8 text-center text-emerald-900"
        data-state="submitted"
      >
        <p className="text-lg font-semibold">{doneMessage || thankYou}</p>
      </div>
    );
  }

  const nameIdx = fields.indexOf("name");
  const emailIdx = fields.indexOf("email");
  const nameBeforeEmail = nameIdx >= 0 && (emailIdx < 0 || nameIdx < emailIdx);

  return (
    <section
      id={getZenithFormAnchorId(component.destination)}
      className="my-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      {component.headline ? (
        <h2 className="font-serif text-2xl font-semibold text-slate-900">{component.headline}</h2>
      ) : null}
      {component.description ? (
        <p className="mt-2 text-slate-600">{component.description}</p>
      ) : null}
      {isCallUpload ? (
        <p className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
          Start with your work email. For full recording upload, continue in the{" "}
          <Link href="/app" className="font-medium text-[#1e3560] underline">
            app workspace
          </Link>
          .
        </p>
      ) : null}
      <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
        {nameBeforeEmail && fields.includes("name") ? (
          <div>
            <label
              htmlFor={`zf-name-${pageSlug}`}
              className="block text-sm font-medium text-slate-700"
            >
              Name
            </label>
            <input
              id={`zf-name-${pageSlug}`}
              name="name"
              type="text"
              autoComplete="name"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-[#1e3560] focus:outline-none focus:ring-1 focus:ring-[#1e3560]"
              value={values.name ?? ""}
              onChange={(ev) => setValues((v) => ({ ...v, name: ev.target.value }))}
              required
            />
          </div>
        ) : null}
        {fields.includes("first_name") ? (
          <div>
            <label
              htmlFor={`zf-fn-${pageSlug}`}
              className="block text-sm font-medium text-slate-700"
            >
              First name
            </label>
            <input
              id={`zf-fn-${pageSlug}`}
              name="first_name"
              type="text"
              autoComplete="given-name"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-[#1e3560] focus:outline-none focus:ring-1 focus:ring-[#1e3560]"
              value={values.first_name ?? ""}
              onChange={(ev) => setValues((v) => ({ ...v, first_name: ev.target.value }))}
              required
            />
          </div>
        ) : null}
        {fields.includes("email") ? (
          <div>
            <label
              htmlFor={`zf-email-${pageSlug}`}
              className="block text-sm font-medium text-slate-700"
            >
              Email
            </label>
            <input
              id={`zf-email-${pageSlug}`}
              name="email"
              type="email"
              autoComplete="email"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-[#1e3560] focus:outline-none focus:ring-1 focus:ring-[#1e3560]"
              value={values.email ?? ""}
              onChange={(ev) => setValues((v) => ({ ...v, email: ev.target.value }))}
              required
            />
          </div>
        ) : null}
        {!nameBeforeEmail && fields.includes("name") ? (
          <div>
            <label
              htmlFor={`zf-name-${pageSlug}`}
              className="block text-sm font-medium text-slate-700"
            >
              Name
            </label>
            <input
              id={`zf-name-${pageSlug}`}
              name="name"
              type="text"
              autoComplete="name"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-[#1e3560] focus:outline-none focus:ring-1 focus:ring-[#1e3560]"
              value={values.name ?? ""}
              onChange={(ev) => setValues((v) => ({ ...v, name: ev.target.value }))}
              required
            />
          </div>
        ) : null}
        {fields.includes("message") ? (
          <div>
            <label
              htmlFor={`zf-msg-${pageSlug}`}
              className="block text-sm font-medium text-slate-700"
            >
              Message
            </label>
            <textarea
              id={`zf-msg-${pageSlug}`}
              name="message"
              rows={4}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-[#1e3560] focus:outline-none focus:ring-1 focus:ring-[#1e3560]"
              value={values.message ?? ""}
              onChange={(ev) => setValues((v) => ({ ...v, message: ev.target.value }))}
              required
            />
          </div>
        ) : null}
        {fields.includes("file") && isCallUpload ? (
          <div>
            <label
              htmlFor={`zf-file-${pageSlug}`}
              className="block text-sm font-medium text-slate-700"
            >
              Recording (optional)
            </label>
            <input
              id={`zf-file-${pageSlug}`}
              name="file"
              type="file"
              accept={component.acceptedFileTypes?.join(",") || "audio/*,video/*"}
              className="mt-1 block w-full text-sm text-slate-600"
              onChange={(ev) => {
                const f = ev.target.files?.[0];
                setValues((v) => ({ ...v, file_name: f?.name ?? "" }));
              }}
            />
            <p className="mt-1 text-xs text-slate-500">
              File upload is collected as metadata only in this phase; use the app for full upload.
            </p>
          </div>
        ) : null}
        {fieldError ? <p className="text-sm text-red-600">{fieldError}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-md bg-[#1e3560] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60 sm:w-auto"
        >
          {loading ? "Sending…" : component.ctaText?.trim() || "Submit"}
        </button>
      </form>
    </section>
  );
}
