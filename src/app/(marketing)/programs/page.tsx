import type { Metadata } from "next";
import { PageHeader } from "@/components/site/PageHeader";
import { buildPageMetadata } from "@/lib/build-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Programs — Business Impact Canada",
  description:
    "Free communication programs for Canadian entrepreneurs — marketing, sales, mindset & leadership, and strategy & execution.",
  path: "/programs",
});

const programs = [
  {
    id: "marketing-mastery",
    num: "Program 01",
    title: "Marketing Mastery",
    description:
      "How to communicate your value to the people who need it — in language they recognize, through channels they trust.",
    threads: [
      "Clarifying your core message",
      "Choosing channels your buyer trusts",
      "One-page planning frameworks",
    ],
  },
  {
    id: "sales-mastery",
    num: "Program 02",
    title: "Sales Mastery",
    description:
      "Why good conversations don't close — and what's actually happening in the moments buyers go quiet.",
    threads: [
      "Reading buyer disengagement signals",
      "Mid-conversation recovery",
      "Pricing and value conversations",
    ],
  },
  {
    id: "mindset-leadership",
    num: "Program 03",
    title: "Mindset & Leadership",
    description:
      "The internal clarity that makes external communication possible. You can't lead people you haven't learned to speak to.",
    threads: [
      "Feedback and expectations",
      "Decision communication",
      "Conflict and alignment habits",
    ],
  },
  {
    id: "strategy-execution",
    num: "Program 04",
    title: "Strategy & Execution",
    description:
      "A plan nobody understands doesn't get executed. Strategy is communication — from priorities to calendar.",
    threads: [
      "90-day execution rhythm",
      "Team priority alignment",
      "Translating strategy into weekly action",
    ],
  },
] as const;

export default function ProgramsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Programs"
        title="Four areas. One root cause."
        lede="Every program comes back to the same insight: most business problems are communication problems in disguise. All programs are free — always."
      />
      <section className="mx-auto max-w-4xl space-y-12 py-14 page-gutter sm:py-16">
        {programs.map((p) => (
          <article
            key={p.id}
            id={p.id}
            className="scroll-mt-28 border border-border rounded-md p-8 bg-background"
          >
            <div className="eyebrow">{p.num}</div>
            <h2 className="mt-3 font-serif text-2xl text-foreground">{p.title}</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">{p.description}</p>
            <div className="mt-6 pt-6 border-t border-border">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                What you&apos;ll work on
              </div>
              <ul className="grid sm:grid-cols-2 gap-y-2 gap-x-6 text-sm text-foreground">
                {p.threads.map((t) => (
                  <li key={t} className="flex gap-2">
                    <span className="text-primary">·</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
