# UI Upgrade — Phase 11.7 Design Spec

**Date:** 2026-04-04  
**Author:** brainstorming session (ruddvz)  
**Status:** Approved by user  

---

## Scope

Four coordinated upgrades delivered sequentially:

1. **Hero fix** — viewport clipping, PWA overflow, tablet font wrap
2. **Search cards + photos** — featured doctor grid + DoctorCard photo support
3. **Doctor profile pipeline** — provider self-edit + public patient-facing profile
4. **Dashboard audit** — patient, provider, and admin bug/stub/UX fixes

---

## 1. Hero Fix

### Problem
- `overflow-hidden` on the outer `<section>` clips the animated rotating word on Safari and PWA standalone mode
- `min-h-[calc(100vh-5rem)]` causes hero to overflow the screen in PWA standalone (where `100vh` > usable height)
- `text-[54px] md:text-[82px] lg:text-[96px]` wraps mid-word on 768–1024px tablets, pushing the search bar below the fold

### Solution — Option A: Viewport-safe + fluid type

**File:** `src/components/HeroSection.tsx`

| Current | Replace with |
|---------|-------------|
| `min-h-[calc(100vh-5rem)]` on `<section>` | `min-h-[100svh]` (CSS small viewport height — accounts for PWA and browser chrome) |
| `overflow-hidden` on `<section>` | Remove from section; add `overflow-hidden` only on the `<span>` wrapping the animated word |
| `text-[54px] md:text-[82px] lg:text-[96px]` | `text-[clamp(2.4rem,7vw,5.5rem)]` (≈38px mobile → 67px mid-tablet → 88px 1440px desktop) |

Add `pb-[env(safe-area-inset-bottom)]` to the section for iOS notch / bottom bar safety.

No other changes to HeroSection.

---

## 2. Search Cards + Photos

### 2a. Featured Doctors Grid

**New component:** `src/components/FeaturedDoctors.tsx`  
**Loading state:** Use React `Suspense` with a skeleton grid (4 placeholder cards matching card dimensions) wrapping the async data fetch.

- Fetches top 4 providers by rating from `/api/providers?sort=rating&limit=4`
- Renders a horizontal strip above the DoctorCard list on the search/find page
- Layout: 4 columns on desktop (`grid-cols-4`), 2 columns on mobile (`grid-cols-2`)
- Card style: Option A — horizontal photo+name+specialty tile
  - 52×52 rounded-square avatar (14px radius) — `next/image` with `object-cover`, falls back to initials gradient
  - Doctor name (14px, weight 800) — use CSS token `var(--bp-primary)` / Tailwind class `text-bp-primary`
  - Specialty (11px, weight 700) — use `text-bp-accent` (teal `#12B3A0` / `#00766C` — whichever is defined as `bp-accent` in the design system; verify against `DESIGN.md` before implementation)
  - Star rating + review count row
- Each card links to `/doctor/[id]`
- The strip has a section label "Featured Physiotherapists" above it
- **`next/image` config:** The Supabase Storage hostname must be present in `next.config.ts` under `images.remotePatterns`. If not already there, add it as part of this step.

**API change:** `/api/providers` must include `avatar_url` in its response payload. No schema change needed — `avatar_url` is already on the `providers` table; it just needs to be selected and returned.

### 2b. DoctorCard Photo Upgrade

**File:** `src/components/DoctorCard.tsx`

- Add `avatarUrl?: string | null` to the `Doctor` interface
- The existing 88×88 rounded-square avatar slot (`border-radius: 22px`) gets a `next/image` with `fill` + `object-cover` when `avatarUrl` is present
- When `avatarUrl` is absent/null: keep the current initials gradient (zero visual regression)
- Verified badge overlay (`✓` in dark circle, bottom-right) is preserved as-is

**No layout change** — same 88px slot, same card dimensions.

---

## 3. Doctor Profile Pipeline

### 3a. Provider Self-Edit Profile (`/provider/profile`)

**File:** `src/app/provider/profile/page.tsx`  
**Component type:** Must be `'use client'` (uses Canvas API and file input, both browser-only)  
**Auth guard:** Server-side session check required before render; the PATCH handler must verify `session.user.id === providers.user_id` before updating any row — reject with 403 if mismatch.

#### Avatar Upload Flow
1. Hidden `<input type="file" accept="image/*">` wired to the "Change Avatar" button
2. On file select: use Canvas API to resize to max 400×400px (maintain aspect ratio)
3. Upload resized blob to Supabase Storage bucket `avatars` at path `providers/{userId}.jpg`
4. On success: update `providers.avatar_url` via `PATCH /api/profile` and show new image in UI
5. Error states: file too large (>5MB before resize), upload failure — show inline error

**Supabase Storage RLS (avatars bucket):**
- INSERT/UPDATE: `auth.uid() = owner_id` (provider can only write their own file)
- SELECT: public (patient-facing profile reads are unauthenticated)
- The migration/policy must be applied before this feature ships.

#### Form Wiring
- On mount: `GET /api/profile` → populate all form fields with real DB values
- Fields: full name, specialization, bio, ICP registration number, years of experience, consultation fee (INR), visit types (checkboxes), clinic address
- On submit: `PATCH /api/profile` with validated payload (Zod schema, same as existing validation)
- Success/error toast feedback

#### API routes needed
- `GET /api/profile` — returns provider row joined with user row
- `PATCH /api/profile` — updates provider fields (already exists partially; complete it)

### 3b. Public Doctor Profile (`/doctor/[id]`)

**File:** `src/app/doctor/[id]/page.tsx`  
**Component type:** Server Component (no interactivity except "Book Session" link)  
**404 handling:** If `/api/providers/[id]` returns no record, call Next.js `notFound()` to render the standard 404 page.  
**Loading state:** Add `src/app/doctor/[id]/loading.tsx` with a skeleton matching the profile layout (avatar placeholder + 3 text skeleton lines + sticky CTA bar).

**Layout (single column, mobile-first):**

| Section | Detail |
|---------|--------|
| Avatar | 120×120px circle, `next/image` + initials fallback |
| Identity block | Full name (24px, 800), degree string (14px, muted), ICP badge (teal pill) |
| Rating row | Star + score + review count |
| Specialty tags | Horizontal scroll pill row |
| Bio | Up to 3 lines, expandable "Read more" |
| Fee + CTA | Sticky bar at bottom on mobile — fee left, "Book Session →" button right (accent orange) |
| Visit type chips | In-clinic / Home visit / Online indicators |

**Data source:** `GET /api/providers/[id]` — returns full provider record including `avatar_url`, `bio`, `specializations`, `icp_number`, `fee_inr`, `visit_types`, `rating`, `review_count`

No new tables needed.

---

## 4. Dashboard Audit

### 4a. Patient Dashboard (`/patient/dashboard`)

| Bug | Fix |
|-----|-----|
| Duplicate fetch functions (`loadInitialAppointments` + `fetchAppointments`) near-identical | Consolidate into a single `fetchAppointments(status)` with a status parameter |
| `console.error('Fetch error:', err)` leaks to production | Remove; use proper error state + UI feedback |
| Recovery pace hardcoded at `72%` | Remove fake progress bar or replace with a "Coming soon" state |
| `window.location.origin` in referral link — no SSR guard | Wrap in `useEffect` or check `typeof window !== 'undefined'` |

### 4b. Provider Dashboard (`/provider/dashboard`)

| Bug | Fix |
|-----|-----|
| "Today" / "This Week" tab buttons purely decorative — no state, no filter | Wire `activeTab` state; filter upcoming appointments by date range |
| Patient avatar in next-patient card shows initials only | Accept `avatar_url` from API response; show photo or initials fallback (same pattern as DoctorCard) |
| Earnings shows hardcoded `₹48,250` | Replace with actual sum from appointments API or show "Coming soon" skeleton |
| Practice Readiness checklist `done: true/false` is static | Derive from real profile completeness (has photo, has bio, has ICP number, has availability set) |

### 4c. Admin Dashboard (`/admin`)

| Bug | Fix |
|-----|-----|
| Queue header hardcoded `"18 pending"` | Use `stats.pendingApprovals` from the stats API response |
| Revenue chart bars are static decorations | Add a small `(Illustrative)` label beneath the chart title |
| `DollarSign` lucide icon used for INR | Replace with `₹` text node styled to match the icon size |
| Queue preview list is fully static | Wire to first N items from `/api/admin/listings?status=pending`; "View all" → `/admin/listings` |

---

## Implementation Sequence

```
1. Hero fix         → HeroSection.tsx only, zero API changes
2. Search cards     → FeaturedDoctors.tsx (new), DoctorCard.tsx (avatar), /api/providers (add avatar_url)
3. Profile pipeline → /provider/profile page + /doctor/[id] page + GET/PATCH /api/profile + /api/providers/[id]
4. Dashboard audit  → patient + provider + admin dashboard pages
```

Each step is independently deployable and verifiable before the next begins.

---

## Out of Scope

- Real-time review/rating system (ratings shown are read-only from DB)
- In-app messaging between patient and provider
- Payment flow changes
- Map / geolocation search
- Any feature not explicitly listed above

---

## Open Questions / Risks

- `100svh` has no support in browsers before mid-2023 — negligible for India mobile market (Chrome/Safari are current); acceptable trade-off confirmed.
- Design token color values (`bp-accent` / `bp-primary`) should be verified against `DESIGN.md` and `.claude/design-system/DESIGN.md` before implementation; the spec uses token names rather than raw hex to avoid conflicts.
- Canvas API resize is client-side only — server-side image optimization (e.g., Sharp) can be added later but is out of scope here.
- `/api/profile` GET and PATCH endpoints may need to be created or completed — backend scope is included in this plan.
