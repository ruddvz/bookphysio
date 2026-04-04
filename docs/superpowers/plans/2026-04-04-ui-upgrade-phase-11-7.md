# UI Upgrade Phase 11.7 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the hero viewport/clip bugs, add FeaturedDoctors grid + DoctorCard photo support, wire provider profile photo upload + form, and fix patient/provider/admin dashboard bugs.

**Architecture:** Four independent sequential changes, each committed separately. No new tables required — `avatar_url` already exists in `providers` and is already returned by `/api/providers`. The hero fix is pure CSS. The profile upload uses Supabase Storage (`avatars` bucket, path `providers/{userId}.jpg`) with Canvas API resize client-side.

**Tech Stack:** Next.js 15 App Router, React 19, Tailwind CSS v4 (using `var(--color-bp-*)` tokens), Supabase Storage, `next/image` (unoptimized mode already set in `next.config.ts`), Lucide icons, SWR (already used in search)

---

## File Map

| File | Change |
|------|--------|
| `src/components/HeroSection.tsx` | Hero viewport + font + overflow fix |
| `src/components/DoctorCard.tsx` | Add `avatarUrl` to `Doctor` interface + photo render |
| `src/components/FeaturedDoctors.tsx` | **NEW** — featured grid above search results |
| `src/app/search/SearchContent.tsx` | Mount `FeaturedDoctors` above DoctorCard list; pass `avatarUrl` in `providerToDoctor` |
| `src/app/provider/profile/page.tsx` | Wire avatar upload + form GET/PATCH |
| `src/app/api/profile/route.ts` | **NEW** (or extend existing) — GET + PATCH provider profile |
| `src/app/doctor/[id]/page.tsx` | Already has avatar + `notFound()` — add `loading.tsx` skeleton + verify sticky CTA |
| `src/app/doctor/[id]/loading.tsx` | **NEW** — Suspense skeleton for doctor profile page |
| `src/app/patient/dashboard/page.tsx` | Dedupe fetch, remove console.error, unhardcode 72%, SSR guard |
| `src/app/provider/dashboard/page.tsx` | Wire tabs, unhardcode earnings, wire checklist, remove console.error |
| `src/app/admin/page.tsx` | Dynamic queue count, illustrative label, ₹ icon, "View all" link |

> **Note on `next.config.ts`:** `images: { unoptimized: true }` is already set — Supabase Storage URLs will load without additional remote pattern config. No change needed.

> **`SearchResponse` location:** `src/app/api/contracts/search.ts` — confirmed to exist with `providers: ProviderCard[]` shape.

---

## Task 1: Hero Fix

**Files:**
- Modify: `src/components/HeroSection.tsx:122-140`

### Problem lines (reference before editing)
- Line 122: `<section className="relative overflow-hidden ...">` — `overflow-hidden` clips animated word
- Line 124: `min-h-[calc(100vh-5rem)]` — breaks in PWA standalone
- Line 133: `text-[54px] ... md:text-[82px] lg:text-[96px]` — wraps on tablets

- [ ] **Step 1: Write the test (visual regression check)**

Create `src/components/__tests__/HeroSection.test.tsx`:

```tsx
import { render } from '@testing-library/react'
import HeroSection from '../HeroSection'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

describe('HeroSection', () => {
  it('renders the search bar', () => {
    const { getByPlaceholderText } = render(<HeroSection />)
    expect(getByPlaceholderText('Search by condition or injury')).toBeTruthy()
  })

  it('does not have overflow-hidden on the outer section', () => {
    const { container } = render(<HeroSection />)
    const section = container.querySelector('section[aria-label="Hero"]')
    expect(section?.className).not.toContain('overflow-hidden')
  })

  it('uses min-h-[100svh] not calc(100vh-5rem)', () => {
    const { container } = render(<HeroSection />)
    const shell = container.querySelector('.bp-shell')
    expect(shell?.className).toContain('min-h-[100svh]')
    expect(shell?.className).not.toContain('calc(100vh')
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
rtk npm test -- --testPathPattern=HeroSection --watchAll=false
```

Expected: FAIL (overflow-hidden present, min-h-[100svh] absent)

- [ ] **Step 3: Apply the hero fixes**

In `src/components/HeroSection.tsx`, make these three targeted changes:

**Change 1** — Remove `overflow-hidden` from `<section>`, add `pb-[env(safe-area-inset-bottom)]`:
```tsx
// BEFORE (line 122):
<section className="relative overflow-hidden border-b border-bp-border bg-bp-surface/40" aria-label="Hero">

// AFTER:
<section className="relative border-b border-bp-border bg-bp-surface/40 pb-[env(safe-area-inset-bottom)]" aria-label="Hero">
```

**Change 2** — Replace `min-h-[calc(100vh-5rem)]` with `min-h-[100svh]` on the `.bp-shell` div:
```tsx
// BEFORE (line 124):
<div className="bp-shell relative flex min-h-[calc(100vh-5rem)] flex-col justify-center py-16 md:py-24 lg:py-32">

// AFTER:
<div className="bp-shell relative flex min-h-[100svh] flex-col justify-center py-16 md:py-24 lg:py-32">
```

**Change 3** — Replace fixed breakpoint sizes with `clamp()` on `<h1>` (line 133):
```tsx
// BEFORE:
<h1 className="mx-auto max-w-4xl text-[54px] font-bold leading-[1.02] tracking-[-0.05em] text-bp-primary md:text-[82px] lg:text-[96px]">

// AFTER:
<h1 className="mx-auto max-w-4xl text-[clamp(2.4rem,7vw,5.5rem)] font-bold leading-[1.02] tracking-[-0.05em] text-bp-primary">
```

**Change 4** — The animated word `<span>` at line 135 already has `overflow-hidden` on it — confirm it's there, if not add it:
```tsx
// Confirm line 135 has overflow-hidden on the inner span:
<span className="relative inline-flex min-h-[1.05em] items-end overflow-hidden align-baseline pb-[0.06em] text-bp-accent">
```
(Already present — no change needed here.)

- [ ] **Step 4: Run test — expect PASS**

```bash
rtk npm test -- --testPathPattern=HeroSection --watchAll=false
```

Expected: PASS

- [ ] **Step 5: Build check**

```bash
rtk npm run build
```

Expected: zero TypeScript errors

- [ ] **Step 6: Commit**

```bash
rtk git add src/components/HeroSection.tsx src/components/__tests__/HeroSection.test.tsx
rtk git commit -m "fix: hero viewport — 100svh, clamp type, overflow-hidden to span only"
```

---

## Task 2: DoctorCard Photo Support

**Files:**
- Modify: `src/components/DoctorCard.tsx:19-35` (Doctor interface), `:140-148` (avatar slot)

The `Doctor` interface at line 19 needs `avatarUrl`. The avatar div at line 141 (`h-24 w-24 rounded-[24px]`) gets an `Image` when the URL is present.

- [ ] **Step 1: Write the test**

Create `src/components/__tests__/DoctorCard.test.tsx`:

```tsx
import { render } from '@testing-library/react'
import DoctorCard, { type Doctor } from '../DoctorCard'

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))
jest.mock('next/image', () => ({ __esModule: true, default: (props: Record<string, unknown>) => <img {...props} /> }))

const baseDoctor: Doctor = {
  id: 'test-1',
  name: 'Dr. Ravi Kumar',
  credentials: 'BPT',
  specialty: 'Sports Physio',
  rating: 4.9,
  reviewCount: 120,
  location: 'Mumbai',
  distance: '2 km',
  nextSlot: 'Today 4PM',
  visitTypes: ['In-clinic'],
  fee: 600,
  icpVerified: true,
}

describe('DoctorCard', () => {
  it('shows initials when no avatarUrl', () => {
    const { getByText } = render(<DoctorCard doctor={baseDoctor} />)
    expect(getByText('RK')).toBeTruthy()
  })

  it('shows next/image when avatarUrl is provided', () => {
    const doctor = { ...baseDoctor, avatarUrl: 'https://example.com/photo.jpg' }
    const { container } = render(<DoctorCard doctor={doctor} />)
    const img = container.querySelector('img[src="https://example.com/photo.jpg"]')
    expect(img).toBeTruthy()
  })

  it('does not render img when avatarUrl is null', () => {
    const doctor = { ...baseDoctor, avatarUrl: null }
    const { container } = render(<DoctorCard doctor={doctor} />)
    const img = container.querySelector('img[src="null"]')
    expect(img).toBeNull()
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
rtk npm test -- --testPathPattern=DoctorCard --watchAll=false
```

Expected: FAIL (avatarUrl not in interface)

- [ ] **Step 3: Add avatarUrl to Doctor interface and render photo**

In `src/components/DoctorCard.tsx`:

**Change 1** — Add `avatarUrl` to the `Doctor` interface after `icpVerified` (line ~34):
```tsx
export interface Doctor {
  id: string
  name: string
  credentials: string
  specialty: string
  rating: number
  reviewCount: number
  location: string
  distance: string
  nextSlot: string
  visitTypes: string[]
  fee: number
  icpVerified: boolean
  avatarUrl?: string | null   // ← add this
  isLive?: boolean
  lat?: number | null
  lng?: number | null
}
```

**Change 2** — Replace the initials div at line 141 with a photo-or-initials block. Add `import Image from 'next/image'` at the top. Replace:
```tsx
<div className="flex h-24 w-24 items-center justify-center rounded-[24px] bg-bp-accent/10 text-[28px] font-semibold text-bp-primary shadow-[0_18px_35px_-28px_rgba(24,49,45,0.28)]">
  {initials}
</div>
```
With:
```tsx
{doctor.avatarUrl ? (
  <div className="relative h-24 w-24 rounded-[24px] overflow-hidden shadow-[0_18px_35px_-28px_rgba(24,49,45,0.28)]">
    <Image
      src={doctor.avatarUrl}
      alt={doctor.name}
      fill
      className="object-cover"
      sizes="96px"
    />
  </div>
) : (
  <div className="flex h-24 w-24 items-center justify-center rounded-[24px] bg-bp-accent/10 text-[28px] font-semibold text-bp-primary shadow-[0_18px_35px_-28px_rgba(24,49,45,0.28)]">
    {initials}
  </div>
)}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
rtk npm test -- --testPathPattern=DoctorCard --watchAll=false
```

- [ ] **Step 5: Pass avatarUrl in SearchContent**

In `src/app/search/SearchContent.tsx`, in the `providerToDoctor` function (~line 78), add `avatarUrl` to the returned object:
```tsx
function providerToDoctor(p: ProviderCard): Doctor {
  const nameWithTitle = p.full_name.startsWith('Dr.') ? p.full_name : `Dr. ${p.full_name}`
  return {
    id: p.id,
    name: nameWithTitle,
    credentials: p.specialties.map((s) => s.name).join(', ') || 'BPT',
    specialty: p.specialties[0]?.name ?? 'Physiotherapist',
    rating: p.rating_avg ?? 0,
    reviewCount: p.rating_count ?? 0,
    location: p.city ?? 'India',
    lat: p.lat,
    lng: p.lng,
    distance: p.distance ?? '',
    isLive: !!p.next_available_slot,
    nextSlot: p.next_available_slot
      ? new Date(p.next_available_slot).toLocaleString('en-IN', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Check availability',
    visitTypes: (p.visit_types ?? []).map((v) => VISIT_TYPE_LABELS[v] ?? v),
    fee: p.consultation_fee_inr ?? 0,
    icpVerified: p.verified,
    avatarUrl: p.avatar_url,   // ← add this line
  }
}
```

(`ProviderCard` already has `avatar_url: string | null` in the contract — no API change needed.)

- [ ] **Step 6: Build check**

```bash
rtk npm run build
```

- [ ] **Step 7: Commit**

```bash
rtk git add src/components/DoctorCard.tsx src/components/__tests__/DoctorCard.test.tsx src/app/search/SearchContent.tsx
rtk git commit -m "feat: DoctorCard photo support — avatarUrl with initials fallback"
```

---

## Task 3: FeaturedDoctors Grid

**Files:**
- Create: `src/components/FeaturedDoctors.tsx`
- Create: `src/components/__tests__/FeaturedDoctors.test.tsx`
- Modify: `src/app/search/SearchContent.tsx` (mount FeaturedDoctors above list)

`ProviderCard` already has `avatar_url`, `rating_avg`, `specialties`, `id`. The `/api/providers` route already returns this shape. We'll call it with `?sort=rating&limit=4`. The route already supports the `limit` query param (via `searchFiltersSchema`).

- [ ] **Step 1: Verify /api/providers accepts sort=rating**

```bash
rtk curl "http://localhost:3000/api/providers?limit=4"
```

If the route doesn't support `sort=rating` yet, the component fetches `?limit=4` and sorts client-side (by `rating_avg` descending) — acceptable since we only need 4 cards.

- [ ] **Step 2: Write the test**

Create `src/components/__tests__/FeaturedDoctors.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import FeaturedDoctors from '../FeaturedDoctors'
import type { ProviderCard } from '@/app/api/contracts/provider'

jest.mock('next/image', () => ({ __esModule: true, default: (props: Record<string, unknown>) => <img {...props} /> }))
jest.mock('next/link', () => ({ __esModule: true, default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }))
jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn(),
}))

import useSWR from 'swr'

const mockProviders: ProviderCard[] = [
  {
    id: '1', slug: 'dr-ravi', full_name: 'Dr. Ravi Kumar', title: 'Dr.', avatar_url: null,
    verified: true, specialties: [{ id: 's1', name: 'Sports Physio', slug: 'sports', icon_url: null }],
    rating_avg: 4.9, rating_count: 120, experience_years: 8,
    consultation_fee_inr: 600, next_available_slot: null,
    visit_types: ['in_clinic'], city: 'Mumbai', lat: null, lng: null,
  },
  {
    id: '2', slug: 'dr-priya', full_name: 'Dr. Priya Menon', title: 'Dr.', avatar_url: 'https://example.com/priya.jpg',
    verified: true, specialties: [{ id: 's2', name: 'Neuro Rehab', slug: 'neuro', icon_url: null }],
    rating_avg: 4.8, rating_count: 89, experience_years: 5,
    consultation_fee_inr: 700, next_available_slot: null,
    visit_types: ['home_visit'], city: 'Delhi', lat: null, lng: null,
  },
]

describe('FeaturedDoctors', () => {
  it('renders section heading', () => {
    (useSWR as jest.Mock).mockReturnValue({ data: { providers: mockProviders }, isLoading: false })
    render(<FeaturedDoctors />)
    expect(screen.getByText('Featured Physiotherapists')).toBeTruthy()
  })

  it('renders doctor names', () => {
    (useSWR as jest.Mock).mockReturnValue({ data: { providers: mockProviders }, isLoading: false })
    render(<FeaturedDoctors />)
    expect(screen.getByText('Dr. Ravi Kumar')).toBeTruthy()
    expect(screen.getByText('Dr. Priya Menon')).toBeTruthy()
  })

  it('renders photo when avatarUrl provided', () => {
    (useSWR as jest.Mock).mockReturnValue({ data: { providers: mockProviders }, isLoading: false })
    const { container } = render(<FeaturedDoctors />)
    const img = container.querySelector('img[src="https://example.com/priya.jpg"]')
    expect(img).toBeTruthy()
  })

  it('shows initials when no avatar', () => {
    (useSWR as jest.Mock).mockReturnValue({ data: { providers: mockProviders }, isLoading: false })
    render(<FeaturedDoctors />)
    expect(screen.getByText('RK')).toBeTruthy()
  })

  it('shows skeleton when loading', () => {
    (useSWR as jest.Mock).mockReturnValue({ data: undefined, isLoading: true })
    const { container } = render(<FeaturedDoctors />)
    const skeletons = container.querySelectorAll('[data-testid="featured-skeleton"]')
    expect(skeletons.length).toBe(4)
  })
})
```

- [ ] **Step 3: Run test — expect FAIL**

```bash
rtk npm test -- --testPathPattern=FeaturedDoctors --watchAll=false
```

- [ ] **Step 4: Create FeaturedDoctors component**

Create `src/components/FeaturedDoctors.tsx`:

```tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import useSWR from 'swr'
import { Star } from 'lucide-react'
import type { ProviderCard } from '@/app/api/contracts/provider'
import type { SearchResponse } from '@/app/api/contracts/search'

async function fetcher(url: string): Promise<SearchResponse> {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch featured providers')
  return res.json() as Promise<SearchResponse>
}

function getInitials(name: string): string {
  return name
    .replace(/^Dr\.\s*/, '')
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase()
}

function FeaturedSkeleton() {
  return (
    <div
      data-testid="featured-skeleton"
      className="animate-pulse bg-white rounded-[20px] border border-bp-border p-4 flex items-center gap-3"
    >
      <div className="w-[52px] h-[52px] rounded-[14px] bg-bp-border/40 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-bp-border/40 rounded-full w-3/4" />
        <div className="h-2.5 bg-bp-border/30 rounded-full w-1/2" />
        <div className="h-2.5 bg-bp-border/20 rounded-full w-2/5" />
      </div>
    </div>
  )
}

interface FeaturedCardProps {
  provider: ProviderCard
}

function FeaturedCard({ provider }: FeaturedCardProps) {
  const initials = getInitials(provider.full_name)
  const nameWithTitle = provider.full_name.startsWith('Dr.')
    ? provider.full_name
    : `Dr. ${provider.full_name}`
  const specialty = provider.specialties[0]?.name ?? 'Physiotherapist'

  return (
    <Link
      href={`/doctor/${provider.id}`}
      className="bg-white rounded-[20px] border border-bp-border p-4 flex items-center gap-3 hover:border-bp-accent/30 hover:shadow-md transition-all duration-200 group"
    >
      <div className="relative w-[52px] h-[52px] shrink-0">
        {provider.avatar_url ? (
          <div className="relative w-[52px] h-[52px] rounded-[14px] overflow-hidden">
            <Image
              src={provider.avatar_url}
              alt={nameWithTitle}
              fill
              className="object-cover"
              sizes="52px"
            />
          </div>
        ) : (
          <div className="w-[52px] h-[52px] rounded-[14px] bg-gradient-to-br from-bp-accent to-bp-primary flex items-center justify-center text-white text-[18px] font-black">
            {initials}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-black text-bp-primary truncate group-hover:text-bp-accent transition-colors">
          {nameWithTitle}
        </p>
        <p className="text-[11px] font-bold text-bp-accent mt-0.5 truncate">{specialty}</p>
        <div className="flex items-center gap-1 mt-1">
          <Star size={11} className="fill-[#F59E0B] text-[#F59E0B]" />
          <span className="text-[11px] font-black text-bp-primary">
            {(provider.rating_avg ?? 0).toFixed(1)}
          </span>
          <span className="text-[10px] text-bp-body/40 font-medium">
            ({provider.rating_count ?? 0})
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function FeaturedDoctors() {
  const { data, isLoading } = useSWR<SearchResponse>(
    '/api/providers?limit=4',
    fetcher,
    { revalidateOnFocus: false }
  )

  const providers = (data?.providers ?? [])
    .slice()
    .sort((a, b) => (b.rating_avg ?? 0) - (a.rating_avg ?? 0))
    .slice(0, 4)

  return (
    <div className="mb-8">
      <h2 className="text-[13px] font-black uppercase tracking-[0.2em] text-bp-body/40 mb-4">
        Featured Physiotherapists
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <FeaturedSkeleton key={i} />)
          : providers.map((p) => <FeaturedCard key={p.id} provider={p} />)}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Run test — expect PASS**

```bash
rtk npm test -- --testPathPattern=FeaturedDoctors --watchAll=false
```

- [ ] **Step 6: Mount FeaturedDoctors in SearchContent**

In `src/app/search/SearchContent.tsx`, find where the DoctorCard list is rendered. Add `FeaturedDoctors` above it, inside a conditional: only show when `providers.length > 0` (so it doesn't render on no-results state). Add the import at top:
```tsx
import FeaturedDoctors from '@/components/FeaturedDoctors'
```

Then in the JSX, above the doctors list (find the `{providers.map(...)}` block):
```tsx
{providers.length > 0 && <FeaturedDoctors />}
{providers.map((provider) => (
  // ...existing DoctorCard render
))}
```

- [ ] **Step 7: Build check**

```bash
rtk npm run build
```

- [ ] **Step 8: Commit**

```bash
rtk git add src/components/FeaturedDoctors.tsx src/components/__tests__/FeaturedDoctors.test.tsx src/app/search/SearchContent.tsx
rtk git commit -m "feat: FeaturedDoctors grid above search results with photo + initials fallback"
```

---

## Task 3.5: Public Doctor Profile — loading.tsx Skeleton

**Files:**
- Audit: `src/app/doctor/[id]/page.tsx` (already has avatar, notFound(), sticky CTA — verify these are present)
- Create: `src/app/doctor/[id]/loading.tsx`

The doctor profile page (`src/app/doctor/[id]/page.tsx`) already implements:
- `avatar_url`-based `next/image` with initials fallback (lines 158–184)
- `notFound()` equivalent (returns custom not-found UI at line 72–85)
- `BookingCard` sticky CTA (line 390–396)

The only spec item not yet in place is the `loading.tsx` skeleton. The page already uses `next: { revalidate: 3600 }` which triggers Suspense — `loading.tsx` is the correct slot.

- [ ] **Step 1: Create the loading skeleton**

Create `src/app/doctor/[id]/loading.tsx`:

```tsx
export default function DoctorProfileLoading() {
  return (
    <div className="bg-bp-surface min-h-screen animate-pulse">
      {/* Cover bar */}
      <div className="h-40 md:h-56 bg-bp-border/20 rounded-b-[40px] mx-6 md:mx-10 mt-20" />

      <div className="max-w-[1142px] mx-auto px-6 mt-8 pb-32">
        <div className="grid grid-cols-1 xl:grid-cols-[64%_36%] gap-8">
          <div className="space-y-6">
            {/* Avatar + name */}
            <div className="flex items-end gap-6 -mt-16 px-4">
              <div className="w-28 h-28 md:w-40 md:h-40 rounded-[40px] bg-bp-border/30 border-4 border-white shrink-0" />
              <div className="pb-4 space-y-3 flex-1">
                <div className="h-8 bg-bp-border/30 rounded-full w-3/5" />
                <div className="h-5 bg-bp-border/20 rounded-full w-2/5" />
                <div className="h-5 bg-bp-border/20 rounded-full w-1/3" />
              </div>
            </div>
            {/* Bio block */}
            <div className="bg-white rounded-[32px] border border-bp-border p-8 space-y-3">
              <div className="h-6 bg-bp-border/30 rounded-full w-1/3 mb-6" />
              <div className="h-4 bg-bp-border/20 rounded-full w-full" />
              <div className="h-4 bg-bp-border/20 rounded-full w-5/6" />
              <div className="h-4 bg-bp-border/20 rounded-full w-4/5" />
            </div>
          </div>

          {/* Booking card placeholder */}
          <div className="hidden xl:block bg-white rounded-[32px] border border-bp-border h-[400px]" />
        </div>
      </div>

      {/* Mobile sticky CTA placeholder */}
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-bp-border xl:hidden" />
    </div>
  )
}
```

- [ ] **Step 2: Build check**

```bash
rtk npm run build
```

Expected: zero errors

- [ ] **Step 3: Commit**

```bash
rtk git add src/app/doctor/\[id\]/loading.tsx
rtk git commit -m "feat: doctor profile loading.tsx skeleton"
```

---

## Task 4: Provider Profile — Wire Form + Avatar Upload

**Files:**
- Modify: `src/app/provider/profile/page.tsx`
- Create: `src/app/api/profile/route.ts`

**Context:** The page is already `'use client'`. The form currently uses hardcoded `defaultValue` strings and the avatar button does nothing. We wire it to a real `GET /api/profile` + `PATCH /api/profile` and add a file-input-to-Canvas-to-Supabase-Storage upload flow.

**Supabase Storage prerequisite:** The `avatars` bucket must exist with these policies before this feature works:
- INSERT/UPDATE: `auth.uid() = owner_id` 
- SELECT: public read

If the bucket doesn't exist yet, create it in the Supabase dashboard or via migration before testing this task.

- [ ] **Step 1: Create GET + PATCH /api/profile**

Create `src/app/api/profile/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('providers')
    .select('full_name, bio, title, icp_registration_no, consultation_fee_inr, experience_years, visit_types, avatar_url')
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Only allow whitelisted fields
  const allowed = ['full_name', 'bio', 'consultation_fee_inr', 'experience_years', 'avatar_url'] as const
  type AllowedField = typeof allowed[number]
  const patch: Partial<Record<AllowedField, unknown>> = {}
  for (const key of allowed) {
    if (body !== null && typeof body === 'object' && key in (body as object)) {
      patch[key] = (body as Record<string, unknown>)[key]
    }
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'No valid fields' }, { status: 400 })
  }

  // Ownership enforced: WHERE user_id = auth.uid()
  const { error } = await supabase
    .from('providers')
    .update(patch)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Write API test**

Create `src/app/api/__tests__/profile-route.test.ts`:

```ts
import { NextRequest } from 'next/server'

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))
import { createClient } from '@/lib/supabase/server'
import { GET, PATCH } from '../profile/route'

describe('GET /api/profile', () => {
  it('returns 401 when not authenticated', async () => {
    ;(createClient as jest.Mock).mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: null }, error: new Error('no user') }) },
    })
    const res = await GET()
    expect(res.status).toBe(401)
  })
})

describe('PATCH /api/profile', () => {
  it('returns 401 when not authenticated', async () => {
    ;(createClient as jest.Mock).mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: null }, error: new Error('no user') }) },
    })
    const req = new NextRequest('http://localhost/api/profile', {
      method: 'PATCH',
      body: JSON.stringify({ full_name: 'Test' }),
    })
    const res = await PATCH(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 for empty patch body', async () => {
    ;(createClient as jest.Mock).mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: { id: 'u1' } }, error: null }) },
    })
    const req = new NextRequest('http://localhost/api/profile', {
      method: 'PATCH',
      body: JSON.stringify({}),
    })
    const res = await PATCH(req)
    expect(res.status).toBe(400)
  })
})
```

- [ ] **Step 3: Run API test — expect PASS**

```bash
rtk npm test -- --testPathPattern=profile-route --watchAll=false
```

- [ ] **Step 4: Wire the provider profile page**

Replace the contents of `src/app/provider/profile/page.tsx` with the wired version. Key changes from current state:

1. Add state for `formData` (loaded from GET /api/profile on mount)
2. Add `avatarPreview` state (local blob URL while upload is in progress)
3. Add hidden `<input type="file">` wired to avatar button
4. Add `uploadAvatar(file: File)` function: Canvas resize → Supabase Storage upload → PATCH avatar_url
5. Replace all `defaultValue="..."` with `value={formData.fieldName}` + `onChange` handlers
6. Wire "Push Updates Live" button to PATCH /api/profile
7. Replace hardcoded "LP" / "Dr. Loki Strider" with real data from formData

Here is the complete replacement for the Personal Details section and the avatar block:

```tsx
'use client'

import {
  User, Briefcase, Award, Globe, ShieldCheck, Check,
  MapPin, Navigation, Info, Trash2, ArrowRight, Activity,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'

interface ProfileForm {
  full_name: string
  bio: string
  consultation_fee_inr: number | string
  experience_years: number | string
  avatar_url: string | null
}

const EMPTY_FORM: ProfileForm = {
  full_name: '',
  bio: '',
  consultation_fee_inr: '',
  experience_years: '',
  avatar_url: null,
}

function getInitials(name: string): string {
  return name
    .replace(/^Dr\.\s*/i, '')
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0] ?? '')
    .join('')
    .toUpperCase() || '?'
}

async function resizeImage(file: File, maxPx = 400): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('No canvas context')); return }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      canvas.toBlob((blob) => {
        if (!blob) { reject(new Error('Canvas toBlob failed')); return }
        resolve(blob)
      }, 'image/jpeg', 0.88)
    }
    img.onerror = reject
    img.src = url
  })
}

export default function ProviderProfile() {
  const { user } = useAuth()
  const [formData, setFormData] = useState<ProfileForm>(EMPTY_FORM)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [pincodes, setPincodes] = useState<string[]>(['110001', '110012', '110020'])
  const [newPincode, setNewPincode] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load profile on mount
  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((data: Partial<ProfileForm>) => {
        setFormData({
          full_name: data.full_name ?? '',
          bio: data.bio ?? '',
          consultation_fee_inr: data.consultation_fee_inr ?? '',
          experience_years: data.experience_years ?? '',
          avatar_url: data.avatar_url ?? null,
        })
      })
      .catch(() => {/* profile not found — stay on empty form */})
  }, [])

  const handleAvatarFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image must be under 5 MB')
      return
    }
    setAvatarError(null)

    const preview = URL.createObjectURL(file)
    setAvatarPreview(preview)

    try {
      const blob = await resizeImage(file)
      const supabase = createClient()
      const path = `providers/${user?.id ?? 'unknown'}.jpg`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, blob, { upsert: true, contentType: 'image/jpeg' })
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      setFormData((prev) => ({ ...prev, avatar_url: publicUrl }))
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: publicUrl }),
      })
    } catch {
      setAvatarError('Upload failed — please try again')
      setAvatarPreview(null)
    }
  }, [user])

  const handleSave = async () => {
    setSaveStatus('saving')
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.full_name,
          bio: formData.bio,
          consultation_fee_inr: formData.consultation_fee_inr ? Number(formData.consultation_fee_inr) : undefined,
          experience_years: formData.experience_years ? Number(formData.experience_years) : undefined,
        }),
      })
      setSaveStatus(res.ok ? 'saved' : 'error')
    } catch {
      setSaveStatus('error')
    }
  }

  const addPincode = () => {
    if (newPincode.match(/^[1-9][0-9]{5}$/) && !pincodes.includes(newPincode)) {
      setPincodes((prev) => [...prev, newPincode])
      setNewPincode('')
    }
  }

  const removePincode = (code: string) => {
    setPincodes((prev) => prev.filter((c) => c !== code))
  }

  const displayName = formData.full_name
    ? formData.full_name.startsWith('Dr.') ? formData.full_name : `Dr. ${formData.full_name}`
    : 'Your Name'
  const initials = getInitials(formData.full_name || 'You')
  const avatarSrc = avatarPreview ?? formData.avatar_url

  // ... (rest of the JSX — keep the same visual structure as current file
  // but replace hardcoded values with formData.* and wire buttons)
  // Avatar section: replace hardcoded "LP" with {initials}, show img if avatarSrc
  // Push Updates Live button: onClick={handleSave}
  // Save status: replace "Draft Saved Successfully" / "Last synced 2 minutes ago"
  //   with dynamic text based on saveStatus
```

Apply these specific diff hunks to `src/app/provider/profile/page.tsx`. Keep all other JSX, classNames, and sections unchanged.

**Hunk A — Full file header:** Replace the entire import block + component definition opening with the wired version above (the `ProfileForm`, `EMPTY_FORM`, helpers, and `ProviderProfile` function).

**Hunk B — Avatar block** (find the `<div className="relative group/avatar">` block ~line 66):
```tsx
{/* BEFORE */}
<div className="relative group/avatar">
  <div className="w-24 h-24 rounded-[32px] bg-bp-accent/10 text-bp-accent flex items-center justify-center text-2xl font-black border-4 border-white shadow-xl group-hover/avatar:scale-105 transition-transform">
    LP
  </div>
  <button
    className="absolute -bottom-2 -right-2 w-10 h-10 bg-bp-primary text-white rounded-2xl flex items-center justify-center border-4 border-white shadow-lg hover:bg-black transition-colors"
    title="Change Avatar"
  >
    <User size={16} />
  </button>
</div>
<div className="space-y-1">
  <h4 className="text-[18px] font-black text-bp-primary">Dr. Loki Strider</h4>
  <p className="text-[13px] font-bold text-bp-body/40 uppercase tracking-widest">Senior Physiotherapist</p>
</div>

{/* AFTER */}
<div className="relative group/avatar">
  {avatarSrc ? (
    <img
      src={avatarSrc}
      alt="Profile photo"
      className="w-24 h-24 rounded-[32px] object-cover border-4 border-white shadow-xl"
    />
  ) : (
    <div className="w-24 h-24 rounded-[32px] bg-bp-accent/10 text-bp-accent flex items-center justify-center text-2xl font-black border-4 border-white shadow-xl group-hover/avatar:scale-105 transition-transform">
      {initials}
    </div>
  )}
  <button
    onClick={() => fileInputRef.current?.click()}
    className="absolute -bottom-2 -right-2 w-10 h-10 bg-bp-primary text-white rounded-2xl flex items-center justify-center border-4 border-white shadow-lg hover:bg-black transition-colors"
    title="Change Avatar"
    type="button"
  >
    <User size={16} />
  </button>
  <input
    ref={fileInputRef}
    type="file"
    accept="image/*"
    className="sr-only"
    onChange={handleAvatarFile}
  />
</div>
<div className="space-y-1">
  <h4 className="text-[18px] font-black text-bp-primary">{displayName}</h4>
  <p className="text-[13px] font-bold text-bp-body/40 uppercase tracking-widest">Physiotherapist</p>
  {avatarError && (
    <p className="text-[12px] font-bold text-red-500 mt-1">{avatarError}</p>
  )}
</div>
```

**Hunk C — Full Name input** (~line 89): Replace `defaultValue="Loki Strider"` with:
```tsx
value={formData.full_name}
onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
```

**Hunk D — Bio textarea** (~line 112): Replace `defaultValue="Specialized in..."` with:
```tsx
value={formData.bio}
onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
```

**Hunk E — "Push Updates Live" button** (~line 297):
```tsx
{/* BEFORE */}
<button className="flex-1 sm:flex-none px-12 py-5 bg-bp-primary hover:bg-bp-accent text-white rounded-[24px] text-[14px] font-black transition-all shadow-2xl shadow-bp-primary/10 active:scale-95">
  Push Updates Live
</button>

{/* AFTER */}
<button
  onClick={() => void handleSave()}
  disabled={saveStatus === 'saving'}
  className="flex-1 sm:flex-none px-12 py-5 bg-bp-primary hover:bg-bp-accent text-white rounded-[24px] text-[14px] font-black transition-all shadow-2xl shadow-bp-primary/10 active:scale-95 disabled:opacity-60"
>
  {saveStatus === 'saving' ? 'Saving…' : 'Push Updates Live'}
</button>
```

**Hunk F — Footer status text** (~line 289): Replace:
```tsx
{/* BEFORE */}
<p className="text-[15px] font-black text-bp-primary">Draft Saved Successfully</p>
<p className="text-[12px] font-bold text-bp-body/40 uppercase tracking-widest">Last synced 2 minutes ago</p>

{/* AFTER */}
<p className="text-[15px] font-black text-bp-primary">
  {saveStatus === 'saved' ? 'Changes saved' : saveStatus === 'error' ? 'Save failed — try again' : 'Unsaved changes'}
</p>
<p className="text-[12px] font-bold text-bp-body/40 uppercase tracking-widest">
  {saveStatus === 'saving' ? 'Saving…' : 'Auto-saves on Push Updates'}
</p>
```

- [ ] **Step 5: Build check**

```bash
rtk npm run build
```

- [ ] **Step 6: Commit**

```bash
rtk git add src/app/provider/profile/page.tsx src/app/api/profile/route.ts src/app/api/__tests__/profile-route.test.ts
rtk git commit -m "feat: provider profile — wire avatar upload (Canvas+Supabase) + GET/PATCH form"
```

---

## Task 5: Patient Dashboard — Bug Fixes

**Files:**
- Modify: `src/app/patient/dashboard/page.tsx`

**Bugs to fix:**
1. Duplicate fetch — `loadInitialAppointments` (in useEffect) and `fetchAppointments` are identical. Remove the duplicate `fetchAppointments` outer function; only keep `loadInitialAppointments` in the effect and the standalone `fetchAppointments` used by the retry button. Actually: merge them — have `fetchAppointments` take no args, keep it as the single function, call it in `useEffect` AND on retry.
2. `console.error('Fetch error:', err)` — remove (2 occurrences)
3. Recovery pace card hardcodes `'72%'` — replace value with `null` and render "Coming soon" instead of `72%`
4. `window.location.origin` in `handleCopyReferralLink` — add `typeof window !== 'undefined'` guard per the spec.

- [ ] **Step 1: Write test**

Create `src/app/patient/dashboard/__tests__/dashboard.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'u1', user_metadata: { full_name: 'Priya' } } }),
}))

jest.mock('../DashboardSkeleton', () => ({
  DashboardSkeleton: () => <div>Loading</div>,
}))

// Intercept fetch
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ appointments: [] }),
} as Response)

import PatientDashboardHome from '../page'

describe('PatientDashboardHome', () => {
  it('does not hardcode 72% — shows Coming soon for recovery pace', async () => {
    const { findByText } = render(<PatientDashboardHome />)
    // After loading resolves
    await findByText(/coming soon/i)
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
rtk npm test -- --testPathPattern="patient/dashboard" --watchAll=false
```

- [ ] **Step 3: Apply fixes**

In `src/app/patient/dashboard/page.tsx`:

**Fix 1 — Dedupe fetch:** Remove the outer `fetchAppointments` function (lines 70-86) — it duplicates `loadInitialAppointments`. Keep only `loadInitialAppointments` in useEffect. For the retry button at line 178, inline the call: `onClick={() => { void loadInitialAppointments() }}` — but `loadInitialAppointments` is scoped inside `useEffect`. Refactor:

```tsx
// Replace outer fetchAppointments AND the useEffect loadInitialAppointments
// with a single function declared at component level:

const fetchAppointments = useCallback(async () => {
  setLoading(true)
  setError(false)
  try {
    const response = await fetch('/api/appointments')
    if (!response.ok) throw new Error('Failed to fetch appointments')
    const data: { appointments?: Appointment[] } = await response.json()
    setAppointments(data.appointments ?? [])
  } catch {
    setError(true)
  } finally {
    setLoading(false)
  }
}, [])

useEffect(() => {
  void fetchAppointments()
}, [fetchAppointments])
```

Add `useCallback` to the import.

**Fix 2 — Remove console.error:** Delete both `console.error('Fetch error:', err)` lines. The `err` parameter can be removed too (change `catch (err)` to `catch`).

**Fix 3 — Unhardcode 72%:** In `snapshotCards`:
```tsx
{
  title: 'Recovery pace',
  value: null,   // was '72%'
  detail: 'Feature coming soon',
  icon: Activity,
  href: '/patient/motio',
},
```
In the card render, wherever `card.value` is displayed, add a null check:
```tsx
{card.value ?? <span className="text-[14px] font-medium text-bp-body/40">Coming soon</span>}
```

**Fix 4 — SSR guard on `window.location.origin`:** In `handleCopyReferralLink` (~line 46), add a guard:
```tsx
async function handleCopyReferralLink() {
  if (typeof window === 'undefined') return   // ← add this
  const referralLink = `${window.location.origin}/signup?ref=bp-${user?.id?.slice(-6) ?? 'demo'}`
  // ... rest unchanged
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
rtk npm test -- --testPathPattern="patient/dashboard" --watchAll=false
```

- [ ] **Step 5: Build check**

```bash
rtk npm run build
```

- [ ] **Step 6: Commit**

```bash
rtk git add src/app/patient/dashboard/page.tsx src/app/patient/dashboard/__tests__/dashboard.test.tsx
rtk git commit -m "fix: patient dashboard — dedupe fetch, remove console.error, unhardcode recovery pace"
```

---

## Task 6: Provider Dashboard — Bug Fixes

**Files:**
- Modify: `src/app/provider/dashboard/page.tsx`

**Bugs to fix:**
1. "Today" / "This Week" tab buttons are decorative — wire `activeTab` state, filter `timeline` by tab
2. `console.error('Fetch error:', err)` — remove (2 occurrences)
3. Earnings card hardcodes `₹48,250` — replace with "Coming soon" + replace `DollarSign` icon with `₹` text
4. Practice Readiness checklist static `done: true/false` — derive from profile completeness (hasPhoto, hasIcp, hasAvailability) using data we already have

- [ ] **Step 1: Write test**

Create `src/app/provider/dashboard/__tests__/provider-dashboard.test.tsx`:

```tsx
jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'u1', user_metadata: { full_name: 'Dr. Arun' } } }),
}))
jest.mock('@/components/ui/Skeleton', () => ({ Skeleton: () => <div /> }))
jest.mock('@/components/ui/EmptyState', () => ({ EmptyState: () => <div /> }))

global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ appointments: [] }),
} as Response)

import { render, fireEvent, screen } from '@testing-library/react'
import ProviderDashboardHome from '../page'

describe('ProviderDashboardHome', () => {
  it('Today tab is active by default', async () => {
    const { findByText } = render(<ProviderDashboardHome />)
    const todayBtn = await findByText('Today')
    expect(todayBtn.className).toContain('bg-bp-accent')
  })

  it('clicking This Week changes active tab', async () => {
    const { findByText } = render(<ProviderDashboardHome />)
    const weekBtn = await findByText('This Week')
    fireEvent.click(weekBtn)
    expect(weekBtn.className).toContain('bg-bp-accent')
  })

  it('does not show hardcoded ₹48,250', async () => {
    await render(<ProviderDashboardHome />)
    expect(screen.queryByText('₹48,250')).toBeNull()
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
rtk npm test -- --testPathPattern="provider/dashboard" --watchAll=false
```

- [ ] **Step 3: Apply fixes**

**Fix 1 — Wire tabs:**
```tsx
// Add state near top of component:
const [activeTab, setActiveTab] = useState<'today' | 'week'>('today')

// Replace static timeline with tab-filtered:
const timeline = (activeTab === 'today' ? todayAppts : weekAppts)
  .slice()
  .sort((a, b) => {
    const as = a.availabilities?.starts_at ?? ''
    const bs = b.availabilities?.starts_at ?? ''
    return as < bs ? -1 : 1
  })

// Replace static tab buttons:
{(['Today', 'This Week'] as const).map((lbl) => {
  const key = lbl === 'Today' ? 'today' : 'week'
  return (
    <button
      key={lbl}
      onClick={() => setActiveTab(key)}
      className={cn("px-4 py-2 rounded-xl text-[12px] font-black transition-all",
        activeTab === key
          ? "bg-bp-accent text-white shadow-lg shadow-bp-primary/10"
          : "text-bp-body/40 hover:text-bp-body font-bold"
      )}
    >
      {lbl}
    </button>
  )
})}
```

**Fix 2 — Remove console.error:** Delete both occurrences. Change `catch (err)` → `catch`.

**Fix 3 — Earnings:** Replace hardcoded `₹48,250`:
```tsx
// Replace the earnings h4 and caption:
<h4 className="text-[24px] font-black tracking-tight leading-none mb-1 text-white/40">
  Coming soon
</h4>
<p className="text-[13px] font-bold text-white/40">Earnings analytics in next release</p>

// Replace DollarSign icon with ₹ text node:
<div className="p-3 bg-white/5 rounded-2xl text-emerald-400 text-[18px] font-black leading-none">
  ₹
</div>
```

**Fix 4 — Derive checklist from real data:**
The current `appointments` data doesn't tell us if the provider has an avatar or ICP. But `useAuth()` gives us `user`. We can derive simple completeness from the form data by calling GET /api/profile. Add a `useEffect` to load profile completeness:

```tsx
const [profileComplete, setProfileComplete] = useState({ hasPhoto: false, hasIcp: false })

useEffect(() => {
  fetch('/api/profile')
    .then((r) => r.json())
    .then((d: { avatar_url?: string | null; icp_registration_no?: string | null }) => {
      setProfileComplete({
        hasPhoto: !!d.avatar_url,
        hasIcp: !!d.icp_registration_no,
      })
    })
    .catch(() => {})
}, [])

// Then replace the static done: true/false with:
{ label: 'Clinical Profile', sub: 'Qualifications & Photo', href: '/provider/profile', done: profileComplete.hasPhoto },
{ label: 'Work Availability', sub: 'Clinical Hours & Buffer', href: '/provider/availability', done: false },
{ label: 'Account Verification', sub: 'KYC & License Check', href: '/provider/profile', done: profileComplete.hasIcp },
```

Also apply the same `useCallback` + `fetchAppointments` refactor as Task 5 (same duplicate pattern exists here).

- [ ] **Step 4: Run test — expect PASS**

```bash
rtk npm test -- --testPathPattern="provider/dashboard" --watchAll=false
```

- [ ] **Step 5: Build check**

```bash
rtk npm run build
```

- [ ] **Step 6: Commit**

```bash
rtk git add src/app/provider/dashboard/page.tsx src/app/provider/dashboard/__tests__/provider-dashboard.test.tsx
rtk git commit -m "fix: provider dashboard — wire tabs, remove console.error, unhardcode earnings, live checklist"
```

---

## Task 7: Admin Dashboard — Bug Fixes

**Files:**
- Modify: `src/app/admin/page.tsx`

**Bugs to fix:**
1. `"18 pending"` hardcoded in queue header — use `stats.pendingApprovals`
2. Revenue chart has no "Illustrative" label
3. `DollarSign` icon in earnings section → replace with `₹` text
4. Queue preview is static — add "View all" link

- [ ] **Step 1: Write test**

Create `src/app/admin/__tests__/admin-dashboard.test.tsx`:

```tsx
jest.mock('next/link', () => ({ __esModule: true, default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }))

global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => ({
    activeProviders: 5000, pendingApprovals: 42, totalPatients: 12000, gmvMtd: 500000,
  }),
} as Response)

import { render, screen, waitFor } from '@testing-library/react'
import AdminDashboardHome from '../page'

describe('AdminDashboardHome', () => {
  it('shows dynamic pending count from stats', async () => {
    render(<AdminDashboardHome />)
    await waitFor(() => {
      expect(screen.queryByText('18 pending')).toBeNull()
    })
  })

  it('has Illustrative label on revenue chart', async () => {
    render(<AdminDashboardHome />)
    await waitFor(() => {
      expect(screen.getByText(/illustrative/i)).toBeTruthy()
    })
  })

  it('has View all link to /admin/listings', async () => {
    render(<AdminDashboardHome />)
    await waitFor(() => {
      const link = screen.getByRole('link', { name: /view all/i })
      expect(link).toBeTruthy()
    })
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
rtk npm test -- --testPathPattern="admin/__tests__/admin-dashboard" --watchAll=false
```

- [ ] **Step 3: Apply fixes**

**Fix 1 — Dynamic pending count in queue header:**

Find the queue header `<div>` with `"18 pending"` (around line 290):
```tsx
// BEFORE:
<div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white/60">
  18 pending
</div>

// AFTER:
<div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white/60">
  {loading ? '…' : `${stats.pendingApprovals} pending`}
</div>
```

**Fix 2 — Illustrative label on revenue chart:**

Find the Revenue pulse section heading area (around line 247) and add label after the subtitle:
```tsx
<p className="mt-1 text-[12px] font-black uppercase tracking-[0.22em] text-bp-body/40">
  Platform volume by week
</p>
<p className="mt-1 text-[10px] font-medium text-bp-body/30 italic">(Illustrative)</p>
```

**Fix 3 — Replace DollarSign with ₹:**

Remove `DollarSign` from the lucide imports. Find the usage (in the earnings insight section of the queue area, or in flowPreview cards):
```tsx
// Find any: <DollarSign ... />
// Replace with: <span className="text-[18px] font-black leading-none">₹</span>
```

Also remove `DollarSign` from the import at line 5 if it's only used once.

**Fix 4 — View all link:**

After the `queuePreview.map(...)` block ends (around line 317), before the regional density grid, add:
```tsx
<div className="mt-4 text-right">
  <Link
    href="/admin/listings"
    className="text-[12px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors"
  >
    View all →
  </Link>
</div>
```

- [ ] **Step 4: Run test — expect PASS**

```bash
rtk npm test -- --testPathPattern="admin/__tests__/admin-dashboard" --watchAll=false
```

- [ ] **Step 5: Build check**

```bash
rtk npm run build
```

- [ ] **Step 6: Commit**

```bash
rtk git add src/app/admin/page.tsx src/app/admin/__tests__/admin-dashboard.test.tsx
rtk git commit -m "fix: admin dashboard — dynamic pending count, illustrative label, ₹ icon, View all link"
```

---

## Final: Full Build + Push

- [ ] **Step 1: Run all tests**

```bash
rtk npm test -- --watchAll=false
```

Expected: all new tests pass, no regressions

- [ ] **Step 2: Final build**

```bash
rtk npm run build
```

Expected: zero errors

- [ ] **Step 3: Push**

```bash
rtk git push
```

---

## Summary: Commits

| # | Commit message |
|---|----------------|
| 1 | `fix: hero viewport — 100svh, clamp type, overflow-hidden to span only` |
| 2 | `feat: DoctorCard photo support — avatarUrl with initials fallback` |
| 3 | `feat: FeaturedDoctors grid above search results with photo + initials fallback` |
| 4 | `feat: provider profile — wire avatar upload (Canvas+Supabase) + GET/PATCH form` |
| 5 | `fix: patient dashboard — dedupe fetch, remove console.error, unhardcode recovery pace` |
| 6 | `fix: provider dashboard — wire tabs, remove console.error, unhardcode earnings, live checklist` |
| 7 | `fix: admin dashboard — dynamic pending count, illustrative label, ₹ icon, View all link` |
