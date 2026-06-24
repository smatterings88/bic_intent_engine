import type { Metadata } from "next";
import { PageHeader } from "@/components/site/PageHeader";
import { buildPageMetadata } from "@/lib/build-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "About — Sales Breakdown Institute",
  description:
    "An independent research initiative committed to objective analysis of sales conversation failures.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About the Institute"
        title="An independent voice in sales performance research."
        lede="The Sales Breakdown Institute exists to study—rigorously and without commercial bias—why sales conversations fail and what that failure costs."
      />
      <article className="mx-auto max-w-3xl space-y-10 py-14 prose-research page-gutter sm:py-16">
        <section>
          <h2 className="font-serif text-2xl text-foreground mb-4">Purpose</h2>
          <p>
            Founded as a non-commercial initiative, the Institute publishes structured research on
            the conversational, behavioral, and structural dynamics that determine whether a sales
            opportunity advances or stalls. Our work is intended for practitioners, researchers, and
            educators seeking a clearer understanding of revenue loss as a measurable phenomenon.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl text-foreground mb-4">Independence</h2>
          <p>
            The Institute does not sell products, software, or services. It does not accept
            sponsored research from organizations whose offerings are the subject of study. All
            findings are published openly and remain free of commercial affiliation.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl text-foreground mb-4">Approach</h2>
          <p>
            Our methodology draws from structured transcript analysis, longitudinal pipeline
            tracking, and qualitative interviews with sales professionals across industries.
            Findings are reviewed internally for analytical rigor before publication.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl text-foreground mb-4">Ethical commitment</h2>
          <p>
            All conversational data referenced in our publications is anonymized and contributed
            under explicit consent. The Institute is committed to objective insight, transparent
            methodology, and the responsible handling of all participant data.
          </p>
        </section>
      </article>
    </>
  );
}
