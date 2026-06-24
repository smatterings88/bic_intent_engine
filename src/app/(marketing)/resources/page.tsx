import type { Metadata } from "next";
import Link from "next/link";

import { buildPageMetadata } from "@/lib/build-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Free Resources — Business Impact Canada",
  description:
    "Free guides and frameworks for Canadian entrepreneurs. Communication skills for sales, marketing, leadership, and strategy — all free, nonprofit-backed, no email required.",
  path: "/resources",
});

const resourceCategories = [
  {
    label: "Sales",
    resources: [
      {
        href: "/articles/why-good-sales-conversations-dont-close",
        tag: "Sales · Free Guide",
        title: "Why Good Sales Conversations Don't Close",
        description:
          "The deal didn't fall apart at the close. It fell apart mid-conversation — in a specific moment when the buyer's attention shifted and you didn't catch it. This guide identifies the five communication moments where buyers quietly disengage, what they're signaling when it happens, and how to bring the conversation back without it feeling like a pitch.",
      },
      {
        href: "/articles/how-to-price-without-undercharging",
        tag: "Sales · Free Guide",
        title: "How to Price Your Services Without Undercharging",
        description:
          "Undercharging is a communication problem before it's a pricing problem. It happens when you can't articulate your value clearly enough for a buyer to feel the price is obvious. This guide walks through how to talk about price — the framing, the sequence, the confidence — so you stop discounting before the buyer even asks.",
      },
    ],
  },
  {
    label: "Marketing",
    resources: [
      {
        href: "/articles/one-page-marketing-plan",
        tag: "Marketing · Free Guide",
        title: "The One-Page Marketing Plan That Actually Works",
        description:
          "Most marketing plans fail because they start with tactics instead of message. This framework forces the three communication decisions that make every tactic easier: who you're talking to, what you're promising, and why they should believe you. 90 minutes to complete. Replaces weeks of confusion about where to focus.",
      },
      {
        href: "/articles/what-your-ideal-client-looks-like",
        tag: "Marketing · Free Guide",
        title: "What Your Ideal Client Actually Looks Like",
        description:
          "Effective marketing communication requires knowing the exact words your buyer uses when they describe the problem you solve — not your words, theirs. This guide helps you build the customer profile that sharpens all your messaging: the fears, frustrations, goals, and language your ideal client is actually using when they go looking for what you offer.",
      },
    ],
  },
  {
    label: "Strategy & Execution",
    resources: [
      {
        href: "/articles/90-day-execution-plan",
        tag: "Strategy · Free Guide",
        title: "The 90-Day Execution Plan for Small Business",
        description:
          "A strategy that only lives in your head isn't executable. A plan that's too complicated to explain to a new team member won't survive first contact with reality. This framework helps you communicate your priority clearly enough — to yourself, to your team, to your calendar — that it actually gets done. One priority. Three milestones. A weekly rhythm. A recovery process.",
      },
    ],
  },
  {
    label: "Mindset & Leadership",
    resources: [
      {
        href: "/articles/communication-habits-for-leaders",
        tag: "Leadership · Free Guide",
        title: "The Communication Habits That Make You a Better Leader",
        description:
          "How you make decisions, how you give feedback, how you handle conflict, how you set expectations — these are communication skills, and they become your company's culture before you have a company. This guide covers the leadership communication fundamentals worth building now, while you still have the space to build them intentionally.",
      },
    ],
  },
] as const;

export default function ResourcesPage() {
  return (
    <>
      <section className="bic-page-hero">
        <div className="site-container">
          <div className="bic-page-hero-inner">
            <p className="section-eyebrow">Free Resources</p>
            <h1>Free Communication Guides for Entrepreneurs</h1>
            <p>
              Every resource here addresses a communication problem your business is probably
              already experiencing. No email required. No paywalls. Nonprofit-backed, always free.
            </p>
          </div>
        </div>
      </section>

      <div className="site-container pb-20">
        {resourceCategories.map((category) => (
          <div key={category.label} className="category-section">
            <div className="category-label">{category.label}</div>
            <div className="resource-grid">
              {category.resources.map((resource) => (
                <Link key={resource.href} href={resource.href} className="resource-card">
                  <div className="resource-tag">{resource.tag}</div>
                  <h3>{resource.title}</h3>
                  <p>{resource.description}</p>
                  <span className="resource-link">Read Guide →</span>
                </Link>
              ))}
            </div>
          </div>
        ))}

        <div className="partner-feature">
          <div className="partner-feature-label">Featured Partner Resource</div>
          <h2>
            Your Sales Call Is a Communication Event. Get a Forensic Analysis of Yours — Free.
          </h2>
          <p>
            Most lost deals are decided in a specific communication moment mid-call — a signal the
            buyer sent that went unread, a question that wasn&apos;t asked, a hesitation that got
            steamrolled instead of addressed. Our partner <strong>Alex The Sherpa</strong> takes a
            recording of a real sales call and identifies exactly where those moments were.
          </p>
          <p>
            This is not generic sales coaching. It&apos;s a communication diagnostic on your
            specific conversation — the moment the buyer&apos;s interest shifted, what they were
            signaling, and what a different response would have sounded like. We recommend it to
            every entrepreneur working through Sales Mastery.
          </p>
          <a
            href="https://alexthesherpa.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Get Your Free Sales Call Analysis →
          </a>
          <span className="partner-note">
            Free resource from our partner · No cost, no commitment · External link to
            alexthesherpa.com
          </span>
        </div>

        <div className="bottom-cta">
          <p className="bottom-cta-eyebrow">Always Free</p>
          <h2>More Resources Added Regularly — Always Free</h2>
          <p>
            All resources are free, always. If you want to support what we do, consider making a
            donation — it funds everything you&apos;re reading here.
          </p>
          <Link href="/donate" className="btn-primary">
            Support Our Mission
          </Link>
        </div>
      </div>
    </>
  );
}
