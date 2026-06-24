import { headers } from "next/headers";

import { SiteLayoutShell } from "@/components/site/SiteLayoutShell";
import { resolveHideGlobalFooterForPathname } from "@/lib/zenith/resolve-public-layout";

export async function SiteLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const initialHideGlobalFooter = await resolveHideGlobalFooterForPathname(pathname);

  return (
    <SiteLayoutShell initialHideGlobalFooter={initialHideGlobalFooter}>{children}</SiteLayoutShell>
  );
}
