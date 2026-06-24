import type { Metadata } from "next";
import { ContactInquiryForm } from "@/components/site/ContactInquiryForm";
import { PageHeader } from "@/components/site/PageHeader";
import { buildPageMetadata } from "@/lib/build-metadata";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact — Business Impact Canada",
  description: "Contact Business Impact Canada for program questions and general correspondence.",
  path: "/contact",
});

export default function ContactPage() {
  const { email, legalName, address } = siteConfig;

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Get in touch."
        lede="Questions about our programs, resources, or nonprofit mission? We welcome your message and aim to reply within a few business days."
      />
      <section className="mx-auto grid max-w-4xl gap-12 py-14 page-gutter sm:gap-14 sm:py-16 md:grid-cols-[1fr_320px]">
        <div>
          <ContactInquiryForm />
        </div>
        <aside className="space-y-8 text-sm">
          <div>
            <div className="eyebrow mb-2">Email</div>
            <a href={`mailto:${email}`} className="text-foreground hover:text-primary">
              {email}
            </a>
          </div>
          <div>
            <div className="eyebrow mb-2">Registered Office</div>
            <div className="leading-relaxed text-foreground">
              {siteConfig.name}
              <br />
              {legalName}
              <br />
              {address.line1}
              <br />
              {address.city}, {address.region} {address.postalCode}
              <br />
              {address.country}
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}
