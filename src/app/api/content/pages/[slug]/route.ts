import { getPublishedZenithPageBySlug } from "@/lib/zenith/firestore";
import { getOgImageUrlForPage } from "@/lib/zenith/og";
import {
  buildAbsoluteUrl,
  getBaseUrl,
  getPreviewPathForZenithPage,
  getPublicPathForZenithPage,
} from "@/lib/zenith/routes";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const page = await getPublishedZenithPageBySlug(slug);
  if (!page) {
    return Response.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  const base = getBaseUrl();
  const publicPath = getPublicPathForZenithPage(page);
  return Response.json({
    ok: true,
    slug: page.slug,
    title: page.title,
    contentType: page.contentType,
    status: page.status,
    seo: page.seo,
    ogImage: page.ogImage,
    leadMagnetId: page.leadMagnetId,
    relatedArticleSlugs: page.relatedArticleSlugs,
    schema: page.schema,
    components: page.components,
    componentSpecVersion: page.componentSpecVersion,
    publicUrl: buildAbsoluteUrl(publicPath),
    ogImageUrl: getOgImageUrlForPage(page, base),
    previewUrl: buildAbsoluteUrl(getPreviewPathForZenithPage(page)),
  });
}
