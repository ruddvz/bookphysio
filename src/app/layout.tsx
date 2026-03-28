import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "bookphysio.in — Book Physiotherapists Online",
  description:
    "Find and book physiotherapists near you who accept your health insurance. In-clinic, home visits, and online sessions available across India.",
  keywords: "physiotherapist, physiotherapy, book physio, physio near me, India",
  openGraph: {
    title: "bookphysio.in — Book Physiotherapists Online",
    description:
      "Find and book physiotherapists near you who accept your health insurance.",
    siteName: "bookphysio.in",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
