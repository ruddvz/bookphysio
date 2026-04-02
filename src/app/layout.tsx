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
  title: "BookPhysio — Book Physiotherapists",
  description:
    "Find and book physiotherapists near you. In-clinic and home visits available across India.",
  keywords: "physiotherapist, physiotherapy, book physio, physio near me, India",
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
  openGraph: {

    title: "BookPhysio — Book Physiotherapists",
    description:
      "Find and book physiotherapists near you.",
    siteName: "BookPhysio",
    type: "website",
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
    <html lang="en" className={`${inter.variable} ${fraunces.variable} h-full antialiased`} data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
