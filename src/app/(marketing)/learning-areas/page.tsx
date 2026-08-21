import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/site/PageHeader";
import { buildPageMetadata } from "@/lib/build-metadata";
import { getSiteGuideArticlePath, getSiteGuideBySlug, type SiteGuide } from "@/lib/site-guides";

export const metadata: Metadata = buildPageMetadata({
  title: "Learning Areas — Business Impact Canada",
  description:
    "Free communication guides for Canadian entrepreneurs — marketing, sales, mindset & leadership, and strategy & execution.",
  path: "/learning-areas",
});

const areas = [
  {
    id: "marketing-mastery",
    num: "Area 01",
    title: "Marketing Mastery",
    description:
      "How to communicate your value to the people who need it — in language they recognize, through channels they trust.",
    threads: [
      "Clarifying your core message",
      "Choosing channels your buyer trusts",
      "One-page planning frameworks",
    ],
    guideSlugs: ["one-page-marketing-plan", "what-your-ideal-client-looks-like"],
  },
  {
    id: "sales-mastery",
    num: "Area 02",
    title: "Sales Mastery",
    description:
      "Why good conversations don't close — and what's actually happening in the moments buyers go quiet.",
    threads: [
      "Reading buyer disengagement signals",
      "Mid-conversation recovery",
      "Pricing and value conversations",
    ],
    guideSlugs: ["why-good-sales-conversations-dont-close", "how-to-price-without-undercharging"],
  },
  {
    id: "mindset-leadership",
    num: "Area 03",
    title: "Mindset & Leadership",
    description:
      "The internal clarity that makes external communication possible. You can't lead people you haven't learned to speak to.",
    threads: [
      "Feedback and expectations",
      "Decision communication",
      "Conflict and alignment habits",
    ],
    guideSlugs: ["communication-habits-for-leaders"],
  },
  {
    id: "strategy-execution",
    num: "Area 04",
    title: "Strategy & Execution",
    description:
      "A plan nobody understands doesn't get executed. Strategy is communication — from priorities to calendar.",
    threads: [
      "90-day execution rhythm",
      "Team priority alignment",
      "Translating strategy into weekly action",
    ],
    guideSlugs: ["90-day-execution-plan"],
  },
] as const;

function resolveGuides(slugs: readonly string[]): SiteGuide[] {
  const guides: SiteGuide[] = [];
  for (const slug of slugs) {
    const guide = getSiteGuideBySlug(slug);
    if (guide) {
      guides.push(guide);
    }
  }
  return guides;
}

function AreaGuideLinks({ slugs }: { slugs: readonly string[] }) {
  const guides = resolveGuides(slugs);
  if (guides.length === 0) {
    return null;
  }

  if (guides.length === 1) {
    const guide = guides[0];
    return (
      <div className="mt-6 pt-6 border-t border-border">
        <Link
          href={getSiteGuideArticlePath(guide.slug)}
          className="text-sm font-medium text-primary hover:underline"
        >
          Read the guide
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6 pt-6 border-t border-border">
      <ul className="space-y-2 text-sm">
        {guides.map((guide) => (
          <li key={guide.slug}>
            <Link
              href={getSiteGuideArticlePath(guide.slug)}
              className="font-medium text-primary hover:underline"
            >
              {guide.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function LearningAreasPage() {
  return (
    <>
      <PageHeader
        eyebrow="Learning Areas"
        title="Four areas. One root cause."
        lede="Every learning area comes back to the same insight: most business problems are communication problems in disguise. All resources are free — always."
      />
      <section className="mx-auto max-w-4xl space-y-12 py-14 page-gutter sm:py-16">
        {areas.map((area) => (
          <article
            key={area.id}
            id={area.id}
            className="scroll-mt-28 border border-border rounded-md p-8 bg-background"
          >
            <div className="eyebrow">{area.num}</div>
            <h2 className="mt-3 font-serif text-2xl text-foreground">{area.title}</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">{area.description}</p>
            <div className="mt-6 pt-6 border-t border-border">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                What you&apos;ll work on
              </div>
              <ul className="grid sm:grid-cols-2 gap-y-2 gap-x-6 text-sm text-foreground">
                {area.threads.map((t) => (
                  <li key={t} className="flex gap-2">
                    <span className="text-primary">·</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <AreaGuideLinks slugs={area.guideSlugs} />
          </article>
        ))}
      </section>
    </>
  );
}
