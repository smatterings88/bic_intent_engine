import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/site/PageHeader";
import { buildPageMetadata } from "@/lib/build-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Research — Business Impact Canada",
  description: "Working papers, field studies, and briefs on sales conversation breakdowns.",
  path: "/research",
});

const reports = [
  {
    type: "Working Paper",
    year: "2026",
    title: "Why Deals Break After Pricing Discussions",
    abstract:
      "An analysis of 4,200 anonymized B2B sales transcripts examining behavioral and conversational shifts in the 72-hour window following the disclosure of price. Findings indicate a statistically significant decline in buyer-initiated communication, suggesting that price disclosure functions as a structural inflection point rather than a neutral exchange of information.",
  },
  {
    type: "Field Study",
    year: "2025",
    title: "The Hidden Cost of \u201CSend Me Information\u201D",
    abstract:
      "Sales practitioners frequently interpret a buyer's request for follow-up materials as a positive signal. This longitudinal study of 1,800 opportunities tracks outcomes across a 12-month window. In 68% of cases, the request marked the final substantive interaction—suggesting it more often functions as a polite disengagement than a continuation of interest.",
  },
  {
    type: "Brief",
    year: "2025",
    title: "Mid-Conversation Failures in Sales Calls",
    abstract:
      "A taxonomy of the structural moments within a sales conversation—the unanswered question, the misaligned transition, the unacknowledged objection—where momentum is most often lost. Drawn from a coded review of 950 recorded discovery calls.",
  },
  {
    type: "Working Paper",
    year: "2025",
    title: "Silence as a Diagnostic Signal",
    abstract:
      "An examination of pause length, pause distribution, and conversational asymmetry as early indicators of opportunity decay. Includes a proposed framework for distinguishing reflective silence from disengaged silence.",
  },
  {
    type: "Field Study",
    year: "2024",
    title: "The Discovery Call Decay Curve",
    abstract:
      "Tracking the rate at which discovery conversations lose informational density over time. The study identifies a consistent pattern in which the most consequential exchanges occur within a narrow window of the conversation's first third.",
  },
  {
    type: "Brief",
    year: "2024",
    title: "Buyer Disengagement as a Latent Variable",
    abstract:
      "Disengagement is rarely declared. This brief proposes a framework for inferring it from observable patterns in response time, message length, and stakeholder participation.",
  },
];

export default function ResearchPage() {
  return (
    <>
      <PageHeader
        eyebrow="Research"
        title="Working papers, field studies, and analytical briefs."
        lede="A growing body of research on the structural and behavioral patterns that shape the outcome of sales conversations."
      />
      <section className="mx-auto max-w-4xl py-14 page-gutter sm:py-16">
        <Link
          href="/where-deals-break"
          className="surface-card mb-10 block p-5 transition-shadow duration-200 hover:shadow-md sm:mb-12 sm:p-6"
        >
          <div className="eyebrow mb-2">Featured Report · 2026</div>
          <h2 className="font-serif text-2xl text-foreground">
            Where Deals Break: A Behavioral Analysis of Sales Conversation Failure
          </h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            A synthesis of published research and observed conversational patterns examining when,
            where, and why B2B sales opportunities collapse.
          </p>
          <span className="mt-4 inline-block text-sm font-medium text-primary underline-offset-4 transition-colors duration-200 hover:underline">
            Read the report →
          </span>
        </Link>
        <ul className="divide-y divide-border border-y border-border">
          {reports.map((r) => (
            <li key={r.title} className="py-10">
              <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
                <span className="text-primary font-medium">{r.type}</span>
                <span className="rule w-6" />
                <span>{r.year}</span>
              </div>
              <h2 className="mt-3 font-serif text-2xl text-foreground">{r.title}</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed max-w-3xl">{r.abstract}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
