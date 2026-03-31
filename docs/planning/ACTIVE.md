# bookphysio.in — Active Bug & Task Queue

> This file is the live queue. Orchestrator reads this at startup.
> Format: one entry per task, newest first.
> Status: `[ ]` pending · `[>]` in progress · `[x]` done

---

## Current Focus: Phase 8 — UI Polish (one step at a time)

> Working through EXECUTION-PLAN.md Phase 8 steps sequentially.
> Each step = one conversation turn = one commit.

### Next up: Step 8.16 — Mobile Responsiveness Pass (375px)

### Remaining Phase 8 Steps (with test gate)

> Each step is done only when Status = [x] AND Tests = [x].
> FEATURES.md Tests field is authoritative. This list is a convenience mirror.

- [x] **8.7** Patient Dashboard Polish
  - tests: [x] Vitest: date formatting, mock data shape | Playwright: patient sees upcoming appointment
- [x] **8.8** Patient Appointments Polish
  - tests: [x] Vitest: tab state, filter logic | Playwright: patient views list and detail
- [x] **8.9** Provider Dashboard Polish
  - tests: [x] Vitest: stats display formatting | Playwright: provider sees today's appointments
- [x] **8.10** Provider Calendar Polish
  - tests: [x] Vitest: slot render logic | Playwright: provider views 7-day calendar
- [x] **8.11** Provider Availability Polish
  - tests: [x] Vitest: toggle logic, hours validation | Playwright: provider saves availability
- [x] **8.12** Provider Earnings Polish
  - tests: [x] Vitest: INR amount formatting | Playwright: provider views earnings summary
- [x] **8.13** Admin Dashboard Polish
  - tests: [x] Vitest: stats display formatting | Playwright: admin accesses dashboard
- [x] **8.14** Specialty/City Landing Pages
  - tests: [x] Vitest: generateMetadata() slug → title/description | Playwright: landing page <title> correct
- [x] **8.15** Static Pages Polish
  - tests: [x] Vitest: content matches spec | Playwright: static routes 200 OK
- [x] **8.16** Mobile Responsiveness Pass 📱
  - [x] Run comprehensive audit at 375px viewport. USER_FLOWS.md complete)*
  - tests: [x] (none) | Playwright: flows 1, 2, 6 at 375px viewport
- [x] **8.17** Empty States and Loading Skeletons
  - [x] Create generic `Skeleton` and `EmptyState` components.
  - [x] Apply to Search page, Patient Dashboard, and Appointments.
  - [x] Add `loading.tsx` for Doctor Profile, Dashboard, and Admin.
  - tests: [x] Vitest: skeleton/empty state unit tests | Playwright: empty state visibility tests

---

## Current Focus: Phase 10 — Testing & Launch
- [x] **10.1** Full test suite passes (94 Vitest + 34 Playwright)
- [x] **10.2** GitHub Actions CI/CD pipeline (ci.yml: Vitest + tsc on PR/push)
- [x] **10.3** Supabase production setup guide (docs/SUPABASE-PRODUCTION-SETUP.md)
- [x] **10.4** Domain + deployment (GitHub Pages → bookphysio.in, CNAME, deploy.yml updated)
- [x] **10.5** Smoke test all flows end-to-end

## Completed: Phase 9 — Real API Wiring
- [x] **9.1** MSG91 Auth Wiring (Send/Verify)
- [x] **9.2** Live Search Wiring (`/api/providers`)
- [x] **9.3** Live Doctor Profile Wiring
- [x] **9.4** Live Booking Wiring
- [x] **9.5** Live Patient Dashboard Wiring (Appointments API)
- [x] **9.6** Live Provider Portal Wiring
- [x] **9.7** Live Admin Panel Wiring (Stats API)

---

## Known Issues / Gaps

| # | Area | Issue | Priority |
|---|------|-------|----------|
| 1 | Search | Map view is a stub (no Mapbox integration yet) | P2 |
| 2 | Auth | OTP 6-digit inputs may not have auto-advance | P1 |
| 3 | Doctor Signup | 5-step progress indicator fidelity | P2 |
| 4 | Booking | Razorpay not wired — "Pay" button is UI-only | P1 |
| 5 | Patient Dashboard | All data is mock/hardcoded | P2 |
| 6 | Provider Dashboard | All data is mock/hardcoded | P2 |
| 7 | Admin | Analytics page is a stub | P3 |
| 8 | Messages | Both patient + provider message pages are stubs | P3 |
| 10 | Global | CI/CD (GitHub Actions) not configured | P3 |
| 11 | Homepage | InsurancePlans section not built — post-launch only | P3 |

---

## Completed This Session (2026-03-29)
- [x] Pushed 11 modified files + E2E scaffold to main
- [x] Inline SVG logo in Navbar + auth pages
- [x] Hero illustration: doctor card, booking confirmation, stats pill
- [x] HowItWorks: step numbers, teal CTA links, border polish
- [x] Added /patient + /provider to middleware protected routes
- [x] Playwright config + ui-audit script + Supabase config added
- [x] EXECUTION-PLAN.md updated to reflect true build state
- [x] **8.1 Homepage Polish** — TopSpecialties hrefs, AppSection mobile, ProviderCTA mobile, Footer mobile padding, InsurancePlans deferred to P3
- [x] **8.2 Search Results Polish** — filters wired to URL params, init from URL, clear all, mobile drawer, Map View "Soon" badge
- [x] **8.3 Doctor Profile Polish** — Today label on date picker, BookingCard max-height overflow, mobile sticky booking bar, rating pill in hero
- [x] **8.4 Auth Pages Polish** — BpLogo extracted to shared component, OTP autoFocus + auto-submit + type="tel", blur validation on login/signup, loading state color consistency, forgot-password Zod validation + loading
- [x] **8.5 Doctor Signup Polish** — BpLogo + Tailwind card, numbered progress indicator (circles with checkmarks, filled connectors), PrimaryButton Tailwind + correct disabled color, BackLink lucide ArrowLeft, Step 5 OTP autoFocus + auto-submit + paste, a11y aria-labels on availability grid
- [x] **8.6 Booking Wizard Polish** — SVG step progress bar with filled connectors, teal SVG check icon on StepSuccess, Add to Calendar ICS download, UPI ID inline validation, Pay button disabled until valid UPI ID
