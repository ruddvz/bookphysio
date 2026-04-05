# BookPhysio.in — Codebase Overview

> Read this FIRST before touching any code. Then drill into the specific codemap for your area.

## Architecture

```
bookphysio.in
├── src/
│   ├── app/                    # Next.js 16 App Router
│   │   ├── page.tsx            # Homepage
│   │   ├── layout.tsx          # Root layout (Navbar + Footer)
│   │   ├── not-found.tsx       # 404 page
│   │   ├── (auth)/             # Auth route group (login, signup, OTP, doctor-signup)
│   │   ├── search/             # Search results + filters
│   │   ├── doctor/[id]/        # Doctor profile + BookingCard
│   │   ├── book/[id]/          # Booking wizard (3 steps)
│   │   ├── specialty/[slug]/   # Specialty landing
│   │   ├── city/[slug]/        # City landing
│   │   ├── about/              # Static: About
│   │   ├── faq/                # Static: FAQ
│   │   ├── how-it-works/       # Static: How It Works
│   │   ├── privacy/            # Static: Privacy Policy
│   │   ├── terms/              # Static: Terms of Service
│   │   ├── patient/            # Patient dashboard (7 pages)
│   │   ├── provider/           # Provider portal (12 pages)
│   │   ├── admin/              # Admin panel (4 pages)
│   │   └── api/                # API routes
│   │       ├── contracts/      # TypeScript types shared with UI
│   │       ├── auth/           # signup, otp/send, otp/verify
│   │       ├── providers/      # search, [id], [id]/availability, [id]/reviews
│   │       ├── appointments/   # list/create, [id] get/cancel
│   │       ├── payments/       # create-order, webhook, refund
│   │       ├── reviews/        # create review
│   │       ├── notifications/  # list, [id]/read
│   │       ├── admin/          # users, listings
│   │       └── upload/         # document upload
│   ├── components/             # Shared UI components
│   │   ├── ui/                 # shadcn/ui primitives
│   │   └── *.tsx               # App-specific components
│   └── lib/                    # Service clients + utilities
│       ├── supabase/           # client.ts, server.ts, admin.ts
│       ├── validations/        # Zod schemas (auth, booking, payment, provider, review, search)
│       ├── razorpay.ts         # Razorpay client
│       ├── msg91.ts            # MSG91 SMS/OTP
│       ├── resend.ts           # Resend email
│       ├── upstash.ts          # Rate limiting
│       └── utils.ts            # cn() helper
├── supabase/
│   ├── migrations/             # 3 SQL migrations
│   ├── seed.sql                # Seed data
│   └── config.toml             # Supabase config
├── middleware.ts                # Auth + rate limiting
├── e2e/                        # Playwright E2E tests
├── docs/
│   ├── CODEMAPS/               # THIS directory
│   ├── planning/               # EXECUTION-PLAN.md, ACTIVE.md
│   ├── research/               # Zocdoc visual audit, component specs
│   └── superpowers/            # Build plans, design specs
└── .claude/
    ├── agents/                 # Agent definitions
    ├── design-system/          # DESIGN.md (design tokens)
    └── workflow-101.md         # Master workflow
```

## Design Tokens (Updated April 2026)

| Token | Value | Intent |
|-------|-------|--------|
| `bp-primary` | `#0B3B32` | Deep Pine: Headings, Sidebar, Primary CTAs |
| `bp-accent` | `#12B3A0` | Active Teal: Icons, interactive states, pulse dots |
| `bp-surface` | `#FBF9F4` | Soft Parchment: Page background, muted sections |
| `bp-border` | `#EBE1D2` | Golden Sand: High-trust component borders |
| `bp-body` | `#616B68` | Warm Smoke: Secondary text, body copy |

## Agent → File Ownership Map

| Agent | Owns | Key Files |
|-------|------|-----------|
| `bp-ui-public` | Public pages + auth + shared components | `app/page.tsx`, `app/search/`, `app/doctor/`, `app/book/`, `app/(auth)/`, `src/components/` |
| `bp-ui-patient` | Patient dashboard | `app/patient/` (7 pages) |
| `bp-ui-provider` | Provider portal | `app/provider/` (12 pages) |
| `bp-ui-admin` | Admin panel | `app/admin/` (4 pages) |
| `bp-backend` | API routes + DB + services | `app/api/`, `src/lib/`, `supabase/`, `middleware.ts` |
| `bp-guardian` | QA gate | reads everything, writes nothing in src/ |
| `bp-orchestrator` | Coordination | reads planning docs, dispatches agents |

## Detailed Codemaps

| Map | Covers | Use When |
|-----|--------|----------|
| [pages.md](pages.md) | Every route, what it renders, which components it imports | Page changes, routing, layouts |
| [components.md](components.md) | All `src/components/`, purpose, props, who imports them | Component changes, shared UI |
| [api.md](api.md) | API routes, methods, contracts, validation schemas | Backend changes, data flow |
| [lib.md](lib.md) | Service clients, validation schemas, utilities | Integration changes |

## Key Dependency Flows

```
User → Navbar → search bar → /search page → DoctorCard → /doctor/[id] → BookingCard → /book/[id]
                                                                                         ↓
                                                                              /api/appointments (POST)
                                                                                         ↓
                                                                              /api/payments/create-order
                                                                                         ↓
                                                                              Razorpay checkout
                                                                                         ↓
                                                                              /api/payments/webhook
                                                                                         ↓
                                                                              appointment confirmed
```

## Current Phase

**Phase 8 — UI Polish** (all pages built, making production-ready). See `docs/planning/EXECUTION-PLAN.md`.
