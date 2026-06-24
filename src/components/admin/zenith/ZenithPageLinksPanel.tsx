"use client";

import Link from "next/link";

import type { ZenithPage } from "@/types/zenith-content";
import { getPreviewPathForZenithPage, getPublicPathForZenithPage } from "@/lib/zenith/routes";

function Row({ label, href, muted }: { label: string; href?: string; muted?: boolean }) {
  if (!href) {
    return <p className="text-sm text-muted-foreground">{label}: —</p>;
  }
  return (
    <p className="text-sm">
      <span className={`font-medium ${muted ? "text-muted-foreground" : "text-foreground"}`}>
        {label}:
      </span>{" "}
      <Link href={href} target="_blank" className="text-primary underline">
        {href}
      </Link>
    </p>
  );
}

export function ZenithPageLinksPanel({ page }: { page: ZenithPage }) {
  const previewPath = getPreviewPathForZenithPage(page);
  const publicPath = page.status === "published" ? getPublicPathForZenithPage(page) : undefined;
  const ogUrl = `/api/og/${encodeURIComponent(page.slug)}`;
  const apiUrl = `/api/admin/zenith/pages/${encodeURIComponent(page.slug)}`;

  return (
    <section className="rounded-lg border border-border bg-background p-4 shadow-sm">
      <h2 className="text-sm font-medium text-foreground">Links</h2>
      <div className="mt-3 space-y-2">
        <Row label="Preview" href={previewPath} />
        <Row label="Public" href={publicPath} muted={page.status !== "published"} />
        <Row label="OG image" href={ogUrl} />
        <Row label="Admin API" href={apiUrl} />
      </div>
    </section>
  );
}
