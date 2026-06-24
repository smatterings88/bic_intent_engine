import Link from "next/link";

import { AdminZenithPageDetailClient } from "@/components/admin/zenith/AdminZenithPageDetailClient";

export default async function AdminZenithPageDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/app/admin/zenith" className="text-sm text-primary underline">
          ← Back to Zenith pages
        </Link>
      </div>
      <AdminZenithPageDetailClient slug={slug} />
    </div>
  );
}
