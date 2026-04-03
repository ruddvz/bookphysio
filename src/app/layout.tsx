import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/app/providers";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
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
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
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
    <html lang="en" className={`${inter.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <noscript>You need JavaScript enabled to use BookPhysio.</noscript>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
