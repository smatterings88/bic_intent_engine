import type { Metadata } from "next";
import Link from "next/link";

import { buildPageMetadata } from "@/lib/build-metadata";
import { formatPublishedLabel } from "@/lib/content/format-publish-date";
import { getSiteGuideArticlePath, siteGuidesByCategory } from "@/lib/site-guides";

export const metadata: Metadata = buildPageMetadata({
  title: "Free Resources — Business Impact Canada",
  description:
    "Free guides and frameworks for Canadian entrepreneurs. Communication skills for sales, marketing, leadership, and strategy — all free, nonprofit-backed, no email required.",
  path: "/resources",
});

export default function ResourcesPage() {
  const resourceCategories = siteGuidesByCategory();

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
                <Link
                  key={resource.slug}
                  href={getSiteGuideArticlePath(resource.slug)}
                  className="resource-card"
                >
                  <div className="resource-tag">{resource.tag}</div>
                  <h3>{resource.title}</h3>
                  <p>{resource.description}</p>
                  <span className="resource-link">
                    Read Guide →{" "}
                    <span className="sr-only">({formatPublishedLabel(resource.publishedAt)})</span>
                  </span>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {formatPublishedLabel(resource.publishedAt)}
                  </p>
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
            New guides and articles are published on our{" "}
            <Link href="/articles" className="underline underline-offset-4 hover:text-white">
              blog
            </Link>
            . Everything stays free — nonprofit-backed, no paywalls.
          </p>
          <Link href="/articles" className="btn-primary">
            Browse the Blog
          </Link>
        </div>
      </div>
    </>
  );
}
