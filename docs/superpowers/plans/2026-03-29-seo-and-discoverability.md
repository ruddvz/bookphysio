# SEO & Discoverability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make bookphysio.in fully discoverable — security headers, sitemap, robots.txt, per-page metadata, Open Graph tags, and IndexNow ping on deploy.

**Architecture:** All SEO wiring happens in Next.js App Router conventions (`metadata` exports, `sitemap.ts`, `robots.ts`). Security headers go in `next.config.ts` via the `headers()` function. IndexNow key lives in `public/` and is pinged via a post-deploy script. No new dependencies needed except `next-sitemap` is skipped in favour of the built-in App Router sitemap API.

**Tech Stack:** Next.js 15 App Router, TypeScript, `next.config.ts` headers API, `src/app/sitemap.ts`, `src/app/robots.ts`, IndexNow REST API

**Note on `output: "export"`:** The current `next.config.ts` uses `output: "export"` (static export for GitHub Pages). The built-in `sitemap.ts` and `robots.ts` Route Handlers are supported in static export as of Next.js 14+. However, `headers()` in `next.config.ts` only applies when running Next.js as a server — for a static export served via GitHub Pages or Vercel's CDN, security headers must be set at the hosting layer (Vercel `vercel.json` or GitHub Pages is limited). **Task 1 covers both approaches.** If the app moves to a server deployment, `next.config.ts` headers will take effect automatically.

---

## File Map

| File | Action | What it does |
|------|--------|--------------|
| `next.config.ts` | Modify | Add `headers()` for security headers (active on server deploy) |
| `vercel.json` | Create | Security headers for Vercel static/CDN deployment |
| `src/app/sitemap.ts` | Create | Generates `/sitemap.xml` — all public routes |
| `src/app/robots.ts` | Create | Generates `/robots.txt` — allow public, block admin/api/provider/patient |
| `src/app/layout.tsx` | Modify | Enrich root `metadata` — add `og:image`, `og:url`, Twitter card, canonical |
| `src/app/page.tsx` | Modify | Add homepage-specific `metadata` export |
| `src/app/search/page.tsx` | Modify | Add `metadata` export |
| `src/app/about/page.tsx` | Modify | Add `metadata` export |
| `src/app/faq/page.tsx` | Modify | Add `metadata` export |
| `src/app/how-it-works/page.tsx` | Modify | Add `metadata` export |
| `src/app/privacy/page.tsx` | Modify | Add `metadata` export |
| `src/app/terms/page.tsx` | Modify | Add `metadata` export |
| `src/app/doctor/[id]/page.tsx` | Modify | Add `generateMetadata` (dynamic — doctor name + city) |
| `src/app/specialty/[slug]/page.tsx` | Modify | Add `generateMetadata` |
| `src/app/city/[slug]/page.tsx` | Modify | Add `generateMetadata` |
| `public/og-image.png` | Note | Must be created manually (1200×630) — placeholder task included |
| `public/<indexnow-key>.txt` | Create | IndexNow verification key file |
| `scripts/ping-indexnow.ts` | Create | Script to ping IndexNow API after deploy |
| `docs/planning/ops-seo.md` | Create | How to submit to Google/Bing Search Console (manual steps) |

---

## Task 1: Security Headers

**Files:**
- Modify: `next.config.ts`
- Create: `vercel.json`

### Why both?
`next.config.ts` `headers()` only runs on a Node.js server. Since the project currently uses `output: "export"`, headers are served by whatever hosts the static files. `vercel.json` sets headers at Vercel's CDN edge — this works for static exports too.

- [ ] **Step 1: Add headers to `next.config.ts`**

Replace the contents of `next.config.ts` with:

```typescript
import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://api.razorpay.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.razorpay.com https://api.msg91.com https://prod-in.100ms.live wss://prod-in.100ms.live https://api.mapbox.com",
      "frame-src https://api.razorpay.com https://checkout.razorpay.com",
      "media-src 'self' blob:",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/bookphysio",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 2: Create `vercel.json` for CDN-level headers**

Create `vercel.json` in the project root:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" }
      ]
    }
  ]
}
```

Note: CSP is omitted from `vercel.json` deliberately — it's complex and better managed in `next.config.ts` where you can maintain it as an array. Keep them in sync if the site moves off Vercel.

- [ ] **Step 3: Build and verify no errors**

```bash
rtk next build
```

Expected: build succeeds, no TS errors on `next.config.ts`.

- [ ] **Step 4: Commit**

```bash
rtk git add next.config.ts vercel.json
rtk git commit -m "feat: add security headers (CSP, HSTS, X-Frame-Options)"
```

---

## Task 2: robots.txt

**Files:**
- Create: `src/app/robots.ts`

Next.js App Router generates `/robots.txt` from a `robots.ts` file in `src/app/`. This works with static export.

- [ ] **Step 1: Create `src/app/robots.ts`**

```typescript
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/patient/",
          "/provider/",
          "/api/",
          "/(auth)/",
        ],
      },
    ],
    sitemap: "https://bookphysio.in/sitemap.xml",
  };
}
```

- [ ] **Step 2: Build and check the output**

```bash
rtk next build
```

Then open `.next/server/app/robots.txt` (or visit `/robots.txt` in dev) and confirm it looks correct.

- [ ] **Step 3: Commit**

```bash
rtk git add src/app/robots.ts
rtk git commit -m "feat: add robots.txt via Next.js App Router"
```

---

## Task 3: Sitemap

**Files:**
- Create: `src/app/sitemap.ts`

The sitemap lists all public pages. Dynamic pages (doctor profiles, city pages, specialty pages) will list their known slugs. Since the app currently uses mock/static data, slugs are hardcoded for now — replace with DB queries when Supabase is wired.

- [ ] **Step 1: Create `src/app/sitemap.ts`**

```typescript
import type { MetadataRoute } from "next";

const BASE_URL = "https://bookphysio.in";

// Static public routes
const staticRoutes = [
  "",           // homepage
  "/search",
  "/about",
  "/faq",
  "/how-it-works",
  "/privacy",
  "/terms",
];

// Known specialty slugs — replace with DB query when Supabase is wired
const specialtySlugs = [
  "sports-physiotherapy",
  "neurological-physiotherapy",
  "orthopedic-physiotherapy",
  "pediatric-physiotherapy",
  "post-surgical-rehabilitation",
  "back-pain",
  "neck-pain",
];

// Known city slugs — replace with DB query when Supabase is wired
const citySlugs = [
  "mumbai",
  "delhi",
  "bangalore",
  "hyderabad",
  "chennai",
  "pune",
  "kolkata",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1.0 : 0.8,
  }));

  const specialtyEntries: MetadataRoute.Sitemap = specialtySlugs.map((slug) => ({
    url: `${BASE_URL}/specialty/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const cityEntries: MetadataRoute.Sitemap = citySlugs.map((slug) => ({
    url: `${BASE_URL}/city/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...specialtyEntries, ...cityEntries];
}
```

- [ ] **Step 2: Build and verify**

```bash
rtk next build
```

Confirm `sitemap.xml` is generated in the build output.

- [ ] **Step 3: Commit**

```bash
rtk git add src/app/sitemap.ts
rtk git commit -m "feat: add sitemap.xml via Next.js App Router"
```

---

## Task 4: Root Layout Metadata

**Files:**
- Modify: `src/app/layout.tsx`

The root layout already has basic metadata. Add `og:image`, `og:url`, Twitter card tags, and a metadataBase so relative URLs resolve correctly.

- [ ] **Step 1: Create the OG image placeholder**

Create `public/og-image.png` — a 1200×630 image. For now, use any placeholder. The real one needs to be designed (teal background, BookPhysio logo, tagline). Just ensure the file exists so the tag doesn't 404.

You can generate a quick placeholder via:
```bash
# If ImageMagick is available:
magick -size 1200x630 xc:#00766C -font Arial -pointsize 60 -fill white -gravity center -annotate 0 "BookPhysio.in" public/og-image.png
# Otherwise add a placeholder manually in public/og-image.png
```

**Important:** Replace with a real branded image before launch.

- [ ] **Step 2: Update `src/app/layout.tsx` metadata**

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bookphysio.in"),
  title: {
    default: "BookPhysio — Book Physiotherapists Online in India",
    template: "%s | BookPhysio",
  },
  description:
    "Find and book physiotherapists near you. In-clinic, home visits, and online sessions available across India. Instant booking, verified physios.",
  keywords: "physiotherapist, physiotherapy, book physio, physio near me, home physio, online physio, India",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "BookPhysio — Book Physiotherapists Online in India",
    description:
      "Find and book physiotherapists near you. In-clinic, home visits, and online sessions across India.",
    siteName: "BookPhysio",
    url: "https://bookphysio.in",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BookPhysio — Book Physiotherapists Online in India",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BookPhysio — Book Physiotherapists Online in India",
    description:
      "Find and book physiotherapists near you. In-clinic, home visits, and online sessions across India.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Build and verify**

```bash
rtk next build
```

- [ ] **Step 4: Commit**

```bash
rtk git add src/app/layout.tsx public/og-image.png
rtk git commit -m "feat: enrich root metadata with OG image, Twitter card, metadataBase"
```

---

## Task 5: Per-Page Metadata (Static Pages)

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/search/page.tsx`
- Modify: `src/app/about/page.tsx`
- Modify: `src/app/faq/page.tsx`
- Modify: `src/app/how-it-works/page.tsx`
- Modify: `src/app/privacy/page.tsx`
- Modify: `src/app/terms/page.tsx`

Each public page needs a unique `metadata` export. The root layout's `template: "%s | BookPhysio"` means you only need to set the short title per page.

- [ ] **Step 1: Read each page file to understand current exports**

Read each file before editing. Do them one at a time. The pattern is the same for all:

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Title Here",       // → renders as "Page Title Here | BookPhysio"
  description: "Page description under 160 chars.",
};
```

- [ ] **Step 2: Add metadata to `src/app/page.tsx` (homepage)**

```typescript
export const metadata: Metadata = {
  title: "Book Physiotherapists Online in India",
  description:
    "Find verified physiotherapists near you. Book in-clinic, home visit, or online sessions instantly. Serving Mumbai, Delhi, Bangalore, and more.",
};
```

- [ ] **Step 3: Add metadata to `src/app/search/page.tsx`**

```typescript
export const metadata: Metadata = {
  title: "Find Physiotherapists Near You",
  description:
    "Search and filter physiotherapists by location, specialty, availability, and visit type. Instant booking available.",
};
```

- [ ] **Step 4: Add metadata to `src/app/about/page.tsx`**

```typescript
export const metadata: Metadata = {
  title: "About BookPhysio",
  description:
    "BookPhysio connects patients with verified physiotherapists across India for in-clinic, home visit, and online sessions.",
};
```

- [ ] **Step 5: Add metadata to `src/app/faq/page.tsx`**

```typescript
export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Answers to common questions about booking physiotherapy sessions, payments, cancellations, and home visits on BookPhysio.",
};
```

- [ ] **Step 6: Add metadata to `src/app/how-it-works/page.tsx`**

```typescript
export const metadata: Metadata = {
  title: "How BookPhysio Works",
  description:
    "Search for a physiotherapist, pick a slot, pay securely, and get treated — in-clinic, at home, or online. Here's how it works.",
};
```

- [ ] **Step 7: Add metadata to `src/app/privacy/page.tsx`**

```typescript
export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How BookPhysio collects, uses, and protects your personal data. Read our privacy policy.",
};
```

- [ ] **Step 8: Add metadata to `src/app/terms/page.tsx`**

```typescript
export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms and conditions for using BookPhysio — for patients and physiotherapy providers.",
};
```

- [ ] **Step 9: Build to verify no errors**

```bash
rtk next build
```

- [ ] **Step 10: Commit**

```bash
rtk git add src/app/page.tsx src/app/search/page.tsx src/app/about/page.tsx src/app/faq/page.tsx src/app/how-it-works/page.tsx src/app/privacy/page.tsx src/app/terms/page.tsx
rtk git commit -m "feat: add per-page metadata to all static public pages"
```

---

## Task 6: Dynamic Page Metadata

**Files:**
- Modify: `src/app/doctor/[id]/page.tsx`
- Modify: `src/app/specialty/[slug]/page.tsx`
- Modify: `src/app/city/[slug]/page.tsx`

Dynamic pages need `generateMetadata` — an async function that receives params and returns metadata.

- [ ] **Step 1: Read `src/app/doctor/[id]/page.tsx`**

Understand what data is already fetched and how the doctor's name/city are accessed.

- [ ] **Step 2: Add `generateMetadata` to doctor page**

Add above the default export:

```typescript
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  // The page already fetches doctor data — mirror that fetch here
  // For now use a safe fallback; replace with real data fetch matching the page's fetch
  return {
    title: `Book a Physiotherapist`,
    description: `Book an appointment with a verified physiotherapist on BookPhysio. In-clinic, home visit, and online sessions available.`,
    openGraph: {
      url: `https://bookphysio.in/doctor/${id}`,
    },
  };
}
```

Note: Once the doctor data fetch is real (not mock), update this to use the doctor's actual name and city: `title: \`${doctor.name} — Physiotherapist in ${doctor.city}\``.

- [ ] **Step 3: Read `src/app/specialty/[slug]/page.tsx`**

- [ ] **Step 4: Add `generateMetadata` to specialty page**

```typescript
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const name = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return {
    title: `${name} Physiotherapists in India`,
    description: `Find and book ${name.toLowerCase()} physiotherapists near you. Verified experts, instant booking, in-clinic and home visits.`,
    openGraph: {
      url: `https://bookphysio.in/specialty/${slug}`,
    },
  };
}
```

- [ ] **Step 5: Read `src/app/city/[slug]/page.tsx`**

- [ ] **Step 6: Add `generateMetadata` to city page**

```typescript
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const city = slug.charAt(0).toUpperCase() + slug.slice(1);
  return {
    title: `Physiotherapists in ${city}`,
    description: `Book physiotherapists in ${city}. In-clinic appointments, home visits, and online sessions. Verified physios, instant booking.`,
    openGraph: {
      url: `https://bookphysio.in/city/${slug}`,
    },
  };
}
```

- [ ] **Step 7: Build and verify**

```bash
rtk next build
```

- [ ] **Step 8: Commit**

```bash
rtk git add src/app/doctor/[id]/page.tsx src/app/specialty/[slug]/page.tsx src/app/city/[slug]/page.tsx
rtk git commit -m "feat: add generateMetadata to dynamic doctor, specialty, city pages"
```

---

## Task 7: IndexNow Setup

**Files:**
- Create: `public/<key>.txt` (key file)
- Create: `scripts/ping-indexnow.ts`

IndexNow lets you ping Bing instantly when new content is published. You need a key file hosted at your domain root, and a script to call the API.

- [ ] **Step 1: Generate a key**

Use any UUID. Example: generate one at uuidgenerator.net or run:
```bash
node -e "console.log(require('crypto').randomUUID().replace(/-/g,''))"
```

Save the key. You'll use it in both the filename and the file content.

- [ ] **Step 2: Create the key file**

Create `public/<your-key>.txt` where the filename is your key, and the file contains only that key on one line. Example if key is `a1b2c3d4e5f6`:

File: `public/a1b2c3d4e5f6.txt`
Content: `a1b2c3d4e5f6`

- [ ] **Step 3: Create `scripts/ping-indexnow.ts`**

```typescript
#!/usr/bin/env npx tsx
/**
 * Ping IndexNow API to notify Bing of updated URLs.
 * Run after deploy: npx tsx scripts/ping-indexnow.ts
 */

const KEY = process.env.INDEXNOW_KEY;
const HOST = "bookphysio.in";
const BASE_URL = `https://${HOST}`;

if (!KEY) {
  console.error("INDEXNOW_KEY env var not set. Add it to .env and .env.example.");
  process.exit(1);
}

const urls = [
  `${BASE_URL}/`,
  `${BASE_URL}/search`,
  `${BASE_URL}/about`,
  `${BASE_URL}/faq`,
  `${BASE_URL}/how-it-works`,
];

async function pingIndexNow() {
  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key: KEY, urlList: urls }),
  });

  if (response.ok || response.status === 202) {
    console.log(`IndexNow ping sent. Status: ${response.status}`);
  } else {
    const text = await response.text();
    console.error(`IndexNow ping failed. Status: ${response.status}`, text);
    process.exit(1);
  }
}

pingIndexNow();
```

- [ ] **Step 4: Add `INDEXNOW_KEY` to `.env.example`**

Open `.env.example` and add:
```
# IndexNow (SEO — ping Bing on deploy)
INDEXNOW_KEY=your-indexnow-key-here
```

- [ ] **Step 5: Add your actual key to `.env`**

```
INDEXNOW_KEY=<your-generated-key>
```

- [ ] **Step 6: Verify the script runs**

```bash
npx tsx scripts/ping-indexnow.ts
```

Expected: `IndexNow ping sent. Status: 202`

If it returns 400, check that your key file is reachable at `https://bookphysio.in/<key>.txt` (only testable after deploy).

- [ ] **Step 7: Commit**

```bash
rtk git add public/<your-key>.txt scripts/ping-indexnow.ts .env.example
rtk git commit -m "feat: add IndexNow key file and ping script"
```

---

## Task 8: SEO Ops Guide (Manual Steps)

**Files:**
- Create: `docs/planning/ops-seo.md`

Some SEO setup is manual — you can't automate it. Document it so it doesn't get forgotten.

- [ ] **Step 1: Create `docs/planning/ops-seo.md`**

```markdown
# SEO Operations — Manual Steps

> These steps cannot be automated. Complete them once the site is live.

## Google Search Console

1. Go to search.google.com/search-console
2. Add property: URL prefix → `https://bookphysio.in`
3. Verify ownership via HTML meta tag (add to `src/app/layout.tsx` `metadata.verification.google`)
4. Submit sitemap: Sitemaps → `https://bookphysio.in/sitemap.xml`
5. Check Pages report for indexing errors after 3–5 days

### Adding verification tag to layout.tsx

```typescript
export const metadata: Metadata = {
  // ... existing fields ...
  verification: {
    google: "your-google-verification-code-here",
  },
};
```

## Bing Webmaster Tools

1. Go to bing.com/webmasters
2. Sign in with Microsoft account
3. Click "Import from Google Search Console" (easiest — imports sitemap automatically)
4. Enable IndexNow: Configure My Site → IndexNow → use the same key from `INDEXNOW_KEY`

## Post-Deploy IndexNow Ping

After every significant deploy:
```bash
npx tsx scripts/ping-indexnow.ts
```

Add `INDEXNOW_KEY` to your Vercel/hosting environment variables.

## OG Image

Replace `public/og-image.png` with a real branded image:
- Size: 1200×630 pixels
- Background: `#00766C` (BookPhysio teal)
- Include: BookPhysio logo, tagline "Book Physios Near You"
- Format: PNG, under 1MB

Test after replacing: developers.facebook.com/tools/debug/
```

- [ ] **Step 2: Commit**

```bash
rtk git add docs/planning/ops-seo.md
rtk git commit -m "docs: add SEO ops guide for manual Search Console and Bing setup"
```

---

## Done — Verification Checklist

After all tasks complete, verify:

- [ ] `https://bookphysio.in/robots.txt` returns correct disallow rules
- [ ] `https://bookphysio.in/sitemap.xml` lists all public pages
- [ ] `https://bookphysio.in/<key>.txt` returns the IndexNow key
- [ ] Response headers include `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`
- [ ] `<head>` on homepage contains `og:image`, `og:title`, `og:description`, `twitter:card`
- [ ] Doctor/specialty/city pages have unique `<title>` tags
- [ ] `rtk next build` passes with no errors
