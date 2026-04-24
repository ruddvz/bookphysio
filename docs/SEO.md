# BookPhysio.in — SEO Audit Report

> **Audit date:** 2026-04-10  
> **Method:** Codebase deep-scan (claude-seo equivalent — technical, on-page, schema, local, content, image, indexability, i18n)  
> **Site:** https://bookphysio.in

---

## Scorecard

| Category | Score | Status |
|---|---|---|
| Technical SEO | 74/100 | 🟡 Good with gaps |
| On-Page / Metadata | 82/100 | 🟢 Solid |
| Structured Data (Schema) | 55/100 | 🟠 Needs work |
| Local SEO | 40/100 | 🔴 Weak |
| Content Architecture | 70/100 | 🟡 Good with gaps |
| Image SEO | 65/100 | 🟡 Good with gaps |
| Indexability | 85/100 | 🟢 Good |
| i18n / Hreflang | 60/100 | 🟡 Partial |
| **Overall** | **66/100** | **🟡 Needs improvement** |

---

## ✅ What's Working Well

### Technical Foundation
- `robots.ts` correctly disallows `/admin`, `/api`, `/book`, `/patient`, `/provider`, `/preview`, `/dev-login` — no accidental indexation of app routes
- `sitemap.ts` covers 4 route categories: static pages, Hindi static pages, 10 city pages, 7 specialty article pages (`/specialties/[slug]` only; legacy `/specialty/*` 301s)
- `metadataBase` correctly set to `https://bookphysio.in` — OG/Twitter image URLs resolve correctly
- Auth pages (`/login`, `/signup`, `/verify-otp`, `/forgot-password`, `/update-password`, `/doctor-signup`) all have `robots: { index: false, follow: false }` — correctly noindexed
- PWA manifest at `/manifest.json` correctly configured with shortcuts and `theme_color: "#00766C"`
- `next/font/google` with `display: 'swap'` for Inter + Outfit — no FOUT, good Core Web Vitals signal
- `generateStaticParams` on `/city/[slug]` and `/specialties/[slug]` — SSG at build time, fast TTFB

### On-Page Metadata
- Home title: *"Book Physiotherapists Online in India | Home Visits | BookPhysio.in"* — keyword-rich, well-structured
- All major pages have unique titles and meta descriptions
- OG tags (`og:title`, `og:description`, `og:image`, `og:locale: en_IN`) on all pages
- Twitter card `summary_large_image` on all pages
- Custom `opengraph-image.tsx` edge-rendered OG image at correct 1200×630 dimensions
- Canonical tags present on all pages

### Structured Data (Home page)
- `MedicalOrganization` schema with `@id`, `url`, `logo`, `medicalSpecialty: PhysicalTherapy`, `areaServed: India`
- `WebSite` schema with `SearchAction` / sitelinks search box (correct `query-input` syntax)
- `FAQPage` schema on `/faq` and `/hi/faq` with proper `Question`/`Answer` structure

### i18n
- Hindi versions of all 5 static pages: `/hi/about`, `/hi/faq`, `/hi/how-it-works`, `/hi/privacy`, `/hi/terms`
- `hreflang` tags via `getLocalizedStaticAlternates()` — both `en-IN` and `hi-IN` alternates
- Hindi metadata written in native Hindi (not auto-translated titles)

---

## 🔴 Critical Issues — Fix This Week

### 1. `/search` page has NO metadata
`/search` has `priority: 0.9` in the sitemap (highest after homepage) but `src/app/search/page.tsx` exports zero metadata. Google will generate its own title, resulting in a poor SERP snippet.

**File:** `src/app/search/page.tsx`

```ts
export const metadata: Metadata = {
  title: 'Find Physiotherapists Near You | BookPhysio.in',
  description:
    'Search and book verified physiotherapists across India. Filter by city, specialty, home visit, and same-day availability.',
  alternates: { canonical: 'https://bookphysio.in/search' },
  openGraph: {
    title: 'Find Physiotherapists Near You | BookPhysio.in',
    description: 'Search verified physios in your city. Home visits and clinic sessions across India.',
    url: 'https://bookphysio.in/search',
    siteName: 'BookPhysio.in',
    locale: 'en_IN',
    type: 'website',
  },
}
```

### 2. `sameAs: []` — Empty social profiles in Organization schema
The `MedicalOrganization` schema in `src/app/page.tsx` has `sameAs: []`. This is a key brand authority signal. Google uses it to associate the site with verified entities — critical for YMYL (healthcare) sites.

**File:** `src/app/page.tsx`

```ts
sameAs: [
  'https://www.linkedin.com/company/bookphysio',
  'https://twitter.com/bookphysio',
  // add any live profiles here
],
```

### 3. Rotating H1 breaks keyword coverage
The hero `<h1>` rotates words client-side (`sports rehab`, `home visits`, `post-surgery care`, etc.). **Google crawls the initial server-rendered HTML**, so it sees only the first word (`sports rehab`) — all other terms are invisible to crawlers. The H1 is one of the most important on-page ranking signals.

**File:** `src/components/HeroSection.tsx`

**Fix:** Either use a static H1 with broad keyword coverage, or keep the animation CSS-only while server-rendering all terms:

```tsx
// Static option:
<h1>Book verified physios for home visits and clinic sessions across India</h1>
```

---

## 🟠 High Priority — Fix This Month

### 4. No structured data on City pages (`/city/[slug]`)
City pages have zero JSON-LD. These are prime targets for local SEO rich results.

**Add to each city page:**
- `ItemList` — list of physiotherapists (enables rich results)
- `BreadcrumbList` — breadcrumb rich result in SERPs

```ts
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bookphysio.in' },
    { '@type': 'ListItem', position: 2, name: city.label, item: `https://bookphysio.in/city/${slug}` },
  ],
}
```

### 5. No `MedicalWebPage` schema on specialty articles (`/specialties/[slug]`)
The 6 long-form specialty articles (sports physio, neuro physio, etc.) have no structured data. Google expects `MedicalWebPage` schema for medical content to establish topical authority.

**File:** `src/components/specialties/SpecialtyArticle.tsx`

```ts
const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'MedicalWebPage',
  name: `${data.title} in India`,
  description: data.description,
  about: { '@type': 'MedicalSpecialty', 'name': 'PhysicalTherapy' },
  lastReviewed: '2026-04-07',
  reviewedBy: { '@type': 'Organization', name: 'BookPhysio' },
  url: `https://bookphysio.in/specialties/${slug}`,
}
```

### 6. `contactPoint` schema is incomplete
Missing `telephone` and `email` — both are trust signals for YMYL healthcare sites.

**File:** `src/app/page.tsx`

```ts
contactPoint: {
  '@type': 'ContactPoint',
  contactType: 'customer support',
  email: 'support@bookphysio.in',   // ← add this
  telephone: '+91-XXXXXXXXXX',       // ← add this
  availableLanguage: ['English', 'Hindi'],
},
```

### 7. Doctor profile pages not in sitemap
`/doctor/[id]` pages are not in `sitemap.ts`. These are the highest-value pages for long-tail SEO ("Dr. X physiotherapist Mumbai"). Add them once real provider data is live.

**File:** `src/app/sitemap.ts` — add dynamic doctor fetch:

```ts
const doctorMaps = liveProviders.map((provider) => ({
  url: `${BASE_URL}/doctor/${provider.id}`,
  lastModified: new Date(provider.updated_at),
  changeFrequency: 'weekly' as const,
  priority: 0.8,
}))
```

---

## 🟡 Medium Priority — Next Quarter

### 8. ~~Specialty listing pages~~ (removed)
Former `/specialty/[slug]` listing pages were removed; public specialty SEO is **only** `/specialties/[slug]` articles. Ensure each article has complete `MedicalWebPage` + breadcrumb JSON-LD.

### 9. City pages use hardcoded mock data
`/city/[slug]` renders `MOCK_DOCTORS` — same 5 doctors filtered by city name. Most cities return 0 results (thin content). Replace with real Supabase queries when provider data is live.

### 10. Hindi city and specialty pages don't exist
`/hi/search` is in the sitemap but there are no `/hi/city/[slug]` or `/hi/specialties/[slug]` pages. Hreflang coverage is incomplete for the highest-traffic page types.

### 11. `foundingDate` should use ISO format
```ts
// Current:
foundingDate: '2024',
// Fix:
foundingDate: '2024-01-01',
```

### 12. `noscript` fallback too minimal
```html
<noscript>You need JavaScript enabled to use BookPhysio.</noscript>
```
Consider adding a static navigation list inside `<noscript>` for progressive-enhancement crawlability.

### 13. No content hub / blog
No articles targeting informational queries ("physiotherapy for back pain", "how many physio sessions for ACL"). Competitors will dominate these queries. A `/blog` or `/resources` section is the highest long-term SEO investment.

### 14. `public/images/` is empty
No real hero images, specialist photos, or clinic images — all doctor cards rely on initials avatars. This hurts Google Image search coverage and E-E-A-T visual signals.

---

## ⚡ Quick Wins (Under 1 hour each)

| Fix | Impact | Effort |
|---|---|---|
| Add metadata to `/search` | High | 15 min |
| Populate `sameAs` in Organization schema | High | 5 min |
| Add `telephone`/`email` to `contactPoint` | Medium | 5 min |
| Fix `foundingDate` to ISO format | Low | 2 min |
| Add BreadcrumbList to city and specialty pages | Medium | 1 hr |
| Add `MedicalWebPage` schema to `/specialties/` articles | High | 1 hr |

---

## 🏗️ Content Architecture Gaps

These are missing URL patterns that competitors rank for in the Indian physiotherapy market:

| Page Type | Example URL | Search Volume Signal |
|---|---|---|
| City + Specialty intersections | `/city/mumbai/sports-physio` | High (local intent) |
| Condition landing pages | `/condition/back-pain` | High (informational) |
| Tier-2 city pages | `/city/lucknow`, `/city/kochi` | Medium (lower competition) |
| Blog/articles | `/blog/physiotherapy-for-back-pain` | High (long-tail) |
| Doctor profile pages | `/doctor/[id]` | High (branded + local) |

---

## 📁 Files to Change

| File | Change Needed |
|---|---|
| `src/app/search/page.tsx` | Add `metadata` export |
| `src/app/page.tsx` | Populate `sameAs`, complete `contactPoint`, fix `foundingDate` |
| `src/components/HeroSection.tsx` | Fix rotating H1 for crawlability |
| `src/app/city/[slug]/page.tsx` | Add `BreadcrumbList` + `ItemList` JSON-LD |
| `src/components/specialties/SpecialtyArticle.tsx` | Add `MedicalWebPage` JSON-LD |
| `src/app/sitemap.ts` | Add doctor profile URLs, expand city list |
