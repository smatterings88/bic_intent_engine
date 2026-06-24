import type { Metadata } from "next";
import { siteConfig } from "./site";

/** Absolute URL for the site (canonical, OG url, etc.). */
export function absoluteUrl(path: string): string {
  const base = siteConfig.url.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

/** Shared Open Graph defaults (root layout + page metadata). */
export function defaultOpenGraphExtras(): Partial<NonNullable<Metadata["openGraph"]>> {
  return {
    type: "website",
    images: [
      {
        url: siteConfig.openGraphImagePath,
        alt: siteConfig.name,
      },
    ],
  };
}

/** Build page-level metadata with canonical + OG/Twitter parity. */
export function buildPageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  openGraph?: Partial<NonNullable<Metadata["openGraph"]>>;
}): Metadata {
  const url = absoluteUrl(opts.path);
  return {
    title: opts.title,
    description: opts.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: siteConfig.name,
      locale: "en_US",
      ...defaultOpenGraphExtras(),
      ...opts.openGraph,
    },
    twitter: {
      card: "summary",
      title: opts.title,
      description: opts.description,
      images: [siteConfig.openGraphImagePath],
    },
  };
}
