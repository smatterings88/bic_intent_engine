import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/SiteLayout";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Sales Breakdown Institute" },
      {
        name: "description",
        content: "Contact the Sales Breakdown Institute for research inquiries and correspondence.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Correspondence and research inquiries."
        lede="The Institute welcomes inquiries from researchers, educators, and practitioners. Please allow several business days for a reply."
      />
      <section className="mx-auto max-w-4xl px-6 py-16 grid md:grid-cols-[1fr_320px] gap-14">
        <div>
          {submitted ? (
            <div className="border border-border rounded-md p-8 bg-secondary/40">
              <div className="eyebrow">Received</div>
              <h2 className="mt-3 font-serif text-2xl text-foreground">
                Thank you for your message.
              </h2>
              <p className="mt-3 text-muted-foreground">
                A member of the Institute will follow up by email if a response is required.
              </p>
            </div>
          ) : (
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
          )}
        </div>
        <aside className="space-y-8 text-sm">
          <div>
            <div className="eyebrow mb-2">Email</div>
            <div className="text-foreground">research@salesbreakdowninstitute.com</div>
          </div>
          <div>
            <div className="eyebrow mb-2">Registered Office</div>
            <div className="text-foreground leading-relaxed">
              Sales Breakdown Institute
              <br />
              1717 N Street NW, STE 1<br />
              Washington, D.C. 20036
              <br />
              United States
            </div>
          </div>
          <div>
            <div className="eyebrow mb-2">Mailing / Operations</div>
            <div className="text-foreground leading-relaxed">
              Sales Breakdown Institute
              <br />
              1968 S. Coast Hwy, #265
              <br />
              Laguna Beach, CA 92651
              <br />
              United States
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}

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
