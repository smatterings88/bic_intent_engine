"use client";

import type { ReactNode } from "react";

import { Header } from "./Header";
import { SiteFooterGate, ZenithSiteLayoutProvider } from "./ZenithSiteLayoutContext";

export function SiteLayoutShell({
  children,
  initialHideGlobalFooter = false,
}: {
  children: ReactNode;
  initialHideGlobalFooter?: boolean;
}) {
  return (
    <ZenithSiteLayoutProvider initialHideGlobalFooter={initialHideGlobalFooter}>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="relative flex-1">{children}</main>
        <SiteFooterGate />
      </div>
    </ZenithSiteLayoutProvider>
  );
}
