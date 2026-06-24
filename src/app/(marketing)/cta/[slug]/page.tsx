import { notFound } from "next/navigation";

import { ZenithPageRenderer } from "@/components/zenith/ZenithPageRenderer";
import { isValidSlug } from "@/lib/content/slug";
import {
  getPublishedZenithPageBySlug,
  listPublishedZenithSlugsByContentType,
} from "@/lib/zenith/firestore";
import { buildZenithPageMetadata } from "@/lib/zenith/metadata";
import { getBaseUrl } from "@/lib/zenith/routes";

export const revalidate = 900;

export async function generateStaticParams() {
  return listPublishedZenithSlugsByContentType("cta_page");
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isValidSlug(slug)) {
    return { title: "CTA | Business Impact Canada", robots: { index: false, follow: false } };
  }
  const page = await getPublishedZenithPageBySlug(slug);
  if (!page || page.contentType !== "cta_page") {
    return { title: "CTA | Business Impact Canada", robots: { index: false, follow: false } };
  }
  return buildZenithPageMetadata(page);
}

export default async function ZenithCtaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isValidSlug(slug)) notFound();
  const page = await getPublishedZenithPageBySlug(slug);
  if (!page || page.contentType !== "cta_page") notFound();
  return <ZenithPageRenderer page={page} mode="public" relatedCards={[]} baseUrl={getBaseUrl()} />;
}
