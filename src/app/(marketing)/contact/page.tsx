import type { Metadata } from "next";
import { ContactInquiryForm } from "@/components/site/ContactInquiryForm";
import { PageHeader } from "@/components/site/PageHeader";
import { buildPageMetadata } from "@/lib/build-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact — Sales Breakdown Institute",
  description: "Contact the Sales Breakdown Institute for research inquiries and correspondence.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Correspondence and research inquiries."
        lede="The Institute welcomes inquiries from researchers, educators, and practitioners. Please allow several business days for a reply."
      />
      <section className="mx-auto grid max-w-4xl gap-12 py-14 page-gutter sm:gap-14 sm:py-16 md:grid-cols-[1fr_320px]">
        <div>
          <ContactInquiryForm />
        </div>
        <aside className="space-y-8 text-sm">
          <div>
            <div className="eyebrow mb-2">Email</div>
            <div className="text-foreground">research@salesbreakdowninstitute.com</div>
          </div>
          <div>
            <div className="eyebrow mb-2">Registered Office</div>
            <div className="text-foreground leading-relaxed">
              Sales Breakdown Institute
              <br />
              1717 N Street NW, STE 1
              <br />
              Washington, D.C. 20036
              <br />
              United States
            </div>
          </div>
          <div>
            <div className="eyebrow mb-2">Mailing / Operations</div>
            <div className="text-foreground leading-relaxed">
              Sales Breakdown Institute
              <br />
              1968 S. Coast Hwy, #265
              <br />
              Laguna Beach, CA 92651
              <br />
              United States
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}
