import type { Metadata } from "next";

import { ZenithPreviewClient } from "@/components/zenith/ZenithPreviewClient";
import { getBaseUrl } from "@/lib/zenith/routes";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Zenith preview",
  robots: { index: false, follow: false },
};

export default async function ZenithPreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const baseUrl = getBaseUrl();
  return (
    <div className="min-h-screen bg-slate-950">
      <ZenithPreviewClient slug={slug} baseUrl={baseUrl} />
    </div>
  );
}
