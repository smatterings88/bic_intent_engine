import type { Metadata } from "next";
import { PageHeader } from "@/components/site/PageHeader";
import { buildPageMetadata } from "@/lib/build-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Insights — Sales Breakdown Institute",
  description:
    "Short-form research notes and analytical commentary from the Sales Breakdown Institute.",
  path: "/insights",
});

const articles = [
  {
    date: "March 12, 2026",
    category: "Conversation Analysis",
    title: "When Agreement Becomes a Warning Sign",
    summary:
      "Sustained verbal agreement from a buyer often correlates with diminished engagement, not increased alignment. A short note on the difference between assent and commitment.",
  },
  {
    date: "February 28, 2026",
    category: "Pipeline Dynamics",
    title: "The Quiet Stall: How Opportunities End Without Closing",
    summary:
      "Most lost opportunities are never formally lost—they simply stop progressing. We examine the conversational fingerprints of the silent stall.",
  },
  {
    date: "February 4, 2026",
    category: "Behavioral Patterns",
    title: "Reading the Second Email",
    summary:
      "The structure of a buyer's second written response often carries more diagnostic value than their first. A brief examination of why.",
  },
  {
    date: "January 19, 2026",
    category: "Discovery",
    title: "Questions That Don't Land",
    summary:
      "A review of the most common discovery questions associated with conversational disengagement, drawn from a coded sample of 600 calls.",
  },
  {
    date: "December 14, 2025",
    category: "Pricing",
    title: "The Asymmetry of Price Disclosure",
    summary:
      "Buyer and seller experience the moment of price disclosure differently. The asymmetry has measurable downstream effects on opportunity progression.",
  },
  {
    date: "November 22, 2025",
    category: "Methodology",
    title: "Coding Conversations: Notes on Reliability",
    summary:
      "Methodological reflections on inter-coder reliability when reviewing sales transcripts at scale.",
  },
  {
    date: "October 30, 2025",
    category: "Stakeholders",
    title: "When the Champion Goes Quiet",
    summary:
      "Internal champions often disengage before deals stall. Patterns in stakeholder participation can offer early warning.",
  },
  {
    date: "October 8, 2025",
    category: "Revenue Loss",
    title: "Estimating the Cost of an Unanswered Question",
    summary:
      "A short framework for assigning economic weight to specific conversational failures within a sales cycle.",
  },
];

export default function InsightsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Insights"
        title="Research notes and analytical commentary."
        lede="Short-form writing from the Institute, accompanying our longer research publications."
      />
      <section className="mx-auto max-w-4xl py-14 page-gutter sm:py-16">
        <div className="grid md:grid-cols-2 gap-px bg-border border border-border">
          {articles.map((a) => (
            <article key={a.title} className="bg-background p-7 flex flex-col">
              <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
                <span className="text-primary font-medium">{a.category}</span>
                <span>·</span>
                <span>{a.date}</span>
              </div>
              <h2 className="mt-3 font-serif text-xl text-foreground">{a.title}</h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{a.summary}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
