import type { Metadata } from "next";

import { AppProviders } from "@/app/providers";
import { AppShell } from "@/components/app/AppShell";

export const metadata: Metadata = {
  title: "App — Business Impact Canada",
  description: "Authenticated workspace for Business Impact Canada.",
  robots: { index: false, follow: false },
};

export default function AppSegmentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppProviders>
      <AppShell>{children}</AppShell>
    </AppProviders>
  );
}
