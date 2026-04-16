# BookPhysio.in — Design System

> Single source of truth for all UI agents.
> Reference implementation: `src/app/globals.css` + `tailwind.config` tokens.
> Supporting spec: `docs/superpowers/specs/bpdesign.md`.

---

## 0. Design Philosophy

| Principle | What it means in practice |
|---|---|
| **Squircle geometry** | All radii use the Apple-style G2-curvature `--sq-*` tokens — no fixed 8 px / 24 px / 50 % corners |
| **Role palettes** | Patient / Provider / Admin / Public each have their own tuned palette (`pt-`, `pv-`, `ad-`, `bp-`) |
| **Motion with intent** | GSAP-driven micro-interactions and scroll reveals, always gated on `prefers-reduced-motion` |
| **Mobile first** | Every component must work at 375 px before adding tablet / desktop refinements |
| **Server by default** | `'use client'` only when hooks, refs, or animation lifecycles demand it |

---

## 1. Squircle Radii (CRITICAL — the new radius system)

Defined in `src/app/globals.css` `:root`:

```css
--sq-xs: 10px;   /* small badges, icon boxes, status pills */
--sq-sm: 14px;   /* buttons, inputs, toggles, small chips */
--sq-md: 18px;   /* medium cards, accordion items, list items */
--sq-lg: 22px;   /* large cards, section panels, modals (compact) */
--sq-xl: 28px;   /* hero-level containers, marketing cards, full modals */
```

### Tailwind usage

```tsx
// ✅ Correct — always reference the token
<div className="rounded-[var(--sq-md)]">…card…</div>
<button className="rounded-[var(--sq-sm)]">CTA</button>

// ❌ Wrong — hardcoded radii
<div className="rounded-lg">…</div>      // Tailwind default
<div className="rounded-[8px]">…</div>   // arbitrary pixel
<div style={{ borderRadius: 12 }}>…</div>
```

### Circle / pill exceptions

| Element | Rule |
|---|---|
| Avatars | `rounded-full` (true circle) |
| Switch / toggle thumbs | `rounded-full` |
| Status pills that must wrap text inside | `rounded-[var(--sq-sm)]`, NOT `rounded-full` |
| Primary CTA "pill" buttons | `rounded-[var(--sq-sm)]` — squircle, not lozenge |

### Radius decision matrix

| Size of element | Token | Example |
|---|---|---|
| ≤ 32 px (badges, icon chips) | `--sq-xs` | spec, verified, count pill |
| 32 – 56 px (buttons, inputs, chips) | `--sq-sm` | "Book session" CTA, search input |
| 56 – 200 px (cards, list rows) | `--sq-md` | DoctorCard, FAQ item, availability tile |
| Section panels, mid-size cards | `--sq-lg` | ProofSection card, Testimonial block |
| Hero containers, full modals | `--sq-xl` | HeroSection inner panel, onboarding modal |

---

## 2. Color Tokens

All colors live in `src/app/globals.css` under `@theme inline`. Four role palettes:

### 2a. Public site / Patient-facing marketing — `bp-*`

| Token | Value | Usage |
|---|---|---|
| `--color-bp-primary` | `#00766C` | Primary teal — CTAs, links, active nav |
| `--color-bp-primary-dark` | `#005A52` | Hover / pressed states |
| `--color-bp-primary-deep` | `#004542` | Heading accents, deep backgrounds |
| `--color-bp-primary-light` | `#E6F4F3` | Chip bg, highlight surfaces |
| `--color-bp-primary-muted` | `#B2D8D5` | Subtle accents, dividers on teal |
| `--color-bp-accent` | `#FF6B35` | Coral CTA (primary orange action) |
| `--color-bp-peach` | `#FFBF91` | Soft callouts, warm highlights |
| `--color-bp-sage` | `#AEE3A8` | Success, verified badges |
| `--color-bp-lavender` | `#C6AEFA` | Special state highlights |
| `--color-bp-rose` | `#FFA1BA` | Illustration accents |
| `--color-bp-ink` | `#1A2E2C` | Near-black teal — headings |
| `--color-bp-slate` | `#2D4744` | Secondary dark text |
| `--color-bp-body` | `#333333` | Primary body text |
| `--color-bp-muted` | `#666666` | Muted / secondary text |
| `--color-bp-border` | `#E0E5E4` | Card borders, dividers |
| `--color-bp-border-soft` | `#EBF0EF` | Ultra-light dividers |
| `--color-bp-surface` | `#F7F8F9` | Page background |
| `--color-bp-card` | `#FFFFFF` | Card / modal background |
| `--color-bp-elevated` | `#EBF4F3` | Secondary surface on teal sections |
| `--color-bp-warm` | `#FFF1EC` | Warm highlight band (peach-tinted) |

### 2b. Patient dashboard — "Mint Breeze" — `pt-*`

Signature: `--color-pt-primary: #2BA78D` (deeper mint for contrast), 6 pastel stat-tile pairs, dark pill active state.

### 2c. Provider dashboard — "Periwinkle Bloom" — `pv-*`

Signature: `--color-pv-primary: #6B7BF5`, cool periwinkle surface, 6 pastel stat-tile pairs.

### 2d. Admin dashboard — "Monochrome Noir" — `ad-*`

Signature: `--color-ad-primary: #0A0A0A`, sophisticated grayscale with one warm sand accent for warnings.

> **Rule:** On a public marketing page, never use `pt-`, `pv-`, or `ad-` tokens. On a dashboard, never use generic `bp-` unless it's on the shared Footer.

### 2e. Footer palette

Footer uses its own near-black: `#0B0B0F` (unambiguously black — zero blue tint). Text on footer uses `text-neutral-300 / 400 / 500` for adequate contrast. See `src/components/Footer.tsx`.

---

## 3. Typography

All text uses the `Inter` variable font via Next/Font. Headings optionally use `Outfit` (exposed as `--font-heading`).

| Role | Size | Weight | Color |
|---|---|---|---|
| Display / hero h1 | `clamp(44px, 6vw, 68px)` | `700` | `bp-ink` |
| Page title (h1) | `32px` | `700` | `bp-ink` |
| Section heading (h2) | `28px` | `700` | `bp-ink` |
| Subsection (h3) | `22px` | `600` | `bp-ink` |
| Card title | `18px` | `600` | `bp-body` |
| Body | `15px` / `16px` | `400` | `bp-body` |
| Small / labels | `13px` | `500` | `bp-muted` |
| Button | `15px` | `600` | `white` on `bp-primary` / `bp-accent` |
| Price | `18px` | `700` | `bp-ink` (₹ integer only) |

**Rules:**
- Never set `fontFamily` inline — rely on `font-sans` (Tailwind default) and `font-heading` via class.
- Body copy must be ≥ `15px` on mobile for legibility.

---

## 4. Spacing, Layout & Elevation

### Layout constants

| Token | Value |
|---|---|
| Max content width | `1142px` (use `max-w-[1142px] mx-auto`) |
| Side padding desktop | `60px` (`lg:px-[60px]`) |
| Side padding mobile | `24px` (`px-6`) |
| Sidebar width (dashboards) | `240px` |
| Section gap (homepage) | `64px` (`py-16`) or `96px` (`py-24`) |

### Shadows (squircle-friendly elevation)

```css
/* card default  */ box-shadow: 0 2px 8px rgba(0,0,0,0.06);
/* card hover    */ box-shadow: 0 4px 16px rgba(0,0,0,0.12);
/* modal / drop  */ box-shadow: 0 8px 32px rgba(0,0,0,0.16);
/* focus glow    */ box-shadow: 0 0 0 3px rgba(0,118,108,0.25);
```

Tailwind: prefer `shadow-[0_2px_8px_rgba(0,0,0,0.06)]` over `shadow-md` to keep the squircle aesthetic visually consistent.

---

## 5. Motion — GSAP + `useGSAP` (CRITICAL)

GSAP is the house animation library. Use it for:
- Scroll-triggered reveals (sections, cards, chips)
- Micro-interactions on CTAs, tabs, accordions
- Hero entrance choreography
- Number counters and skill bars

### Shared entry point

Always import from the shared helper, not raw `gsap`:

```ts
// src/lib/gsap-client.ts
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
if (typeof window !== 'undefined') gsap.registerPlugin(useGSAP, ScrollTrigger)
export { gsap, ScrollTrigger, useGSAP }
```

### Standard scroll-reveal pattern

```tsx
'use client'
import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap-client'

export function Example() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.from('[data-reveal]', {
      y: 24, opacity: 0, duration: 0.6, ease: 'power2.out',
      stagger: 0.08,
      scrollTrigger: { trigger: scope.current, start: 'top 80%' },
    })
  }, { scope })

  return <section ref={scope}>{/* children with data-reveal */}</section>
}
```

### Rules
1. **Always** gate animation on `prefers-reduced-motion: reduce` — return early if the user opted out.
2. **Always** scope `useGSAP` with a `ref` so cleanup happens on unmount.
3. **Never** animate `height` / `width` — animate `transform` and `opacity` only.
4. **Ease defaults:** `power2.out` for reveals, `power3.out` for hero entrances, `expo.out` only for single-shot dramatic moves.
5. **Duration defaults:** `0.4–0.6s` for reveals, `≤ 0.25s` for micro-interactions.
6. **Stagger defaults:** `0.06–0.10s` for card grids.
7. Use `data-*` attributes (`data-reveal`, `data-slot-pill`, `data-faq-item`) as targets — keeps JSX clean and testable.

### Reduced-motion fallback

When motion is disabled, the element must still be visible in its final state. Prefer `gsap.from(...)` (starts from offset, ends at identity) over `gsap.to(...)` (starts at identity) so that if the effect never runs the element is already rendered correctly.

---

## 6. Component Patterns

### 6a. Navbar (`src/components/Navbar.tsx`)
- White bg, sticky top, `z-50`
- Shadow on scroll: `shadow-[0_1px_4px_rgba(0,0,0,0.08)]`
- Logo + nav + "Sign up" CTA
- GSAP: fade + slide-down on initial mount; underline micro-interaction on nav links
- Mobile: slide-out drawer, `rounded-r-[var(--sq-xl)]`

### 6b. DoctorCard (`src/components/DoctorCard.tsx` / `search`-page variant)
- White card, `rounded-[var(--sq-md)]`, default shadow, `hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)]`
- Avatar 80 px `rounded-full`
- Star rating, credentials, price in `₹`, "Book session →" CTA `rounded-[var(--sq-sm)]`
- Verified badge `rounded-[var(--sq-xs)]` with `bp-sage` bg

### 6c. HeroSection
- Outer gradient band, inner content `max-w-[1142px] mx-auto`
- Search bar `rounded-[var(--sq-sm)]` with portal-ready dropdown at `z-50`
- No specialty chips (removed per current design)
- GSAP: staggered fade/slide for headline → subheadline → search bar

### 6d. FAQ (`src/components/FAQ.tsx`)
- Two-column: sticky category nav left, rich answers right
- Each FAQ item `rounded-[var(--sq-md)]` with `data-faq-item` for GSAP reveal
- Scrollspy via `IntersectionObserver`

### 6e. Footer (`src/components/Footer.tsx`)
- `bg-[#0B0B0F]` (near-black, no blue tint)
- Max-width container, multi-column link list
- Text in `text-neutral-300 / 400`
- Social icons `rounded-[var(--sq-sm)]`

### 6f. Sidebar nav (dashboards)
- `240px` wide, role-palette bg (`--color-{pt,pv,ad}-nav-bg`)
- Active item: `rounded-[var(--sq-sm)]` with role-primary bg + white fg
- Logout pinned at bottom

### 6g. Form cards (auth, booking)
- `max-w-[480px]` centered, `rounded-[var(--sq-lg)]`, default shadow
- Full-width submit button `rounded-[var(--sq-sm)]`, teal bg
- Error messages: `text-red-600 text-[13px] mt-1.5`

### 6h. Status badges
- `rounded-[var(--sq-xs)]`, `text-[12px] font-semibold px-2.5 py-1`
- Confirmed → `bg-bp-primary-light text-bp-primary-dark`
- Pending → `bg-[#FFF4D1] text-[#8B6A1A]`
- Cancelled → `bg-red-50 text-red-700`
- Completed → `bg-bp-primary-light text-bp-primary-dark`

---

## 7. Breakpoints

| Name | Width | Notes |
|---|---|---|
| Mobile | `375px` | Single column, hamburger menu, stacked cards |
| Tablet | `768px` | 2-col grids, collapsed sidebar |
| Desktop | `1280px` | Full layout, sidebar visible, 3-col grids |
| XL | `1440px+` | Larger hero, wider max-width sections |

Mobile-first: write `base → md: → lg:`, never the reverse.

---

## 8. India-Specific Rules

| Rule | Implementation |
|---|---|
| Currency | `₹` prefix, **integer rupees only** — NEVER paise, NEVER `$`, NEVER `.00` |
| GST | `18%`, server-side only: `Math.round(fee * 0.18)` |
| Phone | `+91` prefix shown, E.164 in DB, `z.string().regex(/^\+91[6-9]\d{9}$/)` |
| Pincode | 6-digit, `z.string().regex(/^[1-9][0-9]{5}$/)` |
| Auth primary | Phone OTP via Supabase Auth (MSG91 is backing SMS vendor, not app client) |
| Provider credential | ICP registration number |
| Visit types | `in_clinic`, `home_visit`, `online` |
| Date format | DD/MM/YYYY in UI, ISO 8601 in DB |
| Core cities | Delhi, Mumbai, Bangalore, Chennai, Hyderabad, Pune, Kolkata, Ahmedabad, Jaipur, Surat |

---

## 9. Brand Assets & Mascot

### 9a. Name & Voice
- **Name:** Ace
- **Role:** Website support character and clinical copilot
- **Voice:** Professional, empathetic, health-guided, highly structured. No generic chatbot patterns.

### 9b. Official Mascot: Ace
- **Aesthetic:** High-end 3D "smooth clay" render, soft studio lighting, Apple-like
- **Concept:** Futuristic but approachable humanoid — empathy + structural guidance
- **Palette:** Pure white with navy + premium metallic teal accents

### 9c. Logo
- Text: **Bookphysio.in** — capital `B`, rest lowercase
- Typography: custom geometric sans-serif, precise kerning
- Color: deep navy on white

### 9d. Iconic symbol
- Mobius-like ribbon suggesting spine / kinetic movement
- Geometric precision with negative space — no literal bone structures

---

## 10. Agent Instructions (read before editing UI)

- **Always** use Tailwind utility classes (no inline styles, no raw CSS unless unavoidable)
- **Always** use `--sq-*` radii and `--color-*` tokens — never hardcode `rounded-lg`, `rounded-[12px]`, or hex colors
- **Always** use GSAP + `useGSAP` from `@/lib/gsap-client` for animations (never raw CSS keyframes for anything non-trivial)
- **Always** gate animations on `prefers-reduced-motion: reduce`
- **Server Components by default** — `'use client'` only when refs / hooks / browser APIs are needed
- **Mobile first** — test at 375 px before adding larger breakpoints
- **₹ for prices** — use `<PriceDisplay>`, never raw string interpolation
- **+91 for phones** — always show the prefix in form inputs
- Before modifying a shared component, check its imports via `docs/CODEMAPS/components.md`
- Shared components in `src/components/shared/` are owned by `bp-ui-public` — other agents should treat them as read-only

---

## 11. Quick Reference Cheat Sheet

```tsx
// Primary CTA
<button className="rounded-[var(--sq-sm)] bg-bp-accent text-white font-semibold px-6 py-3 hover:bg-[#E95A28]">Book session</button>

// Card
<div className="rounded-[var(--sq-md)] bg-white border border-bp-border shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">…</div>

// Section container
<section className="max-w-[1142px] mx-auto px-6 lg:px-[60px] py-16 lg:py-24">…</section>

// Status pill
<span className="rounded-[var(--sq-xs)] bg-bp-primary-light text-bp-primary-dark text-[12px] font-semibold px-2.5 py-1">Verified</span>

// GSAP-ready section
<section ref={scope} data-reveal-root>
  <div data-reveal>…</div>
  <div data-reveal>…</div>
</section>
```
