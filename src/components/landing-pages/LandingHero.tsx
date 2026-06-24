import Link from "next/link";

import type { LandingPage } from "@/types/landing-page";

function isInternalHref(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}

function CtaLink({ href, label }: { href: string; label: string }) {
  if (isInternalHref(href)) {
    return (
      <Link href={href} className="btn-primary">
        {label}
      </Link>
    );
  }
  return (
    <a href={href} className="btn-primary">
      {label}
    </a>
  );
}

function SecondaryCta({ href, label }: { href: string; label: string }) {
  const className = "btn-secondary";
  if (isInternalHref(href)) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    );
  }
  return (
    <a href={href} className={className}>
      {label}
    </a>
  );
}

export function LandingHero({ landingPage }: { landingPage: LandingPage }) {
  const { hero } = landingPage;
  return (
    <header className="border-b border-border bg-gradient-to-b from-muted/45 to-background">
      <div className="mx-auto max-w-4xl py-14 page-gutter md:py-20">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {hero.eyebrow}
        </div>
        <h1 className="mt-4 font-serif text-3xl leading-[1.1] text-foreground sm:text-4xl md:text-5xl">
          {hero.headline}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed max-w-2xl">
          {hero.subheadline}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <CtaLink href={hero.primaryCtaHref} label={hero.primaryCtaLabel} />
          {hero.secondaryCtaLabel && hero.secondaryCtaHref ? (
            <SecondaryCta href={hero.secondaryCtaHref} label={hero.secondaryCtaLabel} />
          ) : null}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          <span className="font-medium text-foreground/80">Primary intent:</span>{" "}
          {landingPage.keyword.primary}
        </p>
      </div>
    </header>
  );
}
