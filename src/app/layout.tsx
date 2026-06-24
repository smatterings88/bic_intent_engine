import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import { siteConfig } from "@/lib/site";

import { AppProviders } from "@/app/providers";
import {
  GoogleTagManagerBody,
  GoogleTagManagerHead,
} from "@/components/analytics/GoogleTagManager";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-dm-serif",
  display: "swap",
});

const defaultTitle =
  "Business Impact Canada — Every Business Problem Is a Communication Problem in Disguise";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: defaultTitle,
  description: siteConfig.description,
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: "/favicon.png",
  },
  openGraph: {
    type: "website",
    title: defaultTitle,
    description: siteConfig.description,
    siteName: siteConfig.name,
    locale: "en_US",
    url: siteConfig.url,
    images: [{ url: siteConfig.openGraphImagePath, alt: siteConfig.name }],
  },
  twitter: {
    card: "summary",
    title: defaultTitle,
    description: siteConfig.description,
    images: [siteConfig.openGraphImagePath],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`${dmSans.variable} ${dmSerifDisplay.variable}`} lang="en">
      <head>
        <GoogleTagManagerHead />
      </head>
      <body>
        <GoogleTagManagerBody />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
