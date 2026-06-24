import type { Metadata } from "next";

import { HomePageContent } from "@/components/site/HomePageContent";
import { buildPageMetadata } from "@/lib/build-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Business Impact Canada — Every Business Problem Is a Communication Problem in Disguise",
  description:
    "Free communication education for entrepreneurs who are ready to make the impact they came here to make. Nonprofit-backed, always free.",
  path: "/",
});

export default function HomePage() {
  return <HomePageContent />;
}
