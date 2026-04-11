# bookphysio.in — Zocdoc Clone Design Spec

**Date:** 2026-03-28
**Status:** Approved
**Project:** bookphysio.in — Physiotherapy booking platform for India
**Goal:** Full pixel-perfect Zocdoc clone adapted for the Indian market, covering all 4 portals (30+ pages)

---

## 1. Overview

bookphysio.in is a full-stack Zocdoc clone targeting Indian physiotherapy patients and providers. The platform connects patients with physiotherapists for in-clinic and home-visit sessions.

Build strategy: Use the [ai-website-cloner-template](https://github.com/JCodesMore/ai-website-cloner-template) as the project skeleton (Next.js 15 + shadcn/ui pre-wired), skip the automated recon phase (Zocdoc blocks bots), and hand-craft each page from Zocdoc design knowledge. Screenshots provided by the user will be used to correct discrepancies.

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, React 19) |
| UI Library | shadcn/ui + Radix primitives |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email + Google OAuth + phone/OTP) |
| Storage | Supabase Storage (doctor photos, credential documents) |
| Payments | Razorpay (UPI, cards, netbanking, wallets — India-first) |
| Location discovery | City and pincode search with provider coverage cues |
| Email | Resend (transactional — booking confirmations, password reset) |
| SMS/OTP | Supabase Auth phone provider with MSG91 backend (configured in Supabase dashboard, no app-side SMS client) |
| Validation | Zod (all input boundaries) |
| Client State | Zustand |
| Server State | TanStack Query (React Query) |
| Rate Limiting | Upstash Redis (edge rate limiting on API routes) |

---

## 3. Architecture

### Route Groups

```
src/app/
  (public)/       ← marketing, search, doctor profiles (no auth required)
  (auth)/         ← login, signup, password reset, OTP verify
  (patient)/      ← patient dashboard (requires patient role)
  (provider)/     ← provider portal (requires provider role)
  (admin)/        ← admin panel (requires admin role)
  api/            ← Next.js API routes (backend)
  not-found.tsx   ← 404 page
  error.tsx       ← 500 / global error boundary
```

### Component Structure

```
src/components/
  ui/             ← shadcn/ui primitives (untouched)
  shared/         ← cross-portal: Header, Footer, SearchBar, DoctorCard
                    (OWNED BY bp-ui-public — other agents read-only)
  public/         ← marketing-specific components
  patient/        ← patient dashboard components
  provider/       ← provider portal components
  admin/          ← admin panel components
```

### Backend Structure

```
src/lib/
  supabase/       ← client.ts, server.ts, middleware helpers
  validations/    ← Zod schemas (one file per domain)
  razorpay.ts     ← Razorpay client init
  resend.ts       ← Resend email client
  (no SMS client — phone OTP routes call supabase.auth.signInWithOtp directly)
src/app/api/
  contracts/      ← TypeScript types exported for UI agent consumption
                    (source of truth for API response shapes)
supabase/
  migrations/     ← SQL migration files (backend agent owns exclusively)
  functions/      ← Edge Functions
  seed.sql        ← Dev seed data
middleware.ts     ← Auth route protection + rate limiting
```

### API Contracts

The backend agent publishes TypeScript types to `src/app/api/contracts/` before UI agents begin. UI agents import from this directory — they never infer shapes from API calls.

---

## 4. Database Schema

### Core Tables

```sql
-- Users (linked to Supabase auth.users)
users (
  id uuid PRIMARY KEY REFERENCES auth.users,
  role text CHECK (role IN ('patient', 'provider', 'admin')),
  full_name text NOT NULL,
  phone text,                    -- +91XXXXXXXXXX E.164 format
  avatar_url text,
  created_at timestamptz DEFAULT now()
)

-- Provider profiles
providers (
  id uuid PRIMARY KEY REFERENCES users(id),
  slug text UNIQUE NOT NULL,
  title text,                    -- Dr., PT, BPT, MPT
  icp_registration_no text,      -- Indian Council of Physiotherapy reg. no.
  specialty_ids uuid[],
  bio text,
  experience_years int,
  consultation_fee_inr int,      -- fee in INR (integer rupees)
  rating_avg numeric(3,2) DEFAULT 0,
  rating_count int DEFAULT 0,
  verified boolean DEFAULT false,
  active boolean DEFAULT true,
  onboarding_step int DEFAULT 1, -- 1=profile, 2=credentials, 3=availability, 4=live
  gstin text                     -- GST registration number (optional)
)

-- Specialties lookup
specialties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  icon_url text
)

-- Clinic locations
locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES providers(id),
  name text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  pincode char(6) NOT NULL,      -- Indian 6-digit pincode
  lat numeric(10,7),
  lng numeric(10,7),
  visit_type text[] CHECK (visit_type <@ ARRAY['in_clinic','home_visit','online'])
)

-- Provider availability slots
availabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES providers(id),
  location_id uuid REFERENCES locations(id),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  slot_duration_mins int DEFAULT 30,
  buffer_mins int DEFAULT 0,     -- gap between consecutive appointments
  is_recurring boolean DEFAULT false,
  recurrence_rule text,          -- iCal RRULE string for recurring slots
  is_booked boolean DEFAULT false,
  is_blocked boolean DEFAULT false -- manually blocked by provider
)

-- Appointments
appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES users(id),
  provider_id uuid REFERENCES providers(id),
  availability_id uuid REFERENCES availabilities(id),
  location_id uuid REFERENCES locations(id),
  visit_type text CHECK (visit_type IN ('in_clinic','home_visit','online')),
    visit_type text CHECK (visit_type IN ('in_clinic','home_visit')),
  status text CHECK (status IN ('pending','confirmed','cancelled','completed','no_show')),
  fee_inr int NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
)

-- Payments
payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES appointments(id),
  razorpay_order_id text UNIQUE,
  razorpay_payment_id text,
  amount_inr int NOT NULL,
  gst_amount_inr int DEFAULT 0,
  status text CHECK (status IN ('created','paid','failed','refunded')),
  refund_id text,
  created_at timestamptz DEFAULT now()
)

-- Provider subscriptions (Razorpay subscriptions)
subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES providers(id),
  razorpay_subscription_id text UNIQUE,
  plan text CHECK (plan IN ('free','basic','pro')),
  status text CHECK (status IN ('trial','active','past_due','cancelled')),
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now()
)

-- Reviews
reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid UNIQUE REFERENCES appointments(id),
  patient_id uuid REFERENCES users(id),
  provider_id uuid REFERENCES providers(id),
  rating int CHECK (rating BETWEEN 1 AND 5),
  comment text,
  provider_reply text,           -- provider's response
  is_published boolean DEFAULT true,
  is_flagged boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
)

-- Provider credential documents
documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES providers(id),
  type text CHECK (type IN ('degree','registration','id_proof','photo')),
  storage_path text NOT NULL,    -- Supabase Storage path
  verified boolean DEFAULT false,
  uploaded_at timestamptz DEFAULT now()
)

-- Notifications
notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  type text NOT NULL,            -- 'appointment_confirmed', 'reminder_1h', etc.
  title text NOT NULL,
  body text NOT NULL,
  read boolean DEFAULT false,
  metadata jsonb,                -- appointment_id etc.
  created_at timestamptz DEFAULT now()
)
```

### RLS Policies

- **patients**: read/write own `users` row, own `appointments`, `payments`, `reviews`, `notifications`
- **providers**: read/write own `providers`, `locations`, `availabilities`, `documents`, `subscriptions`; read `appointments` where `provider_id = auth.uid()`
- **admins**: full access to all tables
- **public (anon)**: read `providers` (verified=true, active=true), `specialties`, `locations`

---

## 5. Page Inventory (~32 pages)

### Public Portal — `app/(public)/`
| Route | Description |
|-------|-------------|
| `/` | Homepage: search hero, specialty grid, how it works, testimonials, app CTA, footer |
| `/search` | Doctor search: sidebar filters (specialty, fee, availability, visit type), doctor cards grid, coverage cues |
| `/doctor/[slug]` | Doctor profile: photo, bio, specialties, rating/reviews, availability calendar, Book CTA |
| `/specialty/[name]` | Specialty landing pages (generated from DB) |
| `/how-it-works` | 3-step explainer for patients |
| `/about` | Company story |
| `/careers` | Open positions |
| `/press` | Press releases |
| `not-found.tsx` | 404 page |
| `error.tsx` | 500 / error boundary |

### Auth — `app/(auth)/`
| Route | Description |
|-------|-------------|
| `/login` | Email + Google OAuth + phone OTP, patient/provider tab |
| `/signup` | Patient and Provider separate flows |
| `/signup/provider` | Provider-specific signup (ICP reg no, specialty) |
| `/forgot-password` | Email reset link |
| `/reset-password` | Token-gated new password form |
| `/verify-otp` | Phone OTP verification |

### Patient Dashboard — `app/(patient)/`
| Route | Description |
|-------|-------------|
| `/dashboard` | Upcoming appointments, activity feed |
| `/appointments` | History, upcoming, cancelled tabs |
| `/book/[doctorId]` | 3-step booking wizard: slot picker → visit details → confirm |
| `/book/[doctorId]/success` | Booking confirmation page |
| `/profile` | Personal info, visit preferences, notification preferences |
| `/notifications` | Notification centre |

### Provider Portal — `app/(provider)/`
| Route | Description |
|-------|-------------|
| `/dashboard` | Today's schedule, patient queue, quick stats |
| `/schedule` | Weekly calendar, availability management |
| `/patients` | Patient list + visit history |
| `/reviews` | Star ratings, comments, response input |
| `/settings` | Practice info, photo upload, billing, subscription |
| `/onboarding` | Multi-step join flow: `/onboarding?step=1` (profile) → `?step=2` (credentials) → `?step=3` (availability) → `?step=4` (review & go live) |

### Admin Panel — `app/(admin)/`
| Route | Description |
|-------|-------------|
| `/dashboard` | Platform metrics: DAU, bookings, revenue charts |
| `/users` | Patient + provider list, search, ban/approve |
| `/listings` | Provider listing approval queue, document review |
| `/content` | Static page content management |

---

## 6. Booking Flow (Cross-Portal)

1. Patient lands on `/doctor/[slug]` (public portal)
2. Clicks "Book Appointment" → redirects to `/login?return=/book/[doctorId]` if unauthenticated
3. After auth: `/book/[doctorId]?step=1` — select date/time slot from `availabilities`
4. `?step=2` — select visit type, confirm location and notes
5. `?step=3` — confirm details, pay via Razorpay checkout
6. On payment success webhook: appointment status → `confirmed`, slot → `is_booked: true`
7. Redirect to `/book/[doctorId]/success` with summary
8. Resend confirmation email + Supabase phone-provider SMS to patient and provider

---

## 7. Zocdoc Design System

| Token | Value |
|-------|-------|
| Primary (teal) | `#00766C` |
| Primary dark | `#005A52` |
| Primary light | `#E6F4F3` |
| Accent (orange CTAs) | `#FF6B35` |
| Surface (grey bg) | `#F5F5F5` |
| Text | `#1A1A1A` |
| Text muted | `#6B7280` |
| Card radius | `8px` |
| Button radius | `24px` |
| Card shadow | `0 2px 8px rgba(0,0,0,0.08)` |
| Font | Inter (all weights) |

**Breakpoints:** 375px (mobile), 768px (tablet), 1280px (desktop)

**Key shared components (owned by bp-ui-public):**
- `<SearchBar>` — condition autocomplete + location input
- `<DoctorCard>` — photo, name, specialty, rating stars, next available slot, Book button
- `<BookingWizard>` — 3-step wizard (slot → details → confirm)
- `<AvailabilityCalendar>` — date/time slot picker
- `<RatingStars>` — display + count
- `<AppHeader>` — logo, search, nav links, login/avatar
- `<AppFooter>` — links grid, app store badges, copyright

---

## 8. India-Specific Adaptations

| Concern | Implementation |
|---------|---------------|
| Currency | INR (₹), stored as integer rupees, displayed with ₹ symbol |
| Phone | +91 XXXXX XXXXX, E.164 format in DB (+91XXXXXXXXXX), validated with Zod |
| Pincode | 6-digit Indian postal codes, Zod regex `/^[1-9][0-9]{5}$/` |
| Auth | Phone/OTP via Supabase Auth (MSG91 backend configured in Supabase dashboard) as primary; email + Google as alternatives |
| Payments | Razorpay (UPI, cards, netbanking, wallets) — not Stripe |
| GST | 18% GST on platform service fee; `gst_amount_inr` tracked in `payments` table |
| Provider credential | ICP registration number required for verification |
| Visit types | in_clinic, home_visit (popular in India), online |
| Provider titles | Dr., PT, BPT, MPT supported in `providers.title` |

---

## 9. Build Strategy — 5 Parallel Agents

Backend runs first (sprint 0) to publish API contracts. Then 4 UI agents build in parallel.

| Agent ID | Owns | Branch |
|----------|------|--------|
| `bp-backend` | Schema, migrations, API routes, auth, Razorpay | `feat/backend` |
| `bp-ui-public` | Public portal + Auth pages + `src/components/shared/` | `feat/public-portal` |
| `bp-ui-patient` | Patient dashboard | `feat/patient-portal` |
| `bp-ui-provider` | Provider portal | `feat/provider-portal` |
| `bp-ui-admin` | Admin panel | `feat/admin-portal` |

**Shared components rule:** `src/components/shared/` is owned exclusively by `bp-ui-public`. Other UI agents may READ but never modify shared components. If a shared component needs changing, it raises a task for `bp-ui-public`.

**Merge order:** backend → public (includes shared) → patient → provider → admin

---

## 10. Security Checklist (pre-commit)

- [ ] No hardcoded secrets — all via `.env`, documented in `.env.example`
- [ ] All API route inputs validated with Zod before DB access
- [ ] RLS enabled on all Supabase tables, no `service_role` key client-side
- [ ] Razorpay webhook signature verified (`x-razorpay-signature` header)
- [ ] Rate limiting via Upstash Redis on all API routes
- [ ] No XSS via `innerHTML`
- [ ] File uploads: type whitelist (PDF, JPG, PNG only), 10MB max, stored in private Supabase bucket
- [ ] Error responses never leak stack traces
- [ ] CSRF: server actions use SameSite=Lax cookies (Next.js default), API routes use `Origin` header check
- [ ] Phone OTP: rate-limited to 5 attempts per number per 10 minutes
- [ ] GST amounts computed server-side, never trusted from client

---

## 11. Agent Ecosystem

| Agent | Role | HANDOFF Format |
|-------|------|----------------|
| `bp-orchestrator` | Reads ACTIVE.md + EXECUTION-PLAN.md, routes tasks, coordinates all agents | N/A — receives VERDICTs |
| `bp-ui-public` | Builds public portal, auth pages, and all shared components | HANDOFF: from=UI-Public |
| `bp-ui-patient` | Builds patient dashboard | HANDOFF: from=UI-Patient |
| `bp-ui-provider` | Builds provider portal | HANDOFF: from=UI-Provider |
| `bp-ui-admin` | Builds admin panel | HANDOFF: from=UI-Admin |
| `bp-backend` | Supabase schema/migrations, API routes, auth, Razorpay | HANDOFF: from=Backend |
| `bp-guardian` | QA gate — verifies every HANDOFF, runs build, spawns reviewers, has veto power | VERDICT: pass=true/false |

**Guardian verification criteria (summary):**
- Build passes with zero errors
- TypeScript reviewer approves all `.ts/.tsx` changes
- Security reviewer approves all API route changes
- Database reviewer approves all migration changes
- Zocdoc design tokens correct (teal, Inter, 8px radius)
- India-specific fields present (₹, +91, pincode)
- RLS policies present on new tables
- Zod validation present on all API inputs

---

## 12. Environment Variables Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # server-side only

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# Resend (email)
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# SMS / Phone OTP — configured INSIDE Supabase dashboard, not in app env.
# Auth → Providers → Phone → MSG91 (auth key + DLT template + sender ID)

# Upstash (rate limiting)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# App
NEXT_PUBLIC_APP_URL=
```
