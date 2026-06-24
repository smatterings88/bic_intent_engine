"use client";

import Link from "next/link";

import type { AdminZenithPageListItem } from "@/lib/admin/zenith-client-actions";
import { ZenithPublishButton } from "@/components/admin/zenith/ZenithPublishButton";
import { ZenithUnpublishButton } from "@/components/admin/zenith/ZenithUnpublishButton";

export function ZenithPageActions({
  page,
  onRefresh,
}: {
  page: AdminZenithPageListItem;
  onRefresh: () => void;
}) {
  const isDraft = page.status === "draft";
  const isPublished = page.status === "published";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={page.previewUrl || `/preview/${page.slug}`}
        target="_blank"
        className="text-xs text-primary underline"
      >
        Preview
      </Link>
      {isPublished ? (
        <Link href={page.publicUrl} target="_blank" className="text-xs text-primary underline">
          Public
        </Link>
      ) : (
        <span className="text-xs text-muted-foreground">Public</span>
      )}
      <Link href={page.ogImageUrl} target="_blank" className="text-xs text-primary underline">
        OG
      </Link>
      <Link
        href={`/app/admin/zenith/${encodeURIComponent(page.slug)}`}
        className="text-xs text-primary underline"
      >
        Detail
      </Link>
      <div className="ml-1 flex flex-wrap items-center gap-1">
        {isDraft ? (
          <ZenithPublishButton
            slug={page.slug}
            onDone={() => {
              onRefresh();
            }}
          />
        ) : null}
        {isPublished ? (
          <ZenithUnpublishButton
            slug={page.slug}
            onDone={() => {
              onRefresh();
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
