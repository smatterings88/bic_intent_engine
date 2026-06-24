import { notFound } from "next/navigation";

import { ZenithPageRenderer } from "@/components/zenith/ZenithPageRenderer";
import { isValidSlug } from "@/lib/content/slug";
import {
  getPublishedZenithPageBySlug,
  listPublishedZenithSlugsByContentType,
} from "@/lib/zenith/firestore";
import { buildZenithPageMetadata } from "@/lib/zenith/metadata";
import { getRelatedPublishedZenithPages } from "@/lib/zenith/related";
import { getBaseUrl } from "@/lib/zenith/routes";

export const revalidate = 900;

export async function generateStaticParams() {
  return listPublishedZenithSlugsByContentType("webinar_page");
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isValidSlug(slug)) {
    return {
      title: "Webinar | Sales Breakdown Institute",
      robots: { index: false, follow: false },
    };
  }
  const page = await getPublishedZenithPageBySlug(slug);
  if (!page || page.contentType !== "webinar_page") {
    return {
      title: "Webinar | Sales Breakdown Institute",
      robots: { index: false, follow: false },
    };
  }
  return buildZenithPageMetadata(page);
}

export default async function ZenithWebinarPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isValidSlug(slug)) notFound();
  const page = await getPublishedZenithPageBySlug(slug);
  if (!page || page.contentType !== "webinar_page") notFound();
  const relatedCards = await getRelatedPublishedZenithPages(page.relatedArticleSlugs ?? []);
  return (
    <ZenithPageRenderer
      page={page}
      mode="public"
      relatedCards={relatedCards}
      baseUrl={getBaseUrl()}
    />
  );
}
