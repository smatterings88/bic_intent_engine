"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav() {
  const pathname = usePathname();
  const links = [
    { href: "/app/admin", label: "Overview" },
    { href: "/app/admin/zenith", label: "Zenith Pages" },
    { href: "/app/admin/articles", label: "Articles" },
    { href: "/app/admin/landing-pages", label: "Landing pages" },
    { href: "/app/admin/lead-magnets", label: "Lead magnets" },
    { href: "/app/admin/ingestions", label: "Ingestions" },
    { href: "/app/admin/leads", label: "Leads" },
    { href: "/app/admin/submissions", label: "Submissions" },
  ];
  return (
    <nav
      aria-label="Admin sections"
      className="-mx-1 flex flex-row gap-1 overflow-x-auto pb-1 lg:mx-0 lg:w-48 lg:shrink-0 lg:flex-col lg:overflow-visible lg:border-r lg:border-border lg:pr-4 lg:pb-0"
    >
      {links.map((l) => {
        const active = pathname === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={
              "shrink-0 rounded-md px-3 py-2 text-sm transition-colors duration-200 lg:w-full " +
              (active
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground")
            }
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
