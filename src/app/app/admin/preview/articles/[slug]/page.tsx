import type { Metadata } from "next";

import { AdminArticlePreviewClient } from "@/components/admin/preview/AdminArticlePreviewClient";

export const metadata: Metadata = {
  title: "Article preview — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminArticlePreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <div>
      <h1 className="font-serif text-xl text-foreground">Article preview</h1>
      <p className="mt-1 font-mono text-xs text-muted-foreground">{slug}</p>
      <div className="mt-6">
        <AdminArticlePreviewClient slug={slug} />
      </div>
    </div>
  );
}
