import type { Metadata } from "next";
import { PageHeader } from "@/components/site/PageHeader";
import { buildPageMetadata } from "@/lib/build-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Terms of Use — Business Impact Canada",
  description: "Terms of use for Business Impact Canada website.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Terms of Use" lede="Last updated: January 2026" />
      <article className="mx-auto max-w-3xl space-y-8 py-14 prose-research page-gutter sm:py-16">
        <section>
          <h2 className="font-serif text-xl text-foreground mb-3">Acceptance</h2>
          <p>
            By accessing the Business Impact Canada website, you agree to these terms. If you do not
            agree, please discontinue use of the site.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-xl text-foreground mb-3">Use of content</h2>
          <p>
            Programs, articles, and other materials published by Business Impact Canada are made
            available for educational and informational purposes. Excerpts may be quoted with
            appropriate attribution. Reproduction of full publications requires written permission.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-xl text-foreground mb-3">No professional advice</h2>
          <p>
            Materials on this site are for educational purposes and should not be construed as
            professional, financial, or legal advice. Business Impact Canada makes no warranty
            regarding the application of its content to any specific organization or context.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-xl text-foreground mb-3">Limitation of liability</h2>
          <p>
            Business Impact Canada is not liable for any direct or indirect loss arising from the
            use of materials on this website.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-xl text-foreground mb-3">Changes</h2>
          <p>
            These terms may be revised periodically. Continued use of the website constitutes
            acceptance of any updates.
          </p>
        </section>
      </article>
    </>
  );
}
