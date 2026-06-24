import type { Metadata } from "next";

import { AdminLandingPreviewClient } from "@/components/admin/preview/AdminLandingPreviewClient";

export const metadata: Metadata = {
  title: "Landing preview — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLandingPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <div>
      <h1 className="font-serif text-xl text-foreground">Landing page preview</h1>
      <p className="mt-1 font-mono text-xs text-muted-foreground">{slug}</p>
      <div className="mt-6">
        <AdminLandingPreviewClient slug={slug} />
      </div>
    </div>
  );
}
