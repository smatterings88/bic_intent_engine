import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";

export const metadata: Metadata = {
  title: "App — Sales Breakdown Institute",
  description: "Authenticated workspace for the Sales Breakdown Institute.",
  robots: { index: false, follow: false },
};

export default function AppSegmentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AppShell>{children}</AppShell>;
}
