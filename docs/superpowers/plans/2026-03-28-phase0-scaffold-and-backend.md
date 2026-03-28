# Phase 0 + Sprint 0: Project Scaffold & Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the bookphysio.in Next.js 15 project from the ai-website-cloner-template, configure all tooling, set up Supabase schema with migrations, implement all API routes, and publish TypeScript contracts so UI agents can build in parallel.

**Architecture:** Clone the ai-website-cloner-template (Next.js 15 + shadcn/ui pre-wired) into the bookphysio repo, layer in the full Supabase schema (14 tables + RLS), implement API routes under `src/app/api/`, and export TypeScript types to `src/app/api/contracts/` as the source of truth for all UI agents.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, Supabase (PostgreSQL + Auth + Storage), Zod, Razorpay, 100ms, Resend, MSG91, Upstash Redis, Vitest

---

## File Map

### Scaffold / Config
| File | Responsibility |
|------|---------------|
| `package.json` | Dependencies: next, react, supabase, zod, razorpay, @100mslive/server-sdk, resend, vitest |
| `tsconfig.json` | Strict TypeScript config with path aliases |
| `tailwind.config.ts` | Tailwind v4 config + Zocdoc design tokens |
| `.env.example` | All required env vars documented |
| `middleware.ts` | Auth route protection + Upstash rate limiting |
| `vitest.config.ts` | Vitest config with jsdom environment |

### Supabase
| File | Responsibility |
|------|---------------|
| `supabase/migrations/001_initial_schema.sql` | All 14 tables: users, providers, specialties, locations, insurances, provider_insurances, availabilities, appointments, payments, subscriptions, reviews, documents, notifications |
| `supabase/migrations/002_rls_policies.sql` | Row-level security policies for all roles |
| `supabase/migrations/003_indexes.sql` | Performance indexes on foreign keys + search columns |
| `supabase/seed.sql` | 10 specialties, 5 insurances, 2 seed providers, 10 availability slots |
| `src/lib/supabase/client.ts` | Browser Supabase client (anon key) |
| `src/lib/supabase/server.ts` | Server Supabase client (cookies-based, for API routes + Server Components) |
| `src/lib/supabase/admin.ts` | Service role client — server-only, never imported client-side |

### External Service Clients
| File | Responsibility |
|------|---------------|
| `src/lib/razorpay.ts` | Razorpay client init + order creation + webhook verification |
| `src/lib/resend.ts` | Resend email client + booking confirmation template |
| `src/lib/msg91.ts` | MSG91 SMS client + OTP send/verify |
| `src/lib/mapbox.ts` | Mapbox geocoding helper (address → lat/lng) |
| `src/lib/hundredms.ts` | 100ms management token + room creation |
| `src/lib/upstash.ts` | Upstash Redis client for rate limiting |

### Zod Validation Schemas
| File | Responsibility |
|------|---------------|
| `src/lib/validations/auth.ts` | Login, signup, OTP verify schemas |
| `src/lib/validations/provider.ts` | Provider profile, onboarding schemas |
| `src/lib/validations/booking.ts` | Appointment create, slot select schemas |
| `src/lib/validations/payment.ts` | Razorpay webhook payload schema |
| `src/lib/validations/review.ts` | Review create schema |
| `src/lib/validations/search.ts` | Search query params schema |

### API Routes
| File | Responsibility |
|------|---------------|
| `src/app/api/auth/signup/route.ts` | POST — patient + provider signup |
| `src/app/api/auth/otp/send/route.ts` | POST — send phone OTP via MSG91 |
| `src/app/api/auth/otp/verify/route.ts` | POST — verify OTP |
| `src/app/api/providers/route.ts` | GET — search providers (filters: specialty, city, insurance, visit_type) |
| `src/app/api/providers/[id]/route.ts` | GET — single provider profile |
| `src/app/api/providers/[id]/availability/route.ts` | GET — available slots for a date range |
| `src/app/api/providers/[id]/reviews/route.ts` | GET — paginated reviews for a provider |
| `src/app/api/appointments/route.ts` | POST/GET — create appointment + list patient appointments |
| `src/app/api/appointments/[id]/route.ts` | GET/PATCH — get single appointment or cancel it |
| `src/app/api/payments/create-order/route.ts` | POST — create Razorpay order |
| `src/app/api/payments/webhook/route.ts` | POST — Razorpay webhook (confirms appointment) |
| `src/app/api/payments/refund/route.ts` | POST — initiate refund for cancelled appointment |
| `src/app/api/telehealth/room/route.ts` | POST — create 100ms room for appointment |
| `src/app/api/reviews/route.ts` | POST — create review (after completed appointment) |
| `src/app/api/notifications/route.ts` | GET — list notifications for current user |
| `src/app/api/notifications/[id]/read/route.ts` | PATCH — mark notification read |
| `src/app/api/admin/users/route.ts` | GET — list users (admin only) |
| `src/app/api/admin/listings/route.ts` | GET/PATCH — provider approval queue |
| `src/app/api/upload/route.ts` | POST — credential document upload to Supabase Storage |

### API Contracts (TypeScript types for UI agents)
| File | Responsibility |
|------|---------------|
| `src/app/api/contracts/index.ts` | Re-exports all contract types |
| `src/app/api/contracts/provider.ts` | ProviderProfile, ProviderCard, ProviderSearchResult |
| `src/app/api/contracts/appointment.ts` | Appointment, AppointmentSlot, BookingRequest |
| `src/app/api/contracts/payment.ts` | PaymentOrder, PaymentWebhookPayload |
| `src/app/api/contracts/review.ts` | Review, ReviewCreateRequest |
| `src/app/api/contracts/notification.ts` | Notification |
| `src/app/api/contracts/user.ts` | UserProfile, PatientProfile |
| `src/app/api/contracts/search.ts` | SearchFilters, SearchResponse |

### Tests
| File | Responsibility |
|------|---------------|
| `src/lib/validations/__tests__/auth.test.ts` | Zod schema unit tests for auth |
| `src/lib/validations/__tests__/booking.test.ts` | Zod schema unit tests for booking |
| `src/lib/validations/__tests__/search.test.ts` | Zod schema unit tests for search |
| `src/app/api/__tests__/providers.test.ts` | API route integration tests |
| `src/app/api/__tests__/appointments.test.ts` | Appointment creation + cancellation tests |
| `src/app/api/__tests__/payments.test.ts` | Payment order + webhook verification tests |

---

## Task 1: Clone Template and Configure Project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `.env.example`
- Create: `vitest.config.ts`
- Create: `next.config.ts`

- [ ] **Step 1.1: Clone the template**

```bash
cd c:/Users/pvr66/bookphysio
git clone https://github.com/JCodesMore/ai-website-cloner-template.git _template_tmp
cp -r _template_tmp/. .
rm -rf _template_tmp
```

If the template is unavailable or has conflicts, use `create-next-app` instead:
```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*" --no-git
```

- [ ] **Step 1.2: Install all project dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr zod razorpay @100mslive/server-sdk resend zustand @tanstack/react-query mapbox-gl lucide-react
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @types/node
npx shadcn@latest init
```

When prompted by shadcn init:
- Style: Default
- Base color: Neutral
- CSS variables: Yes

- [ ] **Step 1.3: Configure `tsconfig.json` with strict settings**

Replace the tsconfig with:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 1.4: Create `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
```

Create `src/test/setup.ts`:
```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 1.5: Create `.env.example`**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=your-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret

# 100ms (telehealth)
HMS_APP_ACCESS_KEY=your-access-key
HMS_APP_SECRET=your-app-secret
HMS_TEMPLATE_ID=your-template-id

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...

# Resend (email)
RESEND_API_KEY=re_xxxx
RESEND_FROM_EMAIL=noreply@bookphysio.in

# MSG91 (SMS/OTP)
MSG91_AUTH_KEY=your-auth-key
MSG91_TEMPLATE_ID=your-template-id

# Upstash (rate limiting)
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- [ ] **Step 1.6: Add npm scripts to `package.json`**

Ensure these scripts exist:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "type-check": "tsc --noEmit"
  }
}
```

- [ ] **Step 1.7: Verify the project starts**

```bash
npm run dev
```
Expected: Next.js dev server starts at `http://localhost:3000` with no errors.

- [ ] **Step 1.8: Commit**

```bash
rtk git add package.json tsconfig.json vitest.config.ts .env.example next.config.ts tailwind.config.ts src/test/setup.ts
rtk git commit -m "chore: scaffold project from template with full tooling config"
```

---

## Task 2: Configure Tailwind with Zocdoc Design Tokens

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`

- [ ] **Step 2.1: Write failing test for design token existence**

Create `src/test/design-tokens.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '../../tailwind.config'

const config = resolveConfig(tailwindConfig)

describe('Design tokens', () => {
  it('has primary teal color', () => {
    expect(config.theme.colors['bp-primary']).toBe('#00766C')
  })
  it('has accent orange color', () => {
    expect(config.theme.colors['bp-accent']).toBe('#FF6B35')
  })
})
```

- [ ] **Step 2.2: Run test to verify it fails**

```bash
npm test src/test/design-tokens.test.ts
```
Expected: FAIL — `bp-primary` is not defined.

- [ ] **Step 2.3: Add design tokens to `tailwind.config.ts`**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bp-primary': '#00766C',
        'bp-primary-dark': '#005A52',
        'bp-primary-light': '#E6F4F3',
        'bp-accent': '#FF6B35',
        'bp-surface': '#F5F5F5',
        'bp-text': '#1A1A1A',
        'bp-muted': '#6B7280',
      },
      borderRadius: {
        card: '8px',
        btn: '24px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      screens: {
        sm: '375px',
        md: '768px',
        lg: '1280px',
      },
    },
  },
}

export default config
```

- [ ] **Step 2.4: Run test to verify it passes**

```bash
npm test src/test/design-tokens.test.ts
```
Expected: PASS

- [ ] **Step 2.5: Add Inter font to `globals.css`**

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 2.6: Commit**

```bash
rtk git add tailwind.config.ts src/app/globals.css src/test/design-tokens.test.ts
rtk git commit -m "feat: add Zocdoc design tokens to Tailwind config"
```

---

## Task 3: Supabase Client Setup

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/admin.ts`
- Create: `middleware.ts`

- [ ] **Step 3.1: Write failing test for Supabase client initialization**

Create `src/lib/supabase/__tests__/client.test.ts`:
```typescript
import { describe, it, expect, vi } from 'vitest'

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({ auth: { getUser: vi.fn() } })),
}))

describe('Supabase browser client', () => {
  it('creates client without throwing', async () => {
    const { createClient } = await import('../client')
    expect(() => createClient()).not.toThrow()
  })
})
```

- [ ] **Step 3.2: Run test to verify it fails**

```bash
npm test src/lib/supabase/__tests__/client.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 3.3: Create `src/lib/supabase/client.ts`**

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 3.4: Create `src/lib/supabase/server.ts`**

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

- [ ] **Step 3.5: Create `src/lib/supabase/admin.ts`**

```typescript
import { createClient } from '@supabase/supabase-js'

// NEVER import this file in client components or expose to browser
if (typeof window !== 'undefined') {
  throw new Error('admin supabase client must only be used server-side')
}

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)
```

- [ ] **Step 3.6: Create `middleware.ts`**

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PREFIXES = ['/dashboard', '/appointments', '/book', '/telehealth', '/profile', '/notifications', '/schedule', '/patients', '/reviews', '/settings', '/onboarding']
const ADMIN_PREFIX = '/admin'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p))
  const isAdmin = pathname.startsWith(ADMIN_PREFIX)

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('return', pathname)
    return NextResponse.redirect(url)
  }

  if (isAdmin) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user?.id ?? '')
      .single()
    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/payments/webhook).*)'],
}
```

- [ ] **Step 3.7: Run Supabase client test**

```bash
npm test src/lib/supabase/__tests__/client.test.ts
```
Expected: PASS

- [ ] **Step 3.8: Commit**

```bash
rtk git add src/lib/supabase/ middleware.ts
rtk git commit -m "feat: add Supabase client (browser, server, admin) + auth middleware"
```

---

## Task 4: Database Migrations

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`
- Create: `supabase/migrations/002_rls_policies.sql`
- Create: `supabase/migrations/003_indexes.sql`
- Create: `supabase/seed.sql`

- [ ] **Step 4.1: Create initial schema migration**

Create `supabase/migrations/001_initial_schema.sql`:
```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (linked to Supabase auth.users)
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('patient', 'provider', 'admin')),
  full_name text NOT NULL,
  phone text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Specialties lookup
CREATE TABLE specialties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  icon_url text
);

-- Provider profiles
CREATE TABLE providers (
  id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  slug text UNIQUE NOT NULL,
  title text CHECK (title IN ('Dr.', 'PT', 'BPT', 'MPT')),
  icp_registration_no text,
  specialty_ids uuid[] NOT NULL DEFAULT '{}',
  bio text,
  experience_years int CHECK (experience_years >= 0),
  consultation_fee_inr int CHECK (consultation_fee_inr >= 0),
  rating_avg numeric(3,2) NOT NULL DEFAULT 0,
  rating_count int NOT NULL DEFAULT 0,
  verified boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  onboarding_step int NOT NULL DEFAULT 1 CHECK (onboarding_step BETWEEN 1 AND 4),
  gstin text
);

-- Insurance plans
CREATE TABLE insurances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  logo_url text
);

-- Provider <-> Insurance mapping
CREATE TABLE provider_insurances (
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  insurance_id uuid NOT NULL REFERENCES insurances(id) ON DELETE CASCADE,
  PRIMARY KEY (provider_id, insurance_id)
);

-- Clinic locations
CREATE TABLE locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  pincode char(6) NOT NULL CHECK (pincode ~ '^[1-9][0-9]{5}$'),
  lat numeric(10,7),
  lng numeric(10,7),
  visit_type text[] NOT NULL DEFAULT '{in_clinic}'
    CHECK (visit_type <@ ARRAY['in_clinic','home_visit','online']::text[])
);

-- Provider availability slots
CREATE TABLE availabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  location_id uuid REFERENCES locations(id) ON DELETE SET NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  slot_duration_mins int NOT NULL DEFAULT 30 CHECK (slot_duration_mins > 0),
  buffer_mins int NOT NULL DEFAULT 0 CHECK (buffer_mins >= 0),
  is_recurring boolean NOT NULL DEFAULT false,
  recurrence_rule text,
  is_booked boolean NOT NULL DEFAULT false,
  is_blocked boolean NOT NULL DEFAULT false,
  CONSTRAINT valid_time_range CHECK (ends_at > starts_at)
);

-- Appointments
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE RESTRICT,
  availability_id uuid NOT NULL REFERENCES availabilities(id) ON DELETE RESTRICT,
  location_id uuid REFERENCES locations(id) ON DELETE SET NULL,
  visit_type text NOT NULL CHECK (visit_type IN ('in_clinic','home_visit','online')),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','cancelled','completed','no_show')),
  insurance_id uuid REFERENCES insurances(id) ON DELETE SET NULL,
  fee_inr int NOT NULL CHECK (fee_inr >= 0),
  telehealth_room_id text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Payments
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE RESTRICT,
  razorpay_order_id text UNIQUE,
  razorpay_payment_id text,
  amount_inr int NOT NULL CHECK (amount_inr >= 0),
  gst_amount_inr int NOT NULL DEFAULT 0 CHECK (gst_amount_inr >= 0),
  status text NOT NULL DEFAULT 'created'
    CHECK (status IN ('created','paid','failed','refunded')),
  refund_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Provider subscriptions
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  razorpay_subscription_id text UNIQUE,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free','basic','pro')),
  status text NOT NULL DEFAULT 'trial'
    CHECK (status IN ('trial','active','past_due','cancelled')),
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Reviews
CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid UNIQUE NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  provider_reply text,
  is_published boolean NOT NULL DEFAULT true,
  is_flagged boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Provider credential documents
CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('degree','registration','id_proof','photo')),
  storage_path text NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

-- Notifications
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger: auto-create users row on auth.users insert
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, role, full_name, phone, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.phone,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger: update provider rating on new review
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE providers SET
    rating_avg = (SELECT AVG(rating)::numeric(3,2) FROM reviews WHERE provider_id = NEW.provider_id AND is_published = true),
    rating_count = (SELECT COUNT(*) FROM reviews WHERE provider_id = NEW.provider_id AND is_published = true)
  WHERE id = NEW.provider_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_created
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_provider_rating();
```

- [ ] **Step 4.2: Create RLS policies migration**

Create `supabase/migrations/002_rls_policies.sql`:
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurances ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_insurances ENABLE ROW LEVEL SECURITY;
ALTER TABLE availabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user role
CREATE OR REPLACE FUNCTION auth_role()
RETURNS text AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- users: own row access
CREATE POLICY "users_select_own" ON users FOR SELECT USING (id = auth.uid() OR auth_role() = 'admin');
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (id = auth.uid());

-- providers: public read (verified+active), self write
CREATE POLICY "providers_public_read" ON providers FOR SELECT USING (verified = true AND active = true OR id = auth.uid() OR auth_role() = 'admin');
CREATE POLICY "providers_self_insert" ON providers FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "providers_self_update" ON providers FOR UPDATE USING (id = auth.uid() OR auth_role() = 'admin');

-- specialties: public read
CREATE POLICY "specialties_public_read" ON specialties FOR SELECT USING (true);
CREATE POLICY "specialties_admin_write" ON specialties FOR ALL USING (auth_role() = 'admin');

-- insurances: public read
CREATE POLICY "insurances_public_read" ON insurances FOR SELECT USING (true);
CREATE POLICY "insurances_admin_write" ON insurances FOR ALL USING (auth_role() = 'admin');

-- locations: public read for verified providers, self write
CREATE POLICY "locations_public_read" ON locations FOR SELECT USING (
  EXISTS (SELECT 1 FROM providers p WHERE p.id = locations.provider_id AND p.verified = true AND p.active = true)
  OR provider_id = auth.uid() OR auth_role() = 'admin'
);
CREATE POLICY "locations_self_write" ON locations FOR INSERT WITH CHECK (provider_id = auth.uid());
CREATE POLICY "locations_self_update" ON locations FOR UPDATE USING (provider_id = auth.uid() OR auth_role() = 'admin');

-- provider_insurances: public read, self write
CREATE POLICY "provider_insurances_public_read" ON provider_insurances FOR SELECT USING (true);
CREATE POLICY "provider_insurances_self_write" ON provider_insurances FOR INSERT WITH CHECK (provider_id = auth.uid());
CREATE POLICY "provider_insurances_self_delete" ON provider_insurances FOR DELETE USING (provider_id = auth.uid());

-- availabilities: public read (unbooked), provider self write
CREATE POLICY "availabilities_public_read" ON availabilities FOR SELECT USING (
  is_blocked = false OR provider_id = auth.uid() OR auth_role() = 'admin'
);
CREATE POLICY "availabilities_provider_write" ON availabilities FOR INSERT WITH CHECK (provider_id = auth.uid());
CREATE POLICY "availabilities_provider_update" ON availabilities FOR UPDATE USING (provider_id = auth.uid() OR auth_role() = 'admin');

-- appointments: patient owns, provider reads theirs
CREATE POLICY "appointments_patient_read" ON appointments FOR SELECT USING (patient_id = auth.uid() OR provider_id = auth.uid() OR auth_role() = 'admin');
CREATE POLICY "appointments_patient_insert" ON appointments FOR INSERT WITH CHECK (patient_id = auth.uid());
CREATE POLICY "appointments_update" ON appointments FOR UPDATE USING (patient_id = auth.uid() OR provider_id = auth.uid() OR auth_role() = 'admin');

-- payments: patient + provider read own
CREATE POLICY "payments_read" ON payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM appointments a WHERE a.id = payments.appointment_id AND (a.patient_id = auth.uid() OR a.provider_id = auth.uid()))
  OR auth_role() = 'admin'
);

-- subscriptions: provider self
CREATE POLICY "subscriptions_self" ON subscriptions FOR ALL USING (provider_id = auth.uid() OR auth_role() = 'admin');

-- reviews: public read (published), patient write
CREATE POLICY "reviews_public_read" ON reviews FOR SELECT USING (is_published = true OR patient_id = auth.uid() OR provider_id = auth.uid() OR auth_role() = 'admin');
CREATE POLICY "reviews_patient_insert" ON reviews FOR INSERT WITH CHECK (patient_id = auth.uid());
CREATE POLICY "reviews_provider_reply" ON reviews FOR UPDATE USING (provider_id = auth.uid() OR auth_role() = 'admin');

-- documents: provider self, admin read
CREATE POLICY "documents_self" ON documents FOR ALL USING (provider_id = auth.uid() OR auth_role() = 'admin');

-- notifications: own only
CREATE POLICY "notifications_own" ON notifications FOR ALL USING (user_id = auth.uid());
```

- [ ] **Step 4.3: Create indexes migration**

Create `supabase/migrations/003_indexes.sql`:
```sql
-- Provider search indexes
CREATE INDEX idx_providers_verified_active ON providers (verified, active);
CREATE INDEX idx_providers_specialty_ids ON providers USING GIN (specialty_ids);
CREATE INDEX idx_providers_rating ON providers (rating_avg DESC);

-- Location search (city, geospatial)
CREATE INDEX idx_locations_city ON locations (city);
CREATE INDEX idx_locations_provider ON locations (provider_id);
CREATE INDEX idx_locations_lat_lng ON locations (lat, lng);

-- Availability lookup
CREATE INDEX idx_availabilities_provider_starts ON availabilities (provider_id, starts_at);
CREATE INDEX idx_availabilities_unbooked ON availabilities (provider_id, is_booked, is_blocked, starts_at) WHERE is_booked = false AND is_blocked = false;

-- Appointment queries
CREATE INDEX idx_appointments_patient ON appointments (patient_id, created_at DESC);
CREATE INDEX idx_appointments_provider ON appointments (provider_id, created_at DESC);
CREATE INDEX idx_appointments_status ON appointments (status);

-- Notifications
CREATE INDEX idx_notifications_user_unread ON notifications (user_id, read, created_at DESC);

-- Reviews
CREATE INDEX idx_reviews_provider ON reviews (provider_id, is_published, created_at DESC);
```

- [ ] **Step 4.4: Create seed data**

Create `supabase/seed.sql`:
```sql
-- Specialties
INSERT INTO specialties (name, slug) VALUES
  ('Orthopaedic Physiotherapy', 'orthopaedic'),
  ('Sports Physiotherapy', 'sports'),
  ('Neurological Physiotherapy', 'neurological'),
  ('Paediatric Physiotherapy', 'paediatric'),
  ('Geriatric Physiotherapy', 'geriatric'),
  ('Cardiopulmonary Physiotherapy', 'cardiopulmonary'),
  ('Post-Surgical Rehabilitation', 'post-surgical'),
  ('Spine & Back Pain', 'spine'),
  ('Women''s Health Physiotherapy', 'womens-health'),
  ('Home Visit Physiotherapy', 'home-visit');

-- Insurance plans
INSERT INTO insurances (name) VALUES
  ('Star Health Insurance'),
  ('ICICI Lombard Health'),
  ('HDFC ERGO Health'),
  ('Niva Bupa Health Insurance'),
  ('Care Health Insurance');
```

- [ ] **Step 4.5: Apply migrations to local Supabase**

```bash
# Start local Supabase (requires Supabase CLI installed)
npx supabase start
npx supabase db push
npx supabase db seed
```

If Supabase CLI is not installed:
```bash
npm install -g supabase
supabase login
supabase link --project-ref your-project-ref
supabase db push
```

- [ ] **Step 4.6: Commit**

```bash
rtk git add supabase/
rtk git commit -m "feat: add initial schema migrations, RLS policies, indexes, and seed data"
```

---

## Task 5: Zod Validation Schemas

**Files:**
- Create: `src/lib/validations/auth.ts`
- Create: `src/lib/validations/provider.ts`
- Create: `src/lib/validations/booking.ts`
- Create: `src/lib/validations/payment.ts`
- Create: `src/lib/validations/review.ts`
- Create: `src/lib/validations/search.ts`
- Create: `src/lib/validations/__tests__/auth.test.ts`
- Create: `src/lib/validations/__tests__/booking.test.ts`
- Create: `src/lib/validations/__tests__/search.test.ts`

- [ ] **Step 5.1: Write failing tests for auth schemas**

Create `src/lib/validations/__tests__/auth.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { signupPatientSchema, signupProviderSchema, otpVerifySchema } from '../auth'

describe('signupPatientSchema', () => {
  it('accepts valid patient signup', () => {
    const result = signupPatientSchema.safeParse({
      full_name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '+919876543210',
      password: 'SecurePass123',
    })
    expect(result.success).toBe(true)
  })
  it('rejects invalid Indian phone number', () => {
    const result = signupPatientSchema.safeParse({
      full_name: 'Test User',
      email: 'test@example.com',
      phone: '9876543210', // missing +91
      password: 'SecurePass123',
    })
    expect(result.success).toBe(false)
  })
  it('rejects short password', () => {
    const result = signupPatientSchema.safeParse({
      full_name: 'Test User',
      email: 'test@example.com',
      phone: '+919876543210',
      password: 'short',
    })
    expect(result.success).toBe(false)
  })
})

describe('otpVerifySchema', () => {
  it('accepts valid 6-digit OTP', () => {
    const result = otpVerifySchema.safeParse({ phone: '+919876543210', otp: '123456' })
    expect(result.success).toBe(true)
  })
  it('rejects non-6-digit OTP', () => {
    const result = otpVerifySchema.safeParse({ phone: '+919876543210', otp: '12345' })
    expect(result.success).toBe(false)
  })
})
```

- [ ] **Step 5.2: Run test to verify it fails**

```bash
npm test src/lib/validations/__tests__/auth.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 5.3: Create `src/lib/validations/auth.ts`**

```typescript
import { z } from 'zod'

const phoneSchema = z.string().regex(/^\+91[6-9]\d{9}$/, 'Enter a valid Indian mobile number (+91XXXXXXXXXX)')
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters')

export const signupPatientSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Enter a valid email address'),
  phone: phoneSchema,
  password: passwordSchema,
})

export const signupProviderSchema = z.object({
  full_name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: phoneSchema,
  password: passwordSchema,
  title: z.enum(['Dr.', 'PT', 'BPT', 'MPT']),
  icp_registration_no: z.string().min(1, 'ICP registration number is required'),
  specialty_ids: z.array(z.string().uuid()).min(1, 'Select at least one specialty'),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
})

export const otpSendSchema = z.object({
  phone: phoneSchema,
})

export const otpVerifySchema = z.object({
  phone: phoneSchema,
  otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d{6}$/),
})

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirm_password: passwordSchema,
}).refine(data => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

export type SignupPatientInput = z.infer<typeof signupPatientSchema>
export type SignupProviderInput = z.infer<typeof signupProviderSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>
```

- [ ] **Step 5.4: Run test to verify it passes**

```bash
npm test src/lib/validations/__tests__/auth.test.ts
```
Expected: PASS

- [ ] **Step 5.5: Create remaining validation schemas**

Create `src/lib/validations/search.ts`:
```typescript
import { z } from 'zod'

export const searchFiltersSchema = z.object({
  query: z.string().optional(),
  city: z.string().optional(),
  specialty_id: z.string().uuid().optional(),
  insurance_id: z.string().uuid().optional(),
  visit_type: z.enum(['in_clinic', 'home_visit', 'online']).optional(),
  available_date: z.string().date().optional(), // YYYY-MM-DD
  min_rating: z.coerce.number().min(1).max(5).optional(),
  max_fee_inr: z.coerce.number().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

export type SearchFilters = z.infer<typeof searchFiltersSchema>
```

Create `src/lib/validations/booking.ts`:
```typescript
import { z } from 'zod'

export const createAppointmentSchema = z.object({
  provider_id: z.string().uuid(),
  availability_id: z.string().uuid(),
  location_id: z.string().uuid().optional(),
  visit_type: z.enum(['in_clinic', 'home_visit', 'online']),
  insurance_id: z.string().uuid().optional(),
  notes: z.string().max(500).optional(),
})

export const cancelAppointmentSchema = z.object({
  reason: z.string().min(1).max(200).optional(),
})

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>
```

Create `src/lib/validations/payment.ts`:
```typescript
import { z } from 'zod'

export const createOrderSchema = z.object({
  appointment_id: z.string().uuid(),
})

export const razorpayWebhookSchema = z.object({
  event: z.string(),
  payload: z.object({
    payment: z.object({
      entity: z.object({
        id: z.string(),
        order_id: z.string(),
        amount: z.number(),
        status: z.string(),
      }),
    }).optional(),
    subscription: z.object({
      entity: z.object({
        id: z.string(),
        status: z.string(),
      }),
    }).optional(),
  }),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
```

Create `src/lib/validations/review.ts`:
```typescript
import { z } from 'zod'

export const createReviewSchema = z.object({
  appointment_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
})

export type CreateReviewInput = z.infer<typeof createReviewSchema>
```

Create `src/lib/validations/provider.ts`:
```typescript
import { z } from 'zod'

const pincodeSchema = z.string().regex(/^[1-9][0-9]{5}$/, 'Enter a valid 6-digit pincode')

export const providerProfileSchema = z.object({
  title: z.enum(['Dr.', 'PT', 'BPT', 'MPT']),
  bio: z.string().max(2000).optional(),
  experience_years: z.number().int().min(0).max(60),
  consultation_fee_inr: z.number().int().min(0),
  specialty_ids: z.array(z.string().uuid()).min(1),
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).optional(),
})

export const locationSchema = z.object({
  name: z.string().min(1).max(100),
  address: z.string().min(1).max(300),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  pincode: pincodeSchema,
  visit_type: z.array(z.enum(['in_clinic', 'home_visit', 'online'])).min(1),
})

export type ProviderProfileInput = z.infer<typeof providerProfileSchema>
export type LocationInput = z.infer<typeof locationSchema>
```

- [ ] **Step 5.6: Write and run search schema tests**

Create `src/lib/validations/__tests__/search.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { searchFiltersSchema } from '../search'

describe('searchFiltersSchema', () => {
  it('accepts empty filters with defaults', () => {
    const result = searchFiltersSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(20)
    }
  })
  it('coerces string numbers for page/limit', () => {
    const result = searchFiltersSchema.safeParse({ page: '2', limit: '10' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(2)
    }
  })
  it('rejects limit above 50', () => {
    const result = searchFiltersSchema.safeParse({ limit: '100' })
    expect(result.success).toBe(false)
  })
})
```

```bash
npm test src/lib/validations/__tests__/
```
Expected: All PASS

- [ ] **Step 5.7: Commit**

```bash
rtk git add src/lib/validations/
rtk git commit -m "feat: add Zod validation schemas for all API input boundaries"
```

---

## Task 6: External Service Clients

**Files:**
- Create: `src/lib/razorpay.ts`
- Create: `src/lib/resend.ts`
- Create: `src/lib/msg91.ts`
- Create: `src/lib/mapbox.ts`
- Create: `src/lib/hundredms.ts`
- Create: `src/lib/upstash.ts`

- [ ] **Step 6.1: Create `src/lib/razorpay.ts`**

```typescript
import Razorpay from 'razorpay'
import crypto from 'crypto'

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function createOrder(amountInr: number, receiptId: string) {
  return razorpay.orders.create({
    amount: amountInr * 100, // Razorpay expects paise
    currency: 'INR',
    receipt: receiptId,
  })
}

export function verifyWebhookSignature(body: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

export function calculateGst(amountInr: number): number {
  // 18% GST on platform service fee — computed server-side only
  return Math.round(amountInr * 0.18)
}
```

- [ ] **Step 6.2: Create `src/lib/resend.ts`**

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function sendBookingConfirmation({
  to,
  patientName,
  providerName,
  appointmentDate,
  appointmentTime,
  visitType,
  amountInr,
}: {
  to: string
  patientName: string
  providerName: string
  appointmentDate: string
  appointmentTime: string
  visitType: string
  amountInr: number
}) {
  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject: `Appointment Confirmed — ${providerName}`,
    html: `
      <h2>Appointment Confirmed</h2>
      <p>Hi ${patientName},</p>
      <p>Your appointment with <strong>${providerName}</strong> is confirmed.</p>
      <ul>
        <li><strong>Date:</strong> ${appointmentDate}</li>
        <li><strong>Time:</strong> ${appointmentTime}</li>
        <li><strong>Type:</strong> ${visitType}</li>
        <li><strong>Fee:</strong> ₹${amountInr}</li>
      </ul>
      <p>You can manage your appointment at <a href="${process.env.NEXT_PUBLIC_APP_URL}/appointments">bookphysio.in</a></p>
    `,
  })
}
```

- [ ] **Step 6.3: Create `src/lib/msg91.ts`**

```typescript
const MSG91_BASE = 'https://api.msg91.com/api/v5'

export async function sendOtp(phone: string): Promise<{ success: boolean; error?: string }> {
  // phone must be E.164: +91XXXXXXXXXX — strip the leading + for MSG91
  const mobile = phone.replace('+', '')
  const res = await fetch(`${MSG91_BASE}/otp?template_id=${process.env.MSG91_TEMPLATE_ID}&mobile=${mobile}&authkey=${process.env.MSG91_AUTH_KEY}`, {
    method: 'POST',
  })
  const data = await res.json() as { type: string; message: string }
  return { success: data.type === 'success', error: data.type !== 'success' ? data.message : undefined }
}

export async function verifyOtp(phone: string, otp: string): Promise<{ success: boolean; error?: string }> {
  const mobile = phone.replace('+', '')
  const res = await fetch(`${MSG91_BASE}/otp/verify?mobile=${mobile}&otp=${otp}&authkey=${process.env.MSG91_AUTH_KEY}`, {
    method: 'GET',
  })
  const data = await res.json() as { type: string; message: string }
  return { success: data.type === 'success', error: data.type !== 'success' ? data.message : undefined }
}

export async function sendSms(phone: string, message: string): Promise<void> {
  const mobile = phone.replace('+', '')
  await fetch(`${MSG91_BASE}/flow/`, {
    method: 'POST',
    headers: { authkey: process.env.MSG91_AUTH_KEY!, 'content-type': 'application/json' },
    body: JSON.stringify({ template_id: process.env.MSG91_TEMPLATE_ID, mobile, message }),
  })
}
```

- [ ] **Step 6.4: Create `src/lib/mapbox.ts`**

```typescript
const MAPBOX_BASE = 'https://api.mapbox.com'

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const encoded = encodeURIComponent(address)
  const res = await fetch(
    `${MAPBOX_BASE}/geocoding/v5/mapbox.places/${encoded}.json?country=IN&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
  )
  const data = await res.json() as { features: Array<{ center: [number, number] }> }
  const feature = data.features[0]
  if (!feature) return null
  return { lng: feature.center[0], lat: feature.center[1] }
}
```

- [ ] **Step 6.5: Create `src/lib/hundredms.ts`**

```typescript
import jwt from 'jsonwebtoken'

function createManagementToken(): string {
  const payload = {
    access_key: process.env.HMS_APP_ACCESS_KEY!,
    type: 'management',
    version: 2,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400, // 24h
  }
  return jwt.sign(payload, process.env.HMS_APP_SECRET!, { algorithm: 'HS256' })
}

export async function createTelehealthRoom(appointmentId: string): Promise<string> {
  const token = createManagementToken()
  const res = await fetch('https://api.100ms.live/v2/rooms', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: `appointment-${appointmentId}`,
      description: `bookphysio telehealth session`,
      template_id: process.env.HMS_TEMPLATE_ID,
    }),
  })
  const data = await res.json() as { id: string }
  return data.id
}
```

Note: Add `jsonwebtoken` and `@types/jsonwebtoken` to dependencies:
```bash
npm install jsonwebtoken
npm install -D @types/jsonwebtoken
```

- [ ] **Step 6.6: Create `src/lib/upstash.ts`**

```typescript
import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// 20 requests per 10 seconds per IP — general API rate limit
export const apiRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '10 s'),
  prefix: 'bp:api',
})

// 5 OTP attempts per phone per 10 minutes
export const otpRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '10 m'),
  prefix: 'bp:otp',
})
```

Install Upstash packages:
```bash
npm install @upstash/redis @upstash/ratelimit
```

- [ ] **Step 6.7: Commit**

```bash
rtk git add src/lib/razorpay.ts src/lib/resend.ts src/lib/msg91.ts src/lib/mapbox.ts src/lib/hundredms.ts src/lib/upstash.ts
rtk git commit -m "feat: add external service clients (Razorpay, Resend, MSG91, Mapbox, 100ms, Upstash)"
```

---

## Task 7: API Contracts (TypeScript Types for UI Agents)

**Files:**
- Create: `src/app/api/contracts/user.ts`
- Create: `src/app/api/contracts/provider.ts`
- Create: `src/app/api/contracts/appointment.ts`
- Create: `src/app/api/contracts/payment.ts`
- Create: `src/app/api/contracts/review.ts`
- Create: `src/app/api/contracts/notification.ts`
- Create: `src/app/api/contracts/search.ts`
- Create: `src/app/api/contracts/index.ts`

- [ ] **Step 7.1: Create `src/app/api/contracts/user.ts`**

```typescript
export interface UserProfile {
  id: string
  role: 'patient' | 'provider' | 'admin'
  full_name: string
  phone: string | null
  avatar_url: string | null
  created_at: string
}

export interface PatientProfile extends UserProfile {
  role: 'patient'
}
```

- [ ] **Step 7.2: Create `src/app/api/contracts/provider.ts`**

```typescript
export interface Specialty {
  id: string
  name: string
  slug: string
  icon_url: string | null
}

export interface Insurance {
  id: string
  name: string
  logo_url: string | null
}

export interface ProviderLocation {
  id: string
  name: string
  address: string
  city: string
  state: string
  pincode: string
  lat: number | null
  lng: number | null
  visit_type: ('in_clinic' | 'home_visit' | 'online')[]
}

export interface ProviderCard {
  id: string
  slug: string
  full_name: string
  title: 'Dr.' | 'PT' | 'BPT' | 'MPT' | null
  avatar_url: string | null
  specialties: Specialty[]
  rating_avg: number
  rating_count: number
  experience_years: number | null
  consultation_fee_inr: number | null
  next_available_slot: string | null // ISO datetime
  visit_types: ('in_clinic' | 'home_visit' | 'online')[]
  city: string | null
  insurances: Insurance[]
}

export interface ProviderProfile extends ProviderCard {
  bio: string | null
  icp_registration_no: string | null
  locations: ProviderLocation[]
  verified: boolean
  onboarding_step: 1 | 2 | 3 | 4
  gstin: string | null
}
```

- [ ] **Step 7.3: Create `src/app/api/contracts/appointment.ts`**

```typescript
import type { ProviderCard, ProviderLocation } from './provider'
import type { UserProfile } from './user'

export type VisitType = 'in_clinic' | 'home_visit' | 'online'
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'

export interface AppointmentSlot {
  id: string
  starts_at: string // ISO datetime
  ends_at: string
  slot_duration_mins: number
  location_id: string | null
}

export interface Appointment {
  id: string
  patient: Pick<UserProfile, 'id' | 'full_name' | 'avatar_url'>
  provider: ProviderCard
  slot: AppointmentSlot
  location: ProviderLocation | null
  visit_type: VisitType
  status: AppointmentStatus
  fee_inr: number
  insurance_id: string | null
  telehealth_room_id: string | null
  notes: string | null
  created_at: string
}

export interface BookingRequest {
  provider_id: string
  availability_id: string
  location_id?: string
  visit_type: VisitType
  insurance_id?: string
  notes?: string
}
```

- [ ] **Step 7.4: Create remaining contract files**

Create `src/app/api/contracts/payment.ts`:
```typescript
export type PaymentStatus = 'created' | 'paid' | 'failed' | 'refunded'

export interface PaymentOrder {
  id: string
  appointment_id: string
  razorpay_order_id: string
  amount_inr: number
  gst_amount_inr: number
  status: PaymentStatus
  created_at: string
}

export interface RazorpayCheckoutConfig {
  key: string
  amount: number // paise
  currency: 'INR'
  name: string
  description: string
  order_id: string
  prefill: {
    name: string
    email: string
    contact: string
  }
}
```

Create `src/app/api/contracts/review.ts`:
```typescript
export interface Review {
  id: string
  appointment_id: string
  patient: { id: string; full_name: string; avatar_url: string | null }
  provider_id: string
  rating: 1 | 2 | 3 | 4 | 5
  comment: string | null
  provider_reply: string | null
  is_published: boolean
  created_at: string
}
```

Create `src/app/api/contracts/notification.ts`:
```typescript
export type NotificationType =
  | 'appointment_confirmed'
  | 'appointment_cancelled'
  | 'appointment_reminder_1h'
  | 'appointment_reminder_24h'
  | 'payment_received'
  | 'review_received'

export interface Notification {
  id: string
  type: NotificationType | string
  title: string
  body: string
  read: boolean
  metadata: Record<string, unknown> | null
  created_at: string
}
```

Create `src/app/api/contracts/search.ts`:
```typescript
import type { ProviderCard } from './provider'

export interface SearchFilters {
  query?: string
  city?: string
  specialty_id?: string
  insurance_id?: string
  visit_type?: 'in_clinic' | 'home_visit' | 'online'
  available_date?: string
  min_rating?: number
  max_fee_inr?: number
  page: number
  limit: number
}

export interface SearchResponse {
  providers: ProviderCard[]
  total: number
  page: number
  limit: number
}
```

- [ ] **Step 7.5: Create `src/app/api/contracts/index.ts`**

```typescript
export * from './user'
export * from './provider'
export * from './appointment'
export * from './payment'
export * from './review'
export * from './notification'
export * from './search'
```

- [ ] **Step 7.6: Run type check to verify all contracts are valid**

```bash
npm run type-check
```
Expected: No TypeScript errors.

- [ ] **Step 7.7: Commit**

```bash
rtk git add src/app/api/contracts/
rtk git commit -m "feat: publish API contracts — TypeScript types for all UI agents"
```

---

## Task 8: Core API Routes

**Files:**
- Create: `src/app/api/providers/route.ts`
- Create: `src/app/api/providers/[id]/route.ts`
- Create: `src/app/api/providers/[id]/availability/route.ts`
- Create: `src/app/api/appointments/route.ts`
- Create: `src/app/api/appointments/[id]/route.ts`
- Create: `src/app/api/payments/create-order/route.ts`
- Create: `src/app/api/payments/webhook/route.ts`
- Create: `src/app/api/__tests__/providers.test.ts`

- [ ] **Step 8.1: Write failing test for providers search route**

Create `src/app/api/__tests__/providers.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
    })),
  })),
}))

vi.mock('@/lib/upstash', () => ({
  apiRatelimit: { limit: vi.fn().mockResolvedValue({ success: true }) },
}))

describe('GET /api/providers', () => {
  it('returns 200 with empty results', async () => {
    const { GET } = await import('../providers/route')
    const req = new Request('http://localhost/api/providers?city=Mumbai')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('providers')
    expect(Array.isArray(body.providers)).toBe(true)
  })
})
```

- [ ] **Step 8.2: Run test to verify it fails**

```bash
npm test src/app/api/__tests__/providers.test.ts
```
Expected: FAIL — route file not found.

- [ ] **Step 8.3: Create `src/app/api/providers/route.ts`**

```typescript
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { searchFiltersSchema } from '@/lib/validations/search'
import { apiRatelimit } from '@/lib/upstash'
import type { SearchResponse } from '@/app/api/contracts'

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
  const { success } = await apiRatelimit.limit(ip)
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const params = Object.fromEntries(request.nextUrl.searchParams)
  const parsed = searchFiltersSchema.safeParse(params)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { query, city, specialty_id, insurance_id, visit_type, min_rating, max_fee_inr, page, limit } = parsed.data
  const supabase = await createClient()

  let q = supabase
    .from('providers')
    .select(`
      id, slug, title, bio, experience_years, consultation_fee_inr,
      rating_avg, rating_count,
      users!inner (full_name, avatar_url),
      specialties:specialty_ids,
      locations (id, city, state, visit_type),
      provider_insurances (insurance_id)
    `, { count: 'exact' })
    .eq('verified', true)
    .eq('active', true)

  if (city) q = q.eq('locations.city', city)
  if (min_rating) q = q.gte('rating_avg', min_rating)
  if (max_fee_inr) q = q.lte('consultation_fee_inr', max_fee_inr)

  const from = (page - 1) * limit
  const { data, error, count } = await q.range(from, from + limit - 1).order('rating_avg', { ascending: false })

  if (error) {
    console.error('[api/providers] Supabase error:', error)
    return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 })
  }

  const response: SearchResponse = {
    providers: (data ?? []) as unknown as SearchResponse['providers'],
    total: count ?? 0,
    page,
    limit,
  }

  return NextResponse.json(response)
}
```

- [ ] **Step 8.4: Run test to verify it passes**

```bash
npm test src/app/api/__tests__/providers.test.ts
```
Expected: PASS

- [ ] **Step 8.5: Create `src/app/api/providers/[id]/route.ts`**

```typescript
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('providers')
    .select(`
      *,
      users!inner (full_name, avatar_url, phone),
      locations (*),
      provider_insurances (insurances (*)),
      reviews (id, rating, comment, patient_id, created_at, is_published)
    `)
    .eq('id', id)
    .eq('verified', true)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}
```

- [ ] **Step 8.6: Create `src/app/api/providers/[id]/availability/route.ts`**

```typescript
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const querySchema = z.object({
  from: z.string().datetime({ offset: true }),
  to: z.string().datetime({ offset: true }),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid date range' }, { status: 400 })

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('availabilities')
    .select('id, starts_at, ends_at, slot_duration_mins, location_id')
    .eq('provider_id', id)
    .eq('is_booked', false)
    .eq('is_blocked', false)
    .gte('starts_at', parsed.data.from)
    .lte('starts_at', parsed.data.to)
    .order('starts_at')

  if (error) return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 })
  return NextResponse.json({ slots: data ?? [] })
}
```

- [ ] **Step 8.7: Create appointments route**

Create `src/app/api/appointments/route.ts`:
```typescript
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAppointmentSchema } from '@/lib/validations/booking'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = createAppointmentSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { provider_id, availability_id, location_id, visit_type, insurance_id, notes } = parsed.data

  // Fetch slot and fee in one query
  const { data: slot } = await supabase
    .from('availabilities')
    .select('id, is_booked, providers!inner (consultation_fee_inr)')
    .eq('id', availability_id)
    .eq('is_booked', false)
    .single()

  if (!slot) return NextResponse.json({ error: 'Slot unavailable' }, { status: 409 })

  const feeInr = (slot.providers as unknown as { consultation_fee_inr: number }).consultation_fee_inr

  const { data: appointment, error } = await supabase
    .from('appointments')
    .insert({
      patient_id: user.id,
      provider_id,
      availability_id,
      location_id: location_id ?? null,
      visit_type,
      status: 'pending',
      insurance_id: insurance_id ?? null,
      fee_inr: feeInr,
      notes: notes ?? null,
    })
    .select()
    .single()

  if (error) {
    console.error('[api/appointments] Insert error:', error)
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 })
  }

  return NextResponse.json(appointment, { status: 201 })
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('appointments')
    .select('*, availabilities (*), locations (*), providers (*, users!inner (full_name, avatar_url))')
    .eq('patient_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
  return NextResponse.json({ appointments: data ?? [] })
}
```

- [ ] **Step 8.8: Create payments routes**

Create `src/app/api/payments/create-order/route.ts`:
```typescript
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createOrderSchema } from '@/lib/validations/payment'
import { createOrder, calculateGst } from '@/lib/razorpay'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = createOrderSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data: appointment } = await supabase
    .from('appointments')
    .select('id, fee_inr, status')
    .eq('id', parsed.data.appointment_id)
    .eq('patient_id', user.id)
    .single()

  if (!appointment) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
  if (appointment.status !== 'pending') return NextResponse.json({ error: 'Appointment already paid' }, { status: 409 })

  const gstAmount = calculateGst(appointment.fee_inr)
  const totalAmount = appointment.fee_inr + gstAmount

  const order = await createOrder(totalAmount, appointment.id)

  const { data: payment, error } = await supabase
    .from('payments')
    .insert({
      appointment_id: appointment.id,
      razorpay_order_id: order.id,
      amount_inr: totalAmount,
      gst_amount_inr: gstAmount,
      status: 'created',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to create payment record' }, { status: 500 })

  return NextResponse.json({
    payment,
    razorpay_order_id: order.id,
    amount_paise: totalAmount * 100,
    key_id: process.env.RAZORPAY_KEY_ID,
  })
}
```

Create `src/app/api/payments/webhook/route.ts`:
```typescript
import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { verifyWebhookSignature } from '@/lib/razorpay'
import { razorpayWebhookSchema } from '@/lib/validations/payment'
import { sendBookingConfirmation } from '@/lib/resend'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('x-razorpay-signature') ?? ''

  if (!verifyWebhookSignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const parsed = razorpayWebhookSchema.safeParse(JSON.parse(body))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  const { event, payload } = parsed.data

  if (event === 'payment.captured' && payload.payment) {
    const { id: paymentId, order_id: orderId } = payload.payment.entity

    // Update payment status
    const { data: payment } = await supabaseAdmin
      .from('payments')
      .update({ status: 'paid', razorpay_payment_id: paymentId })
      .eq('razorpay_order_id', orderId)
      .select('appointment_id')
      .single()

    if (payment) {
      // Confirm appointment + mark slot booked
      const { data: appointment } = await supabaseAdmin
        .from('appointments')
        .update({ status: 'confirmed' })
        .eq('id', payment.appointment_id)
        .select('*, availabilities (starts_at, ends_at), users!patient_id (full_name, phone), providers!inner (users!inner (full_name))')
        .single()

      if (appointment) {
        await supabaseAdmin
          .from('availabilities')
          .update({ is_booked: true })
          .eq('id', (appointment as unknown as { availability_id: string }).availability_id)

        // Send confirmation email (best-effort, don't fail webhook)
        try {
          const appt = appointment as unknown as {
            patient_id: string
            users: { full_name: string }
            providers: { users: { full_name: string } }
            availabilities: { starts_at: string }
            fee_inr: number
            visit_type: string
          }

          // Fetch patient email from auth.users (service role required)
          const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(appt.patient_id)
          const patientEmail = authUser?.user?.email

          if (patientEmail) {
            await sendBookingConfirmation({
              to: patientEmail,
              patientName: appt.users.full_name,
              providerName: appt.providers.users.full_name,
              appointmentDate: new Date(appt.availabilities.starts_at).toLocaleDateString('en-IN'),
              appointmentTime: new Date(appt.availabilities.starts_at).toLocaleTimeString('en-IN'),
              visitType: appt.visit_type,
              amountInr: appt.fee_inr,
            })
          }
        } catch (e) {
          console.error('[webhook] Email send failed:', e)
        }
      }
    }
  }

  return NextResponse.json({ received: true })
}
```

- [ ] **Step 8.9: Create `src/app/api/providers/[id]/reviews/route.ts`**

```typescript
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid pagination params' }, { status: 400 })

  const { page, limit } = parsed.data
  const from = (page - 1) * limit

  const supabase = await createClient()
  const { data, error, count } = await supabase
    .from('reviews')
    .select('id, rating, comment, provider_reply, created_at, users!patient_id (full_name, avatar_url)', { count: 'exact' })
    .eq('provider_id', id)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1)

  if (error) return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  return NextResponse.json({ reviews: data ?? [], total: count ?? 0, page, limit })
}
```

- [ ] **Step 8.10: Create `src/app/api/appointments/[id]/route.ts`**

```typescript
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cancelAppointmentSchema } from '@/lib/validations/booking'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('appointments')
    .select('*, availabilities (*), locations (*), providers (*, users!inner (full_name, avatar_url))')
    .eq('id', id)
    .or(`patient_id.eq.${user.id},provider_id.eq.${user.id}`)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  // Only cancellation is supported via PATCH
  if (body.action !== 'cancel') return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  const parsed = cancelAppointmentSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data: appt } = await supabase
    .from('appointments')
    .select('id, status, patient_id, availability_id')
    .eq('id', id)
    .eq('patient_id', user.id)
    .single()

  if (!appt) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
  if (!['pending', 'confirmed'].includes(appt.status)) {
    return NextResponse.json({ error: 'Appointment cannot be cancelled' }, { status: 409 })
  }

  const { data, error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to cancel appointment' }, { status: 500 })

  // Free up the slot
  await supabase.from('availabilities').update({ is_booked: false }).eq('id', appt.availability_id)

  return NextResponse.json(data)
}
```

- [ ] **Step 8.11: Create `src/app/api/payments/refund/route.ts`**

```typescript
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { razorpay } from '@/lib/razorpay'
import { z } from 'zod'

const refundSchema = z.object({
  appointment_id: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = refundSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { appointment_id } = parsed.data

  // Verify appointment belongs to patient and is cancelled
  const { data: appt } = await supabase
    .from('appointments')
    .select('id, status, patient_id')
    .eq('id', appointment_id)
    .eq('patient_id', user.id)
    .eq('status', 'cancelled')
    .single()

  if (!appt) return NextResponse.json({ error: 'Cancelled appointment not found' }, { status: 404 })

  // Fetch the paid payment record
  const { data: payment } = await supabase
    .from('payments')
    .select('id, razorpay_payment_id, amount_inr, status')
    .eq('appointment_id', appointment_id)
    .eq('status', 'paid')
    .single()

  if (!payment || !payment.razorpay_payment_id) {
    return NextResponse.json({ error: 'No paid payment found for this appointment' }, { status: 404 })
  }

  // Initiate Razorpay refund (full amount, in paise)
  const refund = await razorpay.payments.refund(payment.razorpay_payment_id, {
    amount: payment.amount_inr * 100,
    speed: 'normal',
    notes: { appointment_id },
  })

  const { error } = await supabaseAdmin
    .from('payments')
    .update({ status: 'refunded', refund_id: refund.id })
    .eq('id', payment.id)

  if (error) {
    console.error('[refund] Failed to update payment record:', error)
    // Refund was issued — log but don't fail
  }

  return NextResponse.json({ refund_id: refund.id, status: 'refunded' })
}
```

- [ ] **Step 8.12: Commit**

```bash
rtk git add src/app/api/
rtk git commit -m "feat: implement core API routes — providers, appointments, payments webhook, reviews, refund"
```

---

## Task 9: Auth API Routes

**Files:**
- Create: `src/app/api/auth/signup/route.ts`
- Create: `src/app/api/auth/otp/send/route.ts`
- Create: `src/app/api/auth/otp/verify/route.ts`

- [ ] **Step 9.1: Create signup route**

Create `src/app/api/auth/signup/route.ts`:
```typescript
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { signupPatientSchema, signupProviderSchema } from '@/lib/validations/auth'
import { otpRatelimit } from '@/lib/upstash'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
  const { success } = await otpRatelimit.limit(ip)
  if (!success) return NextResponse.json({ error: 'Too many signup attempts' }, { status: 429 })

  const body = await request.json()
  const role = body.role === 'provider' ? 'provider' : 'patient'
  const schema = role === 'provider' ? signupProviderSchema : signupPatientSchema
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const supabase = await createClient()
  const { email, password, full_name, phone, ...meta } = parsed.data as {
    email: string; password: string; full_name: string; phone: string; [key: string]: unknown
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    phone,
    options: {
      data: { role, full_name, phone, ...meta },
    },
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ user: data.user }, { status: 201 })
}
```

- [ ] **Step 9.2: Create OTP routes**

Create `src/app/api/auth/otp/send/route.ts`:
```typescript
import { NextResponse, type NextRequest } from 'next/server'
import { sendOtp } from '@/lib/msg91'
import { otpSendSchema } from '@/lib/validations/auth'
import { otpRatelimit } from '@/lib/upstash'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = otpSendSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { phone } = parsed.data
  const { success } = await otpRatelimit.limit(phone)
  if (!success) return NextResponse.json({ error: 'Too many OTP requests. Try again in 10 minutes.' }, { status: 429 })

  const result = await sendOtp(phone)
  if (!result.success) return NextResponse.json({ error: result.error ?? 'Failed to send OTP' }, { status: 500 })

  return NextResponse.json({ message: 'OTP sent' })
}
```

Create `src/app/api/auth/otp/verify/route.ts`:
```typescript
import { NextResponse, type NextRequest } from 'next/server'
import { verifyOtp } from '@/lib/msg91'
import { otpVerifySchema } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = otpVerifySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { phone, otp } = parsed.data
  const result = await verifyOtp(phone, otp)
  if (!result.success) return NextResponse.json({ error: result.error ?? 'Invalid OTP' }, { status: 400 })

  // Sign in with Supabase phone OTP
  const supabase = await createClient()
  const { data, error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ user: data.user })
}
```

- [ ] **Step 9.3: Commit**

```bash
rtk git add src/app/api/auth/
rtk git commit -m "feat: add auth API routes — signup, OTP send/verify with rate limiting"
```

---

## Task 10: Additional API Routes (Telehealth, Reviews, Notifications, Upload, Admin)

**Files:**
- Create: `src/app/api/telehealth/room/route.ts`
- Create: `src/app/api/reviews/route.ts`
- Create: `src/app/api/notifications/route.ts`
- Create: `src/app/api/notifications/[id]/read/route.ts`
- Create: `src/app/api/upload/route.ts`
- Create: `src/app/api/admin/users/route.ts`
- Create: `src/app/api/admin/listings/route.ts`

- [ ] **Step 10.1: Create telehealth room route**

Create `src/app/api/telehealth/room/route.ts`:
```typescript
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createTelehealthRoom } from '@/lib/hundredms'
import { z } from 'zod'

const schema = z.object({ appointment_id: z.string().uuid() })

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { appointment_id } = parsed.data

  const { data: appt } = await supabase
    .from('appointments')
    .select('id, visit_type, status, patient_id, provider_id, telehealth_room_id')
    .eq('id', appointment_id)
    .single()

  if (!appt) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
  if (appt.visit_type !== 'online') return NextResponse.json({ error: 'Not a telehealth appointment' }, { status: 400 })
  if (appt.status !== 'confirmed') return NextResponse.json({ error: 'Appointment not confirmed' }, { status: 409 })
  if (appt.patient_id !== user.id && appt.provider_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Reuse existing room if already created
  if (appt.telehealth_room_id) {
    return NextResponse.json({ room_id: appt.telehealth_room_id })
  }

  const roomId = await createTelehealthRoom(appointment_id)
  await supabase.from('appointments').update({ telehealth_room_id: roomId }).eq('id', appointment_id)

  return NextResponse.json({ room_id: roomId })
}
```

- [ ] **Step 10.2: Create reviews route**

Create `src/app/api/reviews/route.ts`:
```typescript
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createReviewSchema } from '@/lib/validations/review'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = createReviewSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { appointment_id, rating, comment } = parsed.data

  // Verify appointment belongs to this patient and is completed
  const { data: appt } = await supabase
    .from('appointments')
    .select('id, patient_id, provider_id, status')
    .eq('id', appointment_id)
    .eq('patient_id', user.id)
    .eq('status', 'completed')
    .single()

  if (!appt) return NextResponse.json({ error: 'Appointment not found or not completed' }, { status: 404 })

  const { data, error } = await supabase
    .from('reviews')
    .insert({ appointment_id, patient_id: user.id, provider_id: appt.provider_id, rating, comment: comment ?? null })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Review already submitted' }, { status: 409 })
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
```

- [ ] **Step 10.3: Create notifications routes**

Create `src/app/api/notifications/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return NextResponse.json({ notifications: data ?? [] })
}
```

Create `src/app/api/notifications/[id]/read/route.ts`:
```typescript
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await supabase.from('notifications').update({ read: true }).eq('id', id).eq('user_id', user.id)
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 10.4: Create document upload route**

Create `src/app/api/upload/route.ts`:
```typescript
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { z } from 'zod'

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']
const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

const metaSchema = z.object({
  type: z.enum(['degree', 'registration', 'id_proof', 'photo']),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const typeMeta = metaSchema.safeParse({ type: formData.get('type') })

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (!typeMeta.success) return NextResponse.json({ error: 'Invalid document type' }, { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: 'Only PDF, JPG, and PNG files are allowed' }, { status: 415 })
  if (file.size > MAX_SIZE_BYTES) return NextResponse.json({ error: 'File must be under 10MB' }, { status: 413 })

  const ext = file.name.split('.').pop()
  const storagePath = `providers/${user.id}/${typeMeta.data.type}-${Date.now()}.${ext}`

  const buffer = Buffer.from(await file.arrayBuffer())
  const { error: uploadError } = await supabaseAdmin.storage
    .from('credentials')
    .upload(storagePath, buffer, { contentType: file.type, upsert: false })

  if (uploadError) return NextResponse.json({ error: 'Upload failed' }, { status: 500 })

  const { data, error } = await supabase
    .from('documents')
    .insert({ provider_id: user.id, type: typeMeta.data.type, storage_path: storagePath })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to record document' }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}
```

- [ ] **Step 10.5: Create admin routes**

Create `src/app/api/admin/users/route.ts`:
```typescript
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('users').select('role').eq('id', user.id).single()
  return data?.role === 'admin' ? user : null
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const admin = await requireAdmin(supabase)
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const page = Number(request.nextUrl.searchParams.get('page') ?? '1')
  const limit = 50
  const from = (page - 1) * limit

  const { data, count } = await supabaseAdmin
    .from('users')
    .select('*', { count: 'exact' })
    .range(from, from + limit - 1)
    .order('created_at', { ascending: false })

  return NextResponse.json({ users: data ?? [], total: count ?? 0, page, limit })
}
```

Create `src/app/api/admin/listings/route.ts`:
```typescript
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { z } from 'zod'

const approveSchema = z.object({
  provider_id: z.string().uuid(),
  approved: z.boolean(),
})

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('users').select('role').eq('id', user.id).single()
  return data?.role === 'admin' ? user : null
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  if (!await requireAdmin(supabase)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data } = await supabaseAdmin
    .from('providers')
    .select('*, users!inner (full_name, phone), documents (*)')
    .eq('verified', false)
    .order('created_at')

  return NextResponse.json({ listings: data ?? [] })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  if (!await requireAdmin(supabase)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const parsed = approveSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { provider_id, approved } = parsed.data
  const { error } = await supabaseAdmin
    .from('providers')
    .update({ verified: approved, active: approved })
    .eq('id', provider_id)

  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 10.6: Commit**

```bash
rtk git add src/app/api/telehealth/ src/app/api/reviews/ src/app/api/notifications/ src/app/api/upload/ src/app/api/admin/
rtk git commit -m "feat: add telehealth, reviews, notifications, upload, and admin API routes"
```

---

## Task 11: Final Verification

- [ ] **Step 11.1: Run full type check**

```bash
npm run type-check
```
Expected: Zero TypeScript errors.

- [ ] **Step 11.2: Run all tests**

```bash
npm test
```
Expected: All tests pass.

- [ ] **Step 11.3: Verify build compiles**

```bash
npm run build
```
Expected: Build completes without errors. (Note: some pages may show build warnings about missing env vars — this is expected in local dev without `.env` filled in.)

- [ ] **Step 11.4: Update EXECUTION-PLAN.md**

Mark Phase 0 complete in `docs/planning/EXECUTION-PLAN.md`:
```markdown
## PHASE 0 — Project Setup
- [x] Define tech stack (frontend framework, backend, DB)
- [x] Scaffold project structure
- [x] Configure TypeScript, ESLint, Prettier
- [x] Set up Vitest / testing infrastructure
- [ ] Configure GitHub Actions CI/CD
- [x] Set up environment variables
```

- [ ] **Step 11.5: Final commit**

```bash
rtk git add docs/planning/EXECUTION-PLAN.md
rtk git commit -m "chore: mark Phase 0 complete in execution plan"
```

---

## Summary

After completing this plan, the project will have:

1. **Scaffolded Next.js 15 project** with full tooling (TypeScript strict, Tailwind v4 + Zocdoc tokens, Vitest)
2. **Supabase database** — 14 tables, RLS policies, performance indexes, seed data
3. **All external service clients** — Razorpay, Resend, MSG91, Mapbox, 100ms, Upstash
4. **Zod validation schemas** for every API input boundary
5. **API contracts** published to `src/app/api/contracts/` — UI agents can start building immediately
6. **20 API routes** covering providers, appointments, payments, auth, telehealth, reviews, notifications, uploads, admin
7. **Auth middleware** protecting all portal routes

**Next plans (after this):**
- `2026-03-28-public-portal.md` — Public portal + auth pages (bp-ui-public)
- `2026-03-28-patient-portal.md` — Patient dashboard (bp-ui-patient)
- `2026-03-28-provider-portal.md` — Provider portal (bp-ui-provider)
- `2026-03-28-admin-portal.md` — Admin panel (bp-ui-admin)
