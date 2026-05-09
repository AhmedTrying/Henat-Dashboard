import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { organizationLd, websiteLd } from "@/lib/seo";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Hantavirus Dashboard — Latest official statistics & developer API",
    template: "%s · Hantavirus Dashboard",
  },
  description:
    "Latest official Hantavirus statistics, outbreak updates, and developer-ready data exports. Aggregated from WHO, CDC, ECDC, PAHO and national health ministries.",
  keywords: [
    "Hantavirus",
    "hantavirus dashboard",
    "outbreak statistics",
    "WHO",
    "CDC",
    "ECDC",
    "PAHO",
    "public health data",
    "developer API",
  ],
  openGraph: {
    type: "website",
    title: "Hantavirus Dashboard",
    description:
      "Latest official Hantavirus statistics and developer-ready data exports with source transparency.",
    url: SITE_URL,
    siteName: "Hantavirus Dashboard",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hantavirus Dashboard",
    description:
      "Latest official Hantavirus statistics and developer-ready data exports with source transparency.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fafafa",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;450;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <JsonLd data={organizationLd()} />
        <JsonLd data={websiteLd()} />
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          <Navbar />
          <div style={{ flex: 1 }}>{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
