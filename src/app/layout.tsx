import type { Metadata, Viewport } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/app/providers";
import { CookieConsent } from "@/components/CookieConsent";
import { PublicAnalytics } from "@/components/PublicAnalytics";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bookphysio.in"),
  title: "Book Physiotherapists Online in India | Home Visits | BookPhysio.in",
  description:
    "India's first physio-only booking platform. Find and book ICP-verified physiotherapists for home visits and in-clinic sessions across 18 cities. Same-day slots available.",
  keywords: "physiotherapist near me, book physiotherapist online India, home visit physiotherapy, physio booking India",
  icons: {
    icon: "/icon.png?v=20260404b",
    shortcut: "/icon.png?v=20260404b",
    apple: "/icon.png?v=20260404b",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    title: "BookPhysio",
    statusBarStyle: "default",
    capable: true,
  },
  alternates: {
    canonical: "https://bookphysio.in",
  },
  openGraph: {
    title: "Book Physiotherapists Online in India | Home Visits | BookPhysio.in",
    description:
      "India's first physio-only platform. ICP-verified physiotherapists for home visits and in-clinic sessions across 18 Indian cities.",
    siteName: "BookPhysio",
    type: "website",
    url: "https://bookphysio.in",
    locale: "en_IN",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "BookPhysio — Book Verified Physiotherapists in India",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Book Physiotherapists Online in India | Home Visits | BookPhysio.in",
    description:
      "India's first physio-only platform. ICP-verified physiotherapists for home visits and in-clinic sessions across 18 Indian cities.",
    images: ["/opengraph-image"],
  },
};

export const viewport: Viewport = {
  themeColor: "#18312D",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <noscript>You need JavaScript enabled to use BookPhysio.</noscript>
        <Providers>{children}</Providers>
        <CookieConsent />
        <PublicAnalytics />
      </body>
    </html>
  );
}
