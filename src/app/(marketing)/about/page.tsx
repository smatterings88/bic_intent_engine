import type { Metadata } from "next";
import { PageHeader } from "@/components/site/PageHeader";
import { buildPageMetadata } from "@/lib/build-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "About — Business Impact Canada",
  description:
    "Free communication education for entrepreneurs across Canada. A registered nonprofit foundation.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About Us"
        title="Free communication education for Canadian entrepreneurs."
        lede="Business Impact Canada exists to help entrepreneurs communicate clearly — in marketing, sales, leadership, and execution — so their businesses can make the impact they came here to make."
      />
      <article className="mx-auto max-w-3xl space-y-10 py-14 prose-research page-gutter sm:py-16">
        <section>
          <h2 className="font-serif text-2xl text-foreground mb-4">Purpose</h2>
          <p>
            Founded as a nonprofit, Business Impact Canada publishes free educational resources on
            communication in marketing, sales, leadership, and execution — the skills entrepreneurs
            need to build businesses that actually work.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl text-foreground mb-4">Mission</h2>
          <p>
            We believe most business problems are communication problems in disguise. Our programs
            help entrepreneurs find those problems and learn to solve them — at no cost, with no
            paywalls, and no email gates on core resources.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl text-foreground mb-4">Approach</h2>
          <p>
            Our content is practical, direct, and built for entrepreneurs who are doing the work —
            not for consultants selling frameworks. Every program comes back to the same insight:
            clarity in how you communicate determines whether your business moves forward.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl text-foreground mb-4">Nonprofit commitment</h2>
          <p>
            Business Impact Canada (15213614 Canada Foundation) is a registered Canadian nonprofit.
            All programs are free — always. Donations fund program delivery for entrepreneurs who
            need guidance but cannot afford business school or coaching.
          </p>
        </section>
      </article>
    </>
  );
}
