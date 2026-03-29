# Tech Stack Analysis: ZocDoc (Extracted)

Standardized tech stack analysis for the ZocDoc clone, adapted for BookPhysio.

## Core Framework & CLI

| Category | ZocDoc (Current) | BookPhysio (Clone Choice) | Reason for Choice |
|----------|------------------|---------------------------|-------------------|
| **Framework** | Next.js (mostly) | Next.js 16 (App Router) | Standard for modern, SEO-optimized web apps. |
| **Language** | Javascript/Typescript | Typescript (Strict) | Better maintainability and UI consistency. |
| **Styling** | Custom Styled Components | Tailwind CSS v4 (oklch) | Faster prototyping, better performance, modern color tokens. |
| **UI Components** | Custom (ZDS) | shadcn/ui (Radix) | Accessible base components with custom styling to match ZDS. |

## Data & State Management

| Category | ZocDoc (Current) | BookPhysio (Clone Choice) | Reason for Choice |
|----------|------------------|---------------------------|-------------------|
| **Backend** | Proprietary (AWS/SQL) | Supabase (Postgres) | Quick to setup, includes Auth and Real-time features. |
| **State Management** | Redux/React Query | React Query / Zustand | Simplified data fetching and global state for appointments. |
| **API Patterns** | REST / GraphQL | REST (via Supabase) | Standard and easy to implement for initial clone. |

## External Services & Integrations

| Category | ZocDoc (Current) | BookPhysio (Clone Choice) | Reason for Choice |
|----------|------------------|---------------------------|-------------------|
| **Maps** | Mapbox | Mapbox GL JS | Identical to ZocDoc for search results. |
| **Authentication** | Custom / OAuth | Supabase Auth + MSG91 | Added support for Phone OTP (critical for India). |
| **Payments** | Insurance / Cards | Razorpay | Standard for Indian payments (UPI, Cards). |
| **Telehealth** | Custom / Twilio | 100ms / Zoom | Fast integration for 'Video Visit' equivalent. |

## Utilities & Performance

| Category | ZocDoc (Current) | BookPhysio (Clone Choice) | Reason for Choice |
|----------|------------------|---------------------------|-------------------|
| **Icons** | Custom SVGs | Lucide React + Extracted SVGs | Seamless transition from common icons to pixel-perfect ZocDoc ones. |
| **Animations** | CSS / Framer Motion | GSAP / Framer Motion | Rich, cinematic entrance animations as per design requirements. |
| **Caching** | Varnish / Cloudflare | Vercel Edge Cache | Standard for Next.js deployments. |
| **Images** | CDN-hosted | Next/Image + Vercel Image Optimization | Better performance and lazy-loading. |

## CI/CD & Deployment

- **Hosting:** Vercel (Standard for Next.js)
- **Deployment:** Git-based branch merging (as per rules)
- **Monitoring:** Sentry / Loglib (for India-specific analytics)
