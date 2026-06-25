import { SiteLayoutShell } from "@/components/site/SiteLayoutShell";

/** Marketing shell — footer visibility for Zenith html_snippet pages is set client-side via `ZenithSiteLayoutRegistrar`. */
export function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteLayoutShell>{children}</SiteLayoutShell>;
}
