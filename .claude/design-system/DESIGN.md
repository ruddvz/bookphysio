# BookPhysio.in — Design System

> Single source of truth for all UI agents. Reference: `docs/superpowers/specs/bpdesign.md`
> Inspired by Zocdoc, adapted for Indian physiotherapy market.

---

## 1. Design Identity

| Attribute | Value |
|---|---|
| **Aesthetic** | Clean medical SaaS — white cards, teal accents, trust-forward |
| **Layout Model** | Full-width sections (homepage), sidebar + content (dashboards) |
| **Typography** | `Inter` via Google Fonts (all weights, system sans-serif fallback) |
| **Inspiration** | Zocdoc.com — search-first, doctor cards, sticky booking |

---

## 2. Design Tokens

### Colors

| Token | Value | Usage |
|---|---|---|
| Primary teal | `#00766C` | Buttons, links, nav accents, doctor badges |
| Primary dark | `#005A52` | Hover states, active states |
| Primary light | `#E6F4F3` | Chip backgrounds, light teal surfaces |
| Accent / CTA | `#FF6B35` | Primary call-to-action buttons only |
| Surface | `#F5F5F5` | Section backgrounds, input fields |
| Body bg | `#F7F8F9` | Page background |
| Body text | `#333333` | Headings and primary body text |
| Muted text | `#666666` | Secondary text, labels, timestamps |
| Border | `#E5E5E5` | Card borders, dividers |
| White | `#FFFFFF` | Cards, modals, nav background |
| Error | `#DC2626` | Form validation errors |
| Success | `#16A34A` | Success states, verified badges |
| Warning | `#F59E0B` | Warnings, pending states |

### Radii & Shadows

| Token | Value | Usage |
|---|---|---|
| Card radius | `8px` | All cards (DoctorCard, dashboard cards, form cards) |
| Button radius | `24px` | All buttons (pill shape) |
| Input radius | `8px` | Text inputs, selects, textareas |
| Modal radius | `16px` | Modals, dialogs |
| Shadow card | `0 2px 8px rgba(0,0,0,0.06)` | Default card elevation |
| Shadow hover | `0 4px 16px rgba(0,0,0,0.12)` | Card hover state |
| Shadow modal | `0 8px 32px rgba(0,0,0,0.16)` | Modals, dropdowns |

### Layout

| Token | Value |
|---|---|
| Max content width | `1142px` |
| Side padding (desktop) | `60px` |
| Side padding (mobile) | `24px` |
| Sidebar width | `240px` (dashboards) |
| Section gap | `64px` (homepage sections) |

---

## 3. Typography

| Role | Size | Weight | Color |
|---|---|---|---|
| Page title (h1) | `32px` | `700` | `#333333` |
| Section heading (h2) | `28px` | `700` | `#333333` |
| Card title | `18px` | `600` | `#333333` |
| Body text | `15px` | `400` | `#333333` |
| Small text / labels | `13px` | `500` | `#666666` |
| Button text | `15px` | `600` | white (on teal) |
| Nav links | `15px` | `500` | `#333333` |
| Price display | `18px` | `700` | `#333333` |

---

## 4. Breakpoints

| Name | Width | Notes |
|---|---|---|
| Mobile | `375px` | Single column, hamburger menu, stacked cards |
| Tablet | `768px` | 2-column grids, collapsed sidebar |
| Desktop | `1280px` | Full layout, sidebar visible, 3-column grids |

**Rule:** Mobile-first design. All components must work at 375px.

---

## 5. Component Patterns

### 5a. Navbar
- White background, `box-shadow: 0 1px 4px rgba(0,0,0,0.08)`, sticky top, `z-index: 50`
- Left: SVG logo + "BookPhysio" text
- Center: nav links (Browse Specialties dropdown, Search, How It Works)
- Right: "Log in" text link + "Sign up" teal pill button
- Mobile (<768px): hamburger menu, slide-out drawer

### 5b. DoctorCard
- White card, `8px` radius, hover shadow
- Avatar (80px circle), doctor name + credentials, specialty, star rating + review count
- Location with distance, next available slot, visit type badges (teal pills)
- Fee in ₹ (integer rupees), "Book Session →" teal button
- ICP verified badge (green checkmark) if verified

### 5c. Sidebar Nav (Dashboards)
- 240px wide, white bg, border-right
- Logo at top, user info below
- Nav items: icon + label, active state = teal bg + white text
- Logout at bottom
- Mobile: slide-out drawer triggered by hamburger

### 5d. Form Cards (Auth, Booking)
- Centered, max-width 480px, white card, 16px padding
- Logo at top, heading below
- Teal submit buttons (full width, 24px radius)
- "or" divider with Google OAuth option
- Error messages in red below inputs

### 5e. Status Badges
- Pill shape (24px radius), small text
- Confirmed: teal bg, white text
- Pending: yellow bg, dark text
- Cancelled: red bg, white text
- Completed: green bg, white text

---

## 6. India-Specific Rules

| Rule | Implementation |
|---|---|
| Currency | `₹` prefix, integer rupees — NEVER paise, NEVER `$` |
| GST | 18%, computed server-side: `Math.round(fee * 0.18)` |
| Phone | `+91` prefix shown in forms, E.164 in DB, Zod: `z.string().regex(/^\+91[6-9]\d{9}$/)` |
| Pincode | 6-digit: `z.string().regex(/^[1-9][0-9]{5}$/)` |
| Auth primary | Phone OTP via MSG91, not email/password |
| Provider credential | ICP registration number (Indian credential) |
| Visit types | `in_clinic`, `home_visit` (key India differentiator), `online` |
| Date format | DD/MM/YYYY in UI, ISO 8601 in DB |
| Cities | Delhi, Mumbai, Bangalore, Chennai, Hyderabad, Pune, Kolkata, Ahmedabad, Jaipur, Surat |

---

## 7. Agent Instructions

- **Always use** Tailwind classes — never inline styles, never raw CSS
- **Always use** design tokens from this file — never hardcode hex colors
- **Server Components by default** — `'use client'` only when hooks/interactivity needed
- **Mobile first** — every component must work at 375px before adding tablet/desktop styles
- **₹ for prices** — use `<PriceDisplay>` component, never raw string interpolation
- **+91 for phones** — always show prefix in form inputs
- Before modifying a shared component, check which pages import it via CODEMAPS
