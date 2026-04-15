# Homepage Redesign + Apple Squircles + Character Pose Plan

**Branch:** `claude/redesign-homepage-characters-e8OO1`
**Status:** In progress
**Created:** 2026-04-15

---

## Overview

1. **Apple-style squircles** (G2 curvature continuity) applied to EVERY rounded corner across the entire site
2. **Homepage section redesigns** — TopSpecialties, ProofSection, ProviderCTA, FAQ polished
3. **How It Works page** redesigned with squircle corners + character added to dark CTA
4. **Character pose plan** — 8 unique poses for commissioning (see `public/images/characters/README.md`)

---

## What Changed

### Squircle System (CSS-only approximation)

Added CSS custom properties to `:root` in `globals.css`:

```css
--sq-xs: 10px;   /* small badges, icon boxes, buttons — replaces rounded-lg */
--sq-sm: 14px;   /* buttons, inputs, toggles, dropdown items — replaces rounded-xl */
--sq-md: 18px;   /* medium cards, accordion items */
--sq-lg: 22px;   /* large cards, sections — replaces rounded-2xl */
--sq-xl: 28px;   /* hero-level containers, modals — replaces rounded-3xl */
```

Mapping from Tailwind defaults:
- `rounded-lg` (8px) → `rounded-[var(--sq-xs)]` (10px)
- `rounded-xl` (12px) → `rounded-[var(--sq-sm)]` (14px)
- `rounded-2xl` (16px) → `rounded-[var(--sq-lg)]` (22px)
- `rounded-3xl` (24px) → `rounded-[var(--sq-xl)]` (28px)
- `rounded-full` — stays as-is (pills don't need squircle)

The larger radii relative to element size approximate Apple's superellipse (G2 continuous curvature). Combined with `inset 0 0 0 0.5px rgba(0,0,0,0.04)` box-shadow on cards for the "smooth edge" perception.

### Files Modified

**Core design system:**
- `src/app/globals.css` — Added squircle CSS custom properties, updated `.bp-card*`, `.bp-btn-*`, `.bp-input`, `.bp-stat-card`, `.bp-nav-item`

**Homepage components:**
- `src/components/TopSpecialties.tsx` — Squircle cards, improved hover (scale instead of translateY), removed redundant trust strip
- `src/components/ProofSection.tsx` — Squircle all containers/cards
- `src/components/ProviderCTA.tsx` — Squircle dashboard mockup and inner elements
- `src/components/FAQ.tsx` — Squircle accordion items and buttons
- `src/components/HeroSection.tsx` — Squircle non-pill elements only (dropdowns, trust badges)

**Site-wide components:**
- `src/components/Navbar.tsx` — Squircle dropdown, specialty cards, nav items, mobile menu
- `src/components/Footer.tsx` — Squircle trust badges
- `src/components/HowItWorks.tsx` — Homepage how-it-works section
- `src/components/HealthSystems.tsx` — Feature cards and buttons
- `src/components/FeaturedDoctors.tsx` — Provider cards
- `src/components/SupportChatWidget.tsx` — Chat panel, messages, inputs
- `src/components/CookieConsent.tsx` — Consent banner
- `src/components/SectionErrorBoundary.tsx` — Error fallback cards
- `src/components/DoctorCardSkeleton.tsx` — Skeleton loading cards
- `src/components/SidebarNav.tsx` — Navigation items
- `src/components/PWAInstallPrompt.tsx` — Install banner and tutorial modal
- `src/components/SubscriptionPlans.tsx` — Plan cards

**UI primitives:**
- `src/components/ui/button.tsx` — Base button variants
- `src/components/ui/dialog.tsx` — Dialog content and close button
- `src/components/ui/card.tsx` — Card primitive

**Dashboard primitives:**
- `src/components/dashboard/primitives.tsx` — DashCard, StatTile, ListRow, EmptyState

**Auth:**
- `src/components/auth/DemoAccessPanel.tsx` — Demo access cards
- `src/components/auth/EmailSignInDialog.tsx` — Email sign-in dialog and inputs

**Clinical:**
- `src/components/clinical/SoapForm.tsx` — SOAP form section indicators

**Pages (all .tsx files under src/app/):**
- All page-level components converted via bulk replacement

**How It Works standalone page:**
- `src/app/how-it-works/page.tsx` — Squircle step cards, added character to dark CTA section

### What Was NOT Changed

- **Hero section** — Kept indigo/lavender theme exactly as-is
- **Navbar design** — Only corners updated, no layout/color changes
- **TopSpecialties yellow backgrounds** — Preserved
- `rounded-full` elements — Pills stay pill-shaped
- Test files — Not converted (they test for class names)

---

## Character Pose Plan

See `public/images/characters/README.md` for the full 8-pose commissioning brief with:
- Exact pose descriptions
- Expression guidance
- Placement rationale
- Technical specs (size, format, lighting)

---

## Remaining Work

- [ ] Update regression tests (`homepage-regressions.test.tsx`, `how-it-works/page.regressions.test.tsx`) for new class names
- [ ] Run `npm run build` — verify zero TS errors
- [ ] Run `npm test` — update failing assertions
- [ ] Run `npm run lint` — clean
- [ ] Commission character illustrations from the 8-pose plan
- [ ] Swap fallback images for final renders (one-line constant change per placement)

---

## How to Continue This Work

If you hit a context limit mid-session:

1. **Check git status** — see what's committed vs uncommitted
2. **Read this file** — understand the plan scope and what's done
3. **Read the character README** — `public/images/characters/README.md`
4. **Run `npm run build`** — fix any TS errors from squircle conversions
5. **Run `npm test`** — update test assertions that reference old `rounded-*` classes
6. **Commit and push** to `claude/redesign-homepage-characters-e8OO1`

### Squircle variable reference (quick lookup)

| Old Class | New Class | Pixel Value |
|-----------|-----------|-------------|
| `rounded-lg` | `rounded-[var(--sq-xs)]` | 10px |
| `rounded-xl` | `rounded-[var(--sq-sm)]` | 14px |
| `rounded-2xl` | `rounded-[var(--sq-lg)]` | 22px |
| `rounded-3xl` | `rounded-[var(--sq-xl)]` | 28px |
| `rounded-full` | `rounded-full` (unchanged) | 9999px |
