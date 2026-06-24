import type { Metadata } from "next";
import { PageHeader } from "@/components/site/PageHeader";
import { buildPageMetadata } from "@/lib/build-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Programs — Business Impact Canada",
  description: "Ongoing research programs at Business Impact Canada.",
  path: "/programs",
});

const programs = [
  {
    name: "Sales Conversation Analysis Initiative",
    focus: "Methodology · Active",
    description:
      "A long-running program developing standardized methods for the structured review of sales conversations. The initiative produces taxonomies, coding frameworks, and analytical conventions that support reproducible findings across studies.",
    threads: [
      "Conversation segmentation models",
      "Linguistic markers of disengagement",
      "Inter-coder reliability protocols",
    ],
  },
  {
    name: "Revenue Loss Research Program",
    focus: "Economic Impact · Active",
    description:
      "Quantifying the economic footprint of failed sales conversations across industries, deal sizes, and buyer segments. The program produces annual estimates of preventable revenue loss and underlying cost drivers.",
    threads: [
      "Cross-industry loss benchmarking",
      "Pipeline decay modeling",
      "Cost-of-stall accounting frameworks",
    ],
  },
  {
    name: "Behavioral Sales Pattern Studies",
    focus: "Behavioral Research · Active",
    description:
      "Investigating recurring behavioral patterns—on both sides of a conversation—that precede the loss of momentum in an opportunity. Studies combine qualitative coding with longitudinal pipeline observation.",
    threads: [
      "Buyer disengagement signaling",
      "Seller compensatory behaviors",
      "Stakeholder participation dynamics",
    ],
  },
];

export default function ProgramsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Programs"
        title="Ongoing research programs."
        lede="Each program supports a distinct line of inquiry into the structural and behavioral causes of sales conversation breakdowns."
      />
      <section className="mx-auto max-w-4xl space-y-12 py-14 page-gutter sm:py-16">
        {programs.map((p) => (
          <article key={p.name} className="border border-border rounded-md p-8 bg-background">
            <div className="eyebrow">{p.focus}</div>
            <h2 className="mt-3 font-serif text-2xl text-foreground">{p.name}</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">{p.description}</p>
            <div className="mt-6 pt-6 border-t border-border">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                Current threads
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
