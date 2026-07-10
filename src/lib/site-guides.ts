/**
 * Curated free guides promoted on /resources and /articles.
 * Add new entries here when publishing — keeps nav/index dates in sync.
 *
 * Publish dates are editorial defaults (June–July 2026); confirm with editorial before Ad Grants review.
 */
export type SiteGuide = {
  slug: string;
  category: string;
  tag: string;
  title: string;
  description: string;
  /** ISO 8601 date for schema and display */
  publishedAt: string;
  /** ISO 8601; omit when unchanged since publish */
  updatedAt?: string;
};

export const SITE_GUIDES: SiteGuide[] = [
  {
    slug: "why-good-sales-conversations-dont-close",
    category: "Sales",
    tag: "Sales · Free Guide",
    title: "Why Good Sales Conversations Don't Close",
    description:
      "The deal didn't fall apart at the close. It fell apart mid-conversation — in a specific moment when the buyer's attention shifted and you didn't catch it. This guide identifies the five communication moments where buyers quietly disengage, what they're signaling when it happens, and how to bring the conversation back without it feeling like a pitch.",
    publishedAt: "2026-06-03",
  },
  {
    slug: "how-to-price-without-undercharging",
    category: "Sales",
    tag: "Sales · Free Guide",
    title: "How to Price Your Services Without Undercharging",
    description:
      "Undercharging is a communication problem before it's a pricing problem. It happens when you can't articulate your value clearly enough for a buyer to feel the price is obvious. This guide walks through how to talk about price — the framing, the sequence, the confidence — so you stop discounting before the buyer even asks.",
    publishedAt: "2026-06-10",
  },
  {
    slug: "one-page-marketing-plan",
    category: "Marketing",
    tag: "Marketing · Free Guide",
    title: "The One-Page Marketing Plan That Actually Works",
    description:
      "Most marketing plans fail because they start with tactics instead of message. This framework forces the three communication decisions that make every tactic easier: who you're talking to, what you're promising, and why they should believe you. 90 minutes to complete. Replaces weeks of confusion about where to focus.",
    publishedAt: "2026-06-17",
  },
  {
    slug: "what-your-ideal-client-looks-like",
    category: "Marketing",
    tag: "Marketing · Free Guide",
    title: "What Your Ideal Client Actually Looks Like",
    description:
      "Effective marketing communication requires knowing the exact words your buyer uses when they describe the problem you solve — not your words, theirs. This guide helps you build the customer profile that sharpens all your messaging: the fears, frustrations, goals, and language your ideal client is actually using when they go looking for what you offer.",
    publishedAt: "2026-06-20",
  },
  {
    slug: "90-day-execution-plan",
    category: "Strategy & Execution",
    tag: "Strategy · Free Guide",
    title: "The 90-Day Execution Plan for Small Business",
    description:
      "A strategy that only lives in your head isn't executable. A plan that's too complicated to explain to a new team member won't survive first contact with reality. This framework helps you communicate your priority clearly enough — to yourself, to your team, to your calendar — that it actually gets done. One priority. Three milestones. A weekly rhythm. A recovery process.",
    publishedAt: "2026-06-24",
  },
  {
    slug: "communication-habits-for-leaders",
    category: "Mindset & Leadership",
    tag: "Leadership · Free Guide",
    title: "The Communication Habits That Make You a Better Leader",
    description:
      "How you make decisions, how you give feedback, how you handle conflict, how you set expectations — these are communication skills, and they become your company's culture before you have a company. This guide covers the leadership communication fundamentals worth building now, while you still have the space to build them intentionally.",
    publishedAt: "2026-07-01",
  },
];

const bySlug = new Map(SITE_GUIDES.map((g) => [g.slug, g]));

export function getSiteGuideBySlug(slug: string): SiteGuide | undefined {
  return bySlug.get(slug);
}

export function getSiteGuideArticlePath(slug: string): string {
  return `/articles/${slug}`;
}

export const SITE_GUIDE_SLUGS = SITE_GUIDES.map((g) => g.slug);

/** Group guides by category label for /resources layout */
export function siteGuidesByCategory(): { label: string; resources: SiteGuide[] }[] {
  const order = ["Sales", "Marketing", "Strategy & Execution", "Mindset & Leadership"];
  const groups = new Map<string, SiteGuide[]>();
  for (const g of SITE_GUIDES) {
    const list = groups.get(g.category) ?? [];
    list.push(g);
    groups.set(g.category, list);
  }
  return order
    .filter((label) => groups.has(label))
    .map((label) => ({ label, resources: groups.get(label)! }));
}
