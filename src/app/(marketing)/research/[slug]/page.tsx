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
  return listPublishedZenithSlugsByContentType("research_page");
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isValidSlug(slug)) {
    return {
      title: "Research | Sales Breakdown Institute",
      robots: { index: false, follow: false },
    };
  }
  const page = await getPublishedZenithPageBySlug(slug);
  if (!page || page.contentType !== "research_page") {
    return {
      title: "Research | Sales Breakdown Institute",
      robots: { index: false, follow: false },
    };
  }
  return buildZenithPageMetadata(page);
}

export default async function ZenithResearchDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isValidSlug(slug)) notFound();
  const page = await getPublishedZenithPageBySlug(slug);
  if (!page || page.contentType !== "research_page") notFound();
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
