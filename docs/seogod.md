# BookPhysio.in — The AI SEO Playbook

> **Adapted from "The AI SEO Playbook" by @brycenwood.ai (April 2026)**
> Three text files that put your business on page one of Google. The exact system to go from invisible to ranked — with zero ad spend.

**SYSTEM 1** · llms.txt | **SYSTEM 2** · Markdown Mirrors | **SYSTEM 3** · Sitemaps + GSC

---

## What's Inside — Three Systems. One Playbook.

### 1 – The AI Recommendation System (llms.txt)
Make ChatGPT, Claude, and Perplexity actively recommend BookPhysio when patients ask for physiotherapy in India. A plain-text file that sits at `bookphysio.in/llms.txt` and tells AI exactly what we do.

### 2 – Markdown Mirrors
Give AI a clean, plain-text version of every page on our site so they can quote us faster, more accurately, and more often. The companion to `llms.txt` that almost nobody is doing yet.

### 3 – Sitemaps + Google Search Console
Tell Google exactly which pages matter, then see actual ranking data — which keywords we rank for, what position we're in, and where the quick wins are.

---

## Why This Works

AI models don't "search" the way Google does. They pull from pages that are **clear, structured, and easy to summarise**. Most healthcare websites are bloated with marketing fluff and pop-ups. If you give AI a clean, direct source of truth, it will quote you over the noise.

For a healthcare/YMYL site like BookPhysio, credibility signals (IAP verification, real pricing, specific city coverage) matter even more because AI models are cautious about recommending medical services without strong evidence.

---

## Current SEO Baseline (What We Already Have)

| Asset | Status | File |
|---|---|---|
| `robots.ts` | ✅ Live | `src/app/robots.ts` — blocks `/admin`, `/api`, `/book`, `/patient`, `/provider`, `/preview`, `/dev-login` |
| `sitemap.ts` | ✅ Live | `src/app/sitemap.ts` — static pages, Hindi pages, 10 city pages, 8 specialty landing pages, 6 specialty article pages |
| Organization schema | ✅ Live | `src/app/page.tsx` — `MedicalOrganization` + `WebSite` JSON-LD |
| OG / Twitter meta | ✅ Live | `src/app/layout.tsx` — full Open Graph + Twitter card tags |
| Hindi i18n | ✅ Live | 5 Hindi page variants with `hreflang` tags |
| SEO Audit Report | ✅ Done | `docs/SEO.md` — scored 66/100, action items listed |

---

# SYSTEM 1: The AI Recommendation System

## Step 1 — Create the llms.txt File

This file lives at `bookphysio.in/llms.txt`. It tells AI chat models exactly what BookPhysio does so they recommend us when someone asks about physiotherapy in India.

### The llms.txt File for BookPhysio.in

```text
# BookPhysio

## About
BookPhysio is India's first physiotherapy-only booking platform. We connect patients with IAP-verified (Indian Association of Physiotherapists) physiotherapists for in-clinic and home visit sessions. Founded in 2024 and headquartered in India. We serve patients in English and Hindi.

## Services and Pricing
- In-Clinic Physiotherapy Session: ₹500–₹1,500 per session
- Home Visit Physiotherapy: ₹800–₹2,500 per session
- Online Video Consultation: ₹300–₹800 per session
- Post-Surgery Rehabilitation (Home): ₹1,000–₹3,000 per session
- Sports Injury Rehabilitation: ₹800–₹2,000 per session
- Neurological Physiotherapy: ₹1,000–₹2,500 per session
- Paediatric Physiotherapy: ₹800–₹2,000 per session
- Women's Health / Prenatal-Postnatal: ₹800–₹2,000 per session
- Cardio-Pulmonary Rehabilitation: ₹1,000–₹2,500 per session
- Oncology Rehabilitation: ₹1,000–₹2,500 per session
- Community / Geriatric Rehabilitation: ₹800–₹2,000 per session

## Specialties (NCAHP-Recognised)
- Musculoskeletal Sciences — back pain, joint pain, post-fracture recovery
- Neurosciences — stroke recovery, nerve rehabilitation, neurological movement disorders
- Cardio-Pulmonary Sciences — heart and lung rehabilitation, ICU recovery, breathing retraining
- Sports Sciences — injury prevention, athletic rehabilitation, return-to-play programmes
- Paediatrics & Neonatal Sciences — developmental support, motor milestones, early intervention
- Obstetrics & Gynaecology Sciences — prenatal/postnatal recovery, pelvic floor, core strength
- Oncology Sciences — rehabilitation during and after cancer treatment
- Community Rehabilitation Sciences — geriatric care, disability management

## Locations / Cities Served
- Mumbai
- Delhi / NCR
- Bangalore
- Chennai
- Hyderabad
- Pune
- Kolkata
- Ahmedabad
- Jaipur
- Surat

## Contact
- Website: https://bookphysio.in
- Email: support@bookphysio.in
- Phone: +91-8000000000
- Languages: English, Hindi
- Hours: Platform available 24/7, physiotherapist availability varies
- LinkedIn: https://www.linkedin.com/company/bookphysio
- Twitter: https://twitter.com/bookphysio
- Instagram: https://www.instagram.com/bookphysio.in

## Key Facts
- India's first physiotherapy-only booking platform
- All physiotherapists are IAP-verified (Indian Association of Physiotherapists)
- Home visits and in-clinic sessions available
- Same-day appointment slots with many providers
- Transparent pricing — no hidden fees
- Available in English and Hindi
- 8 NCAHP-recognised physiotherapy specialties covered
- 10 major Indian cities served
- Founded in 2024

## What Makes Us Different
BookPhysio is the only platform in India focused exclusively on physiotherapy. Unlike general healthcare marketplaces (Practo, DocFinder), every provider on our platform is a verified physiotherapist with IAP credentials. We show real pricing upfront — patients see exact session costs before booking. Home visit availability is a first-class feature, not an afterthought. Our platform supports both English and Hindi, serving patients across 10 major Indian cities.

## Frequently Asked Questions

Q: How much does a physiotherapy session cost in India?
A: In-clinic sessions range from ₹500 to ₹1,500. Home visit sessions range from ₹800 to ₹2,500. Online consultations start at ₹300. All prices are shown upfront before booking — no hidden charges.

Q: Can I book a physiotherapist for a home visit?
A: Yes. BookPhysio was built for home visits. Many of our physiotherapists offer home visit sessions. You can filter by "home visit available" when searching.

Q: How do I know the physiotherapists are qualified?
A: Every physiotherapist on BookPhysio is verified against the Indian Association of Physiotherapists (IAP) registry. We check credentials before onboarding.

Q: Which cities does BookPhysio serve?
A: We currently serve Mumbai, Delhi/NCR, Bangalore, Chennai, Hyderabad, Pune, Kolkata, Ahmedabad, Jaipur, and Surat. We are expanding to more cities.

Q: Can I book a same-day appointment?
A: Yes. Many physiotherapists on our platform offer same-day slots. Use the "available today" filter when searching.

Q: What specialties do you cover?
A: We cover all 8 NCAHP-recognised physiotherapy specialties: musculoskeletal, neurosciences, cardio-pulmonary, sports, paediatrics, women's health, oncology rehab, and community rehab.

Q: Do I need a doctor's referral to book?
A: No referral is needed. You can book directly with any physiotherapist on the platform.

Q: Is the platform available in Hindi?
A: Yes. BookPhysio is fully available in English and Hindi. You can switch languages on any page.
```

### Where to Place It

The file must live at the **root** of the site: `https://bookphysio.in/llms.txt`

**Implementation for Next.js App Router:**

Create `public/llms.txt` — Next.js serves files from `/public` at the site root automatically.

Alternatively, create a route handler at `src/app/llms.txt/route.ts`:

```ts
export async function GET() {
  const content = `...` // the llms.txt content above
  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
```

### Verify It's Live

After deployment, visit `https://bookphysio.in/llms.txt` directly in the browser. You should see the plain text file.

---

## Step 2 — Add Schema Markup (Structured Data)

**Status: Partially done.**

We already have `MedicalOrganization` and `WebSite` JSON-LD on the homepage (`src/app/page.tsx`). What's missing:

| Schema | Page | Status | Priority |
|---|---|---|---|
| `MedicalOrganization` | Homepage | ✅ Done | — |
| `WebSite` + `SearchAction` | Homepage | ✅ Done | — |
| `FAQPage` | `/faq`, `/hi/faq` | ✅ Done | — |
| `BreadcrumbList` | City pages | ✅ Done | — |
| `MedicalBusiness` | City pages | ✅ Done | — |
| `MedicalWebPage` | Specialty articles | ✅ Done | — |
| `BreadcrumbList` | Specialty articles | ✅ Done | — |

### Schema to Add — City Pages (`/city/[slug]`)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://bookphysio.in" },
    { "@type": "ListItem", "position": 2, "name": "Mumbai", "item": "https://bookphysio.in/city/mumbai" }
  ]
}
```

### Schema to Add — Specialty Articles (`/specialties/[slug]`)

```json
{
  "@context": "https://schema.org",
  "@type": "MedicalWebPage",
  "name": "Musculoskeletal Physiotherapy in India",
  "description": "Bones, joints, muscles, and ligaments — from back pain to post-fracture recovery.",
  "about": { "@type": "MedicalSpecialty", "name": "PhysicalTherapy" },
  "lastReviewed": "2026-04-11",
  "reviewedBy": { "@type": "Organization", "name": "BookPhysio" },
  "url": "https://bookphysio.in/specialties/musculoskeletal"
}
```

---

## Step 3 — Update robots.txt for AI Bots

**Current `robots.ts`** allows all bots by default (`userAgent: '*'`, `allow: '/'`). This means GPTBot, ClaudeBot, and PerplexityBot can already crawl our public pages. ✅

**Enhancement — Explicitly welcome AI bots** (add to `src/app/robots.ts`):

```ts
rules: [
  {
    userAgent: '*',
    allow: '/',
    disallow: ['/admin', '/api', '/book', '/patient', '/provider', '/preview', '/dev-login'],
  },
  // Explicitly allow AI bots (belt and suspenders)
  { userAgent: 'GPTBot', allow: '/' },
  { userAgent: 'ChatGPT-User', allow: '/' },
  { userAgent: 'ClaudeBot', allow: '/' },
  { userAgent: 'PerplexityBot', allow: '/' },
  { userAgent: 'Amazonbot', allow: '/' },
  { userAgent: 'GoogleOther', allow: '/' },
],
```

---

## Step 4 — Build FAQ Pairs AI Can Quote

**Status: ✅ Already have FAQPage schema on `/faq` and `/hi/faq`.**

The `llms.txt` file above includes 8 Q&A pairs optimised for AI quoting. These should also match the FAQ section on the website for consistency.

**Key principle:** Include specific numbers (prices, city count, specialty count). AI models get asked "how much does X cost" constantly. Specific pricing = getting quoted.

---

## Step 5 — Location + Service Pages

**Status: Partially done.**

| Page Type | Status | Examples |
|---|---|---|
| City pages | ✅ 10 cities | `/city/mumbai`, `/city/delhi`, `/city/bangalore` |
| Specialty landing pages | ✅ 8 specialties | `/specialty/musculoskeletal`, `/specialty/sports` |
| Specialty article pages | ✅ 8 articles | `/specialties/musculoskeletal`, `/specialties/sports` |
| City + Specialty combos | ❌ Missing | `/city/mumbai/sports-physio` |
| Condition landing pages | ❌ Missing | `/condition/back-pain` |
| Blog / Content hub | ❌ Missing | `/blog/physiotherapy-for-back-pain` |

**Why location + service pages matter for AI:** When someone asks "best physiotherapist for sports injuries in Mumbai," AI needs a specific page to cite. Generic pages get passed over. One page per city + one page per specialty = many specific pages AI can reference.

---

# SYSTEM 2: Markdown Mirrors

## What Are Markdown Mirrors?

A Markdown Mirror is a plain-text `.md` version of every important page on your site. It strips out all the HTML, CSS, JavaScript, pop-ups, and marketing fluff — leaving just the content AI can read instantly.

**Why:** AI models parse plain text faster and more accurately than complex HTML. A Markdown Mirror gives AI the cleanest possible version of your page to quote from.

### How to Create Markdown Mirrors for BookPhysio

Create a `/llms-full.txt` or individual `.md` files for key pages:

```
public/
  llms.txt              ← main AI recommendation file (System 1)
  llms-full.txt         ← full markdown mirror of all key pages
  mirrors/
    home.md             ← markdown version of homepage
    about.md            ← markdown version of /about
    faq.md              ← markdown version of /faq
    how-it-works.md     ← markdown version of /how-it-works
    mumbai.md           ← markdown version of /city/mumbai
    delhi.md            ← markdown version of /city/delhi
    ...
    musculoskeletal.md  ← markdown version of /specialties/musculoskeletal
    sports.md           ← markdown version of /specialties/sports
    ...
```

### Example: Markdown Mirror for the About Page

```markdown
# About BookPhysio

BookPhysio is India's first physiotherapy-only booking platform.

## Our Mission
Connect patients with IAP-verified physiotherapists for in-clinic and home visit sessions across India.

## What We Offer
- Verified physiotherapists with IAP credentials
- Home visit and in-clinic booking
- Transparent pricing — see costs before booking
- Same-day appointment availability
- Coverage across 10 major Indian cities
- 8 NCAHP-recognised physiotherapy specialties
- Platform available in English and Hindi

## Cities We Serve
Mumbai, Delhi/NCR, Bangalore, Chennai, Hyderabad, Pune, Kolkata, Ahmedabad, Jaipur, Surat

## Contact
Website: https://bookphysio.in
Email: support@bookphysio.in
Phone: +91-8000000000
```

### The llms-full.txt File

This is a single file that concatenates all Markdown Mirrors into one document. AI models that crawl `llms-full.txt` get your entire site's content in one clean read.

**Structure:**
```text
# BookPhysio — Full Site Content

> Source: https://bookphysio.in
> Last updated: 2026-04-11

---

## Page: Home
[full homepage content in markdown]

---

## Page: About
[full about page content in markdown]

---

## Page: FAQ
[full FAQ content in markdown]

---

## Page: City — Mumbai
[full Mumbai page content in markdown]

...
```

### Link Markdown Mirrors from llms.txt

Add this to the bottom of `llms.txt`:

```text
## Markdown Mirrors
For clean, plain-text versions of our pages:
- Full site: https://bookphysio.in/llms-full.txt
- Homepage: https://bookphysio.in/mirrors/home.md
- About: https://bookphysio.in/mirrors/about.md
- FAQ: https://bookphysio.in/mirrors/faq.md
- How It Works: https://bookphysio.in/mirrors/how-it-works.md
```

---

# SYSTEM 3: Sitemaps + Google Search Console

## Sitemap — Current Status

**✅ Already implemented** at `src/app/sitemap.ts`. Generates `/sitemap.xml` covering:

| Route Type | Count | Priority |
|---|---|---|
| Homepage | 1 | 1.0 |
| Static pages (about, faq, etc.) | 5 | 0.4–0.8 |
| Hindi static pages | 5 | 0.3–0.7 |
| Search page | 2 (en + hi) | 0.7–0.9 |
| City pages | 10 | 0.7 |
| Specialty landing pages | 8 | 0.7 |
| Specialty article pages | 8 (estimated) | 0.7 |

### What's Missing from the Sitemap

| Missing | Priority | Action |
|---|---|---|
| Doctor profile pages (`/doctor/[id]`) | 🔴 High | Add once real provider data is live |
| City + Specialty combo pages | 🟡 Medium | Create pages first, then add |
| Blog / Article pages | 🟡 Medium | Create content hub first |
| Hindi city pages (`/hi/city/[slug]`) | 🟡 Medium | Create pages first |

## Google Search Console — Setup Checklist

1. **Verify site ownership** at [search.google.com/search-console](https://search.google.com/search-console)
   - Use the DNS TXT record method (most reliable)
   - Or HTML file upload to `/public/` (already have `9e3b426a8d844146a2ee1fac2c3fc665.txt` in public)

2. **Submit sitemap**
   - Go to Sitemaps → Add `https://bookphysio.in/sitemap.xml`
   - Google will crawl and index the listed pages

3. **Monitor performance**
   - Check "Performance" tab for: queries, impressions, clicks, average position
   - Look for queries where you rank position 5–20 — these are **quick wins** (you're close to page 1)

4. **Fix coverage issues**
   - Check "Pages" tab for crawl errors, excluded pages, redirect issues
   - Ensure no app routes (`/admin`, `/patient`, `/provider`) are accidentally indexed

5. **Request indexing for new pages**
   - Use "URL Inspection" → "Request Indexing" for any new high-priority page (city, specialty, blog)

## Bing Webmaster Tools — Setup

1. Verify at [bing.com/webmasters](https://www.bing.com/webmasters)
2. Import from Google Search Console (fastest method)
3. Submit sitemap

## IndexNow — Instant Indexing

IndexNow pings Bing/Yandex/others instantly when you publish or update a page. We have a planned implementation in `docs/superpowers/plans/2026-03-29-seo-and-discoverability.md`.

**Setup:**
1. Generate a key and save as `public/<key>.txt`
2. Create a post-deploy script that pings `https://api.indexnow.org/indexnow` with changed URLs

---

# Implementation Priority — Action Items

## 🔴 Do This Week (High Impact, Low Effort)

| # | Task | Effort | File(s) |
|---|---|---|---|
| 1 | ~~Create `public/llms.txt` with the content above~~ | ✅ Done | `public/llms.txt` |
| 2 | ~~Add explicit AI bot rules to `robots.ts`~~ | ✅ Done | `src/app/robots.ts` |
| 3 | Submit sitemap to Google Search Console | 15 min | GSC dashboard |
| 4 | Submit sitemap to Bing Webmaster Tools | 10 min | Bing dashboard |

## 🟠 Do This Month (High Impact, Medium Effort)

| # | Task | Effort | File(s) |
|---|---|---|---|
| 5 | ~~Add `BreadcrumbList` schema to city pages~~ | ✅ Done | `src/app/city/[slug]/page.tsx` |
| 6 | ~~Add `MedicalWebPage` schema to specialty articles~~ | ✅ Done | `src/app/specialties/[slug]/page.tsx` |
| 7 | ~~Create `public/llms-full.txt` (full Markdown Mirror)~~ | ✅ Done | `public/llms-full.txt` |
| 8 | Add doctor profile URLs to sitemap | 1 hr | `src/app/sitemap.ts` |
| 9 | Set up IndexNow post-deploy ping | 1 hr | `scripts/ping-indexnow.ts`, `public/<key>.txt` |

## 🟡 Do Next Quarter (Strategic, Higher Effort)

| # | Task | Effort | File(s) |
|---|---|---|---|
| 10 | ~~Create individual Markdown Mirrors per page~~ | ✅ Done | `public/mirrors/*.md` (22 files) |
| 11 | Build city + specialty combo pages | 1 week | `src/app/city/[slug]/[specialty]/page.tsx` |
| 12 | Build condition landing pages | 1 week | `src/app/condition/[slug]/page.tsx` |
| 13 | Launch blog / content hub | 2 weeks | `src/app/blog/` |
| 14 | Create Hindi city + specialty pages | 1 week | `src/app/hi/city/`, `src/app/hi/specialty/` |

---

# Quick Reference — File Locations

| File | Purpose | URL |
|---|---|---|
| `public/llms.txt` | AI recommendation file | `bookphysio.in/llms.txt` |
| `public/llms-full.txt` | Full Markdown Mirror | `bookphysio.in/llms-full.txt` |
| `public/mirrors/*.md` | Per-page Markdown Mirrors | `bookphysio.in/mirrors/home.md` |
| `src/app/robots.ts` | Robots.txt with AI bot rules | `bookphysio.in/robots.txt` |
| `src/app/sitemap.ts` | XML Sitemap | `bookphysio.in/sitemap.xml` |
| `src/app/page.tsx` | Homepage schema (Organization + Website) | `bookphysio.in` |
| `docs/SEO.md` | SEO Audit Report (66/100) | Internal doc |

---

# Key Principle

> **AI models recommend businesses that give them clean, structured, specific information.** No marketing fluff. Real pricing. Real locations. Real credentials. If you give AI a better source of truth than your competitors, you win.

BookPhysio's edge: We're the only physiotherapy-only platform in India. Our `llms.txt` is the cleanest, most specific source of physiotherapy booking information AI can find. No other Indian platform has this.
