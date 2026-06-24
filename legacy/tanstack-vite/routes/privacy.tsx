import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/SiteLayout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Sales Breakdown Institute" },
      { name: "description", content: "Privacy policy for the Sales Breakdown Institute." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Privacy Policy" lede="Last updated: January 2026" />
      <article className="mx-auto max-w-3xl px-6 py-16 space-y-8 prose-research">
        <section>
          <h2 className="font-serif text-xl text-foreground mb-3">Overview</h2>
          <p>
            The Sales Breakdown Institute ("the Institute") is committed to protecting the privacy
            of visitors to our website and individuals who correspond with us. This policy outlines
            what information we collect and how we use it.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-xl text-foreground mb-3">Information we collect</h2>
          <p>
            We collect information you voluntarily provide through our contact form, including your
            name, email address, and any details included in your message. We may also collect basic
            technical information such as browser type and pages visited for the purpose of
            improving the website.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-xl text-foreground mb-3">How we use information</h2>
          <p>
            Information you provide is used solely to respond to your inquiry and to support the
            Institute's research and educational activities. We do not sell, rent, or share personal
            information with third parties for commercial purposes.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-xl text-foreground mb-3">Research data</h2>
          <p>
            All conversational data referenced in our publications is anonymized and contributed
            under explicit consent. No personal identifiers are retained beyond what is necessary
            for the integrity of the research.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-xl text-foreground mb-3">Contact</h2>
          <p>
            Questions regarding this policy may be directed to{" "}
            <span className="text-foreground">research@salesbreakdowninstitute.com</span>.
          </p>
        </section>
      </article>
    </>
  );
}
