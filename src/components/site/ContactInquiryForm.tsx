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

type FormState = {
  name: string;
  email: string;
  affiliation: string;
  subject: string;
  message: string;
};

const emptyForm: FormState = {
  name: "",
  email: "",
  affiliation: "",
  subject: "",
  message: "",
};

export function ContactInquiryForm() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

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
      onSubmit={async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
          const response = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: form.name,
              email: form.email,
              affiliation: form.affiliation || undefined,
              subject: form.subject,
              message: form.message,
            }),
          });

          const payload = (await response.json()) as { ok?: boolean; error?: string };

          if (!response.ok || !payload.ok) {
            throw new Error(payload.error ?? "Unable to send your inquiry. Please try again.");
          }

          setSubmitted(true);
        } catch (submitError) {
          setError(
            submitError instanceof Error
              ? submitError.message
              : "Unable to send your inquiry. Please try again.",
          );
        } finally {
          setSubmitting(false);
        }
      }}
      className="space-y-6"
    >
      <Field label="Name">
        <input
          required
          type="text"
          className={inputCls}
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          disabled={submitting}
        />
      </Field>
      <Field label="Email">
        <input
          required
          type="email"
          className={inputCls}
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          disabled={submitting}
        />
      </Field>
      <Field label="Affiliation (optional)">
        <input
          type="text"
          className={inputCls}
          value={form.affiliation}
          onChange={(e) => updateField("affiliation", e.target.value)}
          disabled={submitting}
        />
      </Field>
      <Field label="Subject">
        <input
          required
          type="text"
          className={inputCls}
          value={form.subject}
          onChange={(e) => updateField("subject", e.target.value)}
          disabled={submitting}
        />
      </Field>
      <Field label="Message">
        <textarea
          required
          rows={6}
          className={inputCls}
          value={form.message}
          onChange={(e) => updateField("message", e.target.value)}
          disabled={submitting}
        />
      </Field>
      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <button type="submit" className="btn-primary" disabled={submitting} aria-busy={submitting}>
        {submitting ? "Sending…" : "Submit inquiry"}
      </button>
    </form>
  );
}
