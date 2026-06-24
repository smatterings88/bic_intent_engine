import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/build-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Donate — Business Impact Canada",
  description:
    "Support free business education for Canadian entrepreneurs. Your donation funds free programs, guides, and coaching resources for people who can't afford business school.",
  path: "/donate",
});

const impactItems = [
  "Free business planning workshops and webinars",
  "Downloadable guides, templates, and toolkits",
  "Mentorship program coordination and matching",
  "Resources for underserved and early-stage entrepreneurs",
  "Maintaining free access to all online programs",
  "Translation and accessibility of educational content",
] as const;

export default function DonatePage() {
  return (
    <>
      <section className="bic-page-hero">
        <div className="site-container">
          <div className="bic-page-hero-inner">
            <p className="section-eyebrow">Support the Mission</p>
            <h1>Support Free Business Education in Canada</h1>
            <p>
              Every dollar funds free programs, guides, and resources for entrepreneurs who
              can&apos;t afford business school or a coach.
            </p>
          </div>
        </div>
      </section>

      <div className="site-container">
        <div className="donate-grid">
          <div className="donate-card">
            <p className="donate-card-eyebrow">Make a Donation</p>
            <h2>Make a Donation</h2>
            <p>
              Choose any amount. All donations go directly to program delivery — never to overhead
              or administration.
            </p>
            <div className="amounts">
              <span className="amount-label">$25</span>
              <span className="amount-label featured">$50</span>
              <span className="amount-label">$100</span>
              <span className="amount-label">Other</span>
            </div>
            <a
              href="SQUARE_DONATE_LINK_HERE"
              className="donate-btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              Donate Securely via Square
            </a>
            <p className="secure-note">
              Your donation is processed securely by Square.
              <br />
              <strong>
                Business Impact Canada is a registered Canadian nonprofit (15213614 Canada
                Foundation).
              </strong>
              <br />
              We are a federally incorporated nonprofit. Please consult your tax advisor regarding
              deductibility.
            </p>
          </div>

          <div className="donate-card">
            <p className="donate-card-eyebrow">Where It Goes</p>
            <h2>Where Your Money Goes</h2>
            <p>
              We are a nonprofit. 100% of donations go to program delivery — free business education
              for Canadian entrepreneurs who need it most.
            </p>
            <ul className="impact-list">
              {impactItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Business school costs tens of thousands of dollars. A business coach costs $500–$2,000
              per month. We make the same quality of guidance available for free to any Canadian
              entrepreneur who needs it.
            </p>
            <div className="tax-note">
              <strong>About Tax Receipts</strong>
              Business Impact Canada (15213614 Canada Foundation) is a federally incorporated
              nonprofit. We are not currently a registered charity under the Income Tax Act.
              Donations are not automatically tax-deductible. Please consult your tax advisor for
              guidance specific to your situation.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
