"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { siteConfig } from "@/lib/site";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/programs", label: "Programs" },
  { href: "/resources", label: "Resources" },
  { href: "/contact", label: "Contact" },
] as const;

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block h-3.5 w-5" aria-hidden>
      <span
        className={
          "absolute left-0 block h-0.5 w-5 rounded-full bg-foreground transition-transform duration-200 " +
          (open ? "top-1.5 rotate-45" : "top-0")
        }
      />
      <span
        className={
          "absolute left-0 top-1.5 block h-0.5 w-5 rounded-full bg-foreground transition-opacity duration-200 " +
          (open ? "opacity-0" : "opacity-100")
        }
      />
      <span
        className={
          "absolute left-0 block h-0.5 w-5 rounded-full bg-foreground transition-transform duration-200 " +
          (open ? "top-1.5 -rotate-45" : "top-3")
        }
      />
    </span>
  );
}

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <div className="site-top-bar">
        Registered Canadian Nonprofit &nbsp;·&nbsp; 15213614 Canada Foundation &nbsp;·&nbsp; All
        programs free — always
      </div>
      <header className="sticky top-0 z-40 border-b border-border bg-white py-4">
        <div className="site-container">
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/"
              className="flex min-w-0 flex-col gap-0.5 rounded-md no-underline transition-opacity duration-200 hover:opacity-90"
              aria-label={`${siteConfig.name} — Home`}
            >
              <span className="font-serif text-[21px] leading-tight tracking-tight text-foreground">
                Business <span className="text-primary">Impact</span> Canada
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {siteConfig.tagline}
              </span>
            </Link>
            <button
              type="button"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-background md:hidden"
              aria-expanded={mobileOpen}
              aria-controls="site-mobile-nav"
              onClick={() => setMobileOpen((o) => !o)}
            >
              <span className="sr-only">{mobileOpen ? "Close menu" : "Open menu"}</span>
              <MenuIcon open={mobileOpen} />
            </button>
            <nav
              id="site-mobile-nav"
              aria-label="Main navigation"
              className={
                "absolute left-0 right-0 top-full z-50 flex-col gap-0 border-b border-border bg-white/95 p-2 shadow-md backdrop-blur-md md:static md:flex md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none " +
                (mobileOpen ? "flex" : "hidden md:flex")
              }
            >
              <ul className="flex list-none flex-col gap-0 p-0 md:flex-row md:flex-wrap md:items-center md:gap-1">
                {navLinks.map((l) => {
                  const active = isActive(l.href);
                  return (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className={
                          "block rounded-md px-3 py-3 text-sm font-medium transition-colors duration-200 md:px-3 md:py-1.5 " +
                          (active
                            ? "text-primary"
                            : "text-bic-ink-soft hover:text-primary md:hover:text-foreground")
                        }
                      >
                        {l.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
