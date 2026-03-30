# bookphysio.in — Active Bug & Task Queue

> This file is the live queue. Orchestrator reads this at startup.
> Format: one entry per task, newest first.
> Status: `[ ]` pending · `[>]` in progress · `[x]` done

---

## Current Focus: Phase 8 — UI Polish (one step at a time)

> Working through EXECUTION-PLAN.md Phase 8 steps sequentially.
> Each step = one conversation turn = one commit.

### Next up: Step 8.7 — Patient Dashboard Polish

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
| 9 | Global | No loading skeletons or empty states | P2 |
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
