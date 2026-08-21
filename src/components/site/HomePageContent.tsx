import Image from "next/image";
import Link from "next/link";

import { getSiteGuideArticlePath, getSiteGuideBySlug, type SiteGuide } from "@/lib/site-guides";

const learningAreas = [
  {
    id: "p1",
    anchorId: "marketing-mastery",
    num: "Area 01",
    title: "Marketing Mastery",
    body: "How to communicate your value to the people who need it — in language they recognize, through channels they trust.",
    guideSlugs: ["one-page-marketing-plan", "what-your-ideal-client-looks-like"],
  },
  {
    id: "p2",
    anchorId: "sales-mastery",
    num: "Area 02",
    title: "Sales Mastery",
    body: "Why good conversations don't close — and what's actually happening in the moments buyers go quiet.",
    guideSlugs: ["why-good-sales-conversations-dont-close", "how-to-price-without-undercharging"],
  },
  {
    id: "p3",
    anchorId: "mindset-leadership",
    num: "Area 03",
    title: "Mindset & Leadership",
    body: "The internal clarity that makes external communication possible. You can't lead people you haven't learned to speak to.",
    guideSlugs: ["communication-habits-for-leaders"],
  },
  {
    id: "p4",
    anchorId: "strategy-execution",
    num: "Area 04",
    title: "Strategy & Execution",
    body: "A plan nobody understands doesn't get executed. Strategy is communication — from priorities to calendar.",
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

function areaCardLink(area: (typeof learningAreas)[number]): { href: string; label: string } {
  const guides = resolveGuides(area.guideSlugs);
  if (guides.length === 1) {
    return { href: getSiteGuideArticlePath(guides[0].slug), label: "Read the guide" };
  }
  return { href: `/learning-areas#${area.anchorId}`, label: "Browse this area" };
}

export function HomePageContent() {
  return (
    <>
      <section className="bic-hero" aria-label="Mission statement">
        <div className="site-container">
          <div className="bic-hero-inner">
            <span className="bic-hero-eyebrow">Nonprofit · Free · Canadian</span>
            <h1>
              Every Business Problem Is a Communication Problem <em>in Disguise</em>
            </h1>
            <p className="bic-hero-sub">
              Free communication education for entrepreneurs who are ready to make the impact they
              came here to make.
            </p>
            <div className="bic-hero-ctas">
              <Link href="/resources" className="btn-primary">
                Access Free Resources
              </Link>
              <Link href="/about" className="btn-ghost">
                About Our Mission
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="programs-section" aria-label="Program areas">
        <div className="site-container">
          <div className="mb-11">
            <p className="section-eyebrow">Free Learning Areas</p>
            <h2 className="section-title">Four Areas. One Root Cause.</h2>
            <p className="section-sub mt-3">
              Every learning area comes back to the same insight: most business problems are
              communication problems in disguise. We teach you to find them.
            </p>
          </div>
          <div className="programs-grid">
            {learningAreas.map((area) => {
              const link = areaCardLink(area);
              return (
                <div key={area.id} className={`program-card ${area.id}`}>
                  <span className="program-num">{area.num}</span>
                  <h3>{area.title}</h3>
                  <p>{area.body}</p>
                  <Link href={link.href} className="program-link">
                    {link.label}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="about-section" aria-label="About Business Impact Canada">
        <div className="site-container">
          <div className="about-grid">
            <div>
              <Image
                src="/images/ken.jpg"
                alt="Ken Krell, founder of Business Impact Canada"
                width={320}
                height={320}
                className="ken-photo"
                priority
              />
              <p className="ken-photo-caption">Ken Krell — Founder, Business Impact Canada</p>
            </div>
            <div className="about-content">
              <p className="section-eyebrow">Who We Are</p>
              <h2 className="section-title mb-4">
                Built by People Who Know What Poor Communication Costs
              </h2>
              <p>
                Business Impact Canada was founded on a specific observation: the entrepreneurs who
                struggle most aren&apos;t short on passion, intelligence, or work ethic.
                They&apos;re short on communication clarity — in their marketing, in their sales
                conversations, in how they lead, and in how they execute on a strategy.
              </p>
              <p>
                They can&apos;t articulate their value in a way buyers understand. They have great
                sales conversations that somehow don&apos;t close. They set a direction but
                can&apos;t get their team — or themselves — to follow it. These aren&apos;t
                personality problems. They&apos;re communication problems. And they&apos;re
                solvable.
              </p>
              <p>
                Business school costs thousands. Coaches charge $500/month. We made the good stuff
                free — because the world needs more businesses that actually work.
              </p>
              <Link href="/about" className="about-link">
                Read our full story →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
