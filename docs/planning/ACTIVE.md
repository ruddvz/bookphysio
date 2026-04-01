# bookphysio.in — Active Bug & Task Queue

> This file is the live queue. Orchestrator reads this at startup.
> Format: one entry per task, newest first.
> Status: `[ ]` pending · `[>]` in progress · `[x]` done

---

## ✅ COMPLETION STATUS: Phase 10 Complete, Phase 11.1-11.3 Done ✓

Latest Session Work (2026-04-01 continued):
- [x] Fixed Vitest configuration (excluded Server Component tests, added rpc mock)
- [x] All 68 tests passing ✓
- [x] **11.1 — Test Suite Fixed** ✓
- [x] **11.2 — Messages System Backend + UI** ✓
  - DB: messages + conversations tables with RLS, read_at timestamps
  - API: 4 endpoints (GET/POST conversations, messages, read)
  - Patient UI: Real API, conversations list, message thread, React Query
  - Provider UI: Mirror of patient (provider perspective)
  - Build green ✓ | Tests green (68/68) ✓ | Commit done ✓
- [x] **11.3 — Admin Analytics Dashboard** ✓
  - API: /api/admin/analytics — KPIs, monthly GMV, monthly appointments
  - UI: KPI cards + Revenue Pulse SVG chart wired to real data (React Query)
  - Build green ✓ | Tests green (68/68) ✓ | Commit done ✓

---

## NEXT PHASE (Phase 11 — Post-Launch Features)

### Currently In Progress
- Nothing in progress

### High Priority (P1)
- No P1 items remaining

### Medium Priority (P2)
- None at this time

### Low Priority / Deferred (P3)
- [ ] **11.4** Telehealth (100ms video rooms integration) — very low priority, do last

### Low Priority (P3)
- [ ] **11.5** Mobile app (React Native / Expo)
- [ ] **11.6** Multi-language support
- [ ] **11.7** Insurance partnerships

---

## Completed Work This Session

- [x] Deployed fix: skip Vercel workflow (GitHub Pages only)
- [x] Deployed fix: Vitest configuration + mock setup
- [x] Deployed feature: Map city selection flow + provider highlighting
- [x] Committed: 3 commits since session start (all green)

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

| # | Area | Issue | Priority | Status |
|---|------|-------|----------|--------|
| 1 | Search | Map view is a stub (no Mapbox integration yet) | P2 | Open |
| 2 | Auth | OTP 6-digit inputs may not have auto-advance | P1 | ~~Done (8.4)~~ |
| 3 | Doctor Signup | 5-step progress indicator fidelity | P2 | ~~Done (8.5)~~ |
| 4 | Booking | Razorpay not wired — "Pay" button is UI-only | P1 | ~~Done~~ |
| 5 | Patient Dashboard | All data is mock/hardcoded | P2 | ~~Done (Phase 9)~~ |
| 6 | Provider Dashboard | All data is mock/hardcoded | P2 | ~~Done (Phase 9)~~ |
| 7 | Admin | Analytics page is a stub | P3 | ~~Done (11.3)~~ |
| 8 | Messages | Both patient + provider message pages are stubs | P3 | ~~Done (11.2)~~ |
| 10 | Global | CI/CD (GitHub Actions) not configured | P3 | ~~Done (10.2)~~ |
| 11 | Homepage | InsurancePlans section not built — post-launch only | P3 | Deferred |

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
