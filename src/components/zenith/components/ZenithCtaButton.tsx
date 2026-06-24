import Link from "next/link";

import { getHrefForZenithDestination } from "@/lib/zenith/destinations";
import type { ZenithCta, ZenithPage } from "@/types/zenith-content";

import { cn } from "@/lib/utils";

const baseBtn =
  "inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

export function ZenithCtaButton({
  cta,
  destination,
  label,
  variant = "primary",
  page,
  className,
}: {
  cta?: ZenithCta;
  destination?: string;
  label?: string;
  variant?: "primary" | "secondary" | "light" | "dark";
  page?: ZenithPage;
  className?: string;
}) {
  const dest = (cta?.destination ?? destination ?? "").trim();
  const text = (cta?.label ?? label ?? "Learn more").trim();
  const href = getHrefForZenithDestination(dest, page);
  const isHash = href.startsWith("#");
  const variantClass =
    variant === "primary"
      ? "bg-[#1e3560] text-white focus-visible:outline-[#1e3560]"
      : variant === "secondary"
        ? "border border-[#1e3560] text-[#1e3560] bg-transparent"
        : variant === "light"
          ? "bg-white text-[#1e3560]"
          : "bg-slate-900 text-white";

  const dataAttrs = {
    "data-zenith-cta-destination": dest || undefined,
    "data-zenith-page-slug": page?.slug,
    "data-zenith-content-type": page?.contentType,
  } as Record<string, string | undefined>;

  if (isHash) {
    return (
      <a href={href} className={cn(baseBtn, variantClass, className)} {...dataAttrs}>
        {text}
      </a>
    );
  }
  return (
    <Link href={href} className={cn(baseBtn, variantClass, className)} {...dataAttrs}>
      {text}
    </Link>
  );
}
