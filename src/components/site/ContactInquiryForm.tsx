"use client";

import { useState } from "react";

const inputCls =
  "w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
        {label}
      </span>
      {children}
    </label>
  );
}

/**
 * TODO(Phase 2+): Wire submission to a Server Action or API route (e.g. GHL / email transport).
 * Current behavior: client-only mock submit for UI parity with the pre-Next contact page.
 */
export function ContactInquiryForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="border border-border rounded-md p-8 bg-secondary/40">
        <div className="eyebrow">Received</div>
        <h2 className="mt-3 font-serif text-2xl text-foreground">Thank you for your message.</h2>
        <p className="mt-3 text-muted-foreground">
          A member of our team will follow up by email if a response is required.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
      className="space-y-6"
    >
      <Field label="Name">
        <input required type="text" className={inputCls} />
      </Field>
      <Field label="Email">
        <input required type="email" className={inputCls} />
      </Field>
      <Field label="Affiliation (optional)">
        <input type="text" className={inputCls} />
      </Field>
      <Field label="Subject">
        <input required type="text" className={inputCls} />
      </Field>
      <Field label="Message">
        <textarea required rows={6} className={inputCls} />
      </Field>
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Submit inquiry
      </button>
    </form>
  );
}
