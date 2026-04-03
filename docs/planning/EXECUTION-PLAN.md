# bookphysio.in — Execution Plan

> Roadmap with phase checkboxes. Orchestrator reads this at startup.
> `[ ]` = pending, `[x]` = done, `[~]` = built but needs polish/wiring
>
> **STATUS AS OF 2026-04-01: Phase 10 COMPLETE ✅**
> All development phases 0-10 are done. Production hosting target is now Vercel; stale GitHub Pages references below are legacy until the cutover is fully verified.
> Phase 11+ are post-launch features.

---

## PHASE 0 — Project Setup
- [x] Define tech stack (Next.js 15, Supabase, Razorpay, MSG91, Resend, Mapbox, Upstash)
- [x] Scaffold project structure (App Router, route groups, lib/, api/)
- [x] Configure TypeScript, ESLint, Tailwind CSS v4
- [x] Set up Vitest / testing infrastructure
- [x] Configure GitHub Actions CI/CD
- [x] Set up environment variables (.env.example documented)
- [x] Supabase migrations (001_initial_schema, 002_rls_policies, 003_indexes)
- [x] Seed data (specialties, cities, mock providers)
- [x] All API routes scaffolded (auth, providers, appointments, payments, reviews, notifications, admin, upload)
- [x] TypeScript contracts published (src/app/api/contracts/)
- [x] External service clients (Razorpay, MSG91, Resend, Mapbox, Upstash)
- [x] Zod validation schemas (auth, provider, booking, payment, review, search)
- [x] Middleware (auth route protection + Upstash rate limiting)

---

## PHASE 1 — Public Pages (Sprint 1)
- [~] Homepage — all sections built, needs visual polish pass
- [~] Search Results (`/search`) — built, mock data fallback, map view stub
- [~] Doctor Profile (`/doctor/[id]`) — built, BookingCard wired, needs polish
- [~] Specialty Landing (`/specialty/[slug]`) — built, minimal styling
- [~] City Landing (`/city/[slug]`) — built, minimal styling
- [x] Shared components (DoctorCard, Avatar, StarRating, VisitTypeBadge, PriceDisplay, StatusBadge, PageHeader, SidebarNav)

---

## PHASE 2 — Auth Pages (Sprint 2)
- [~] Patient Signup (`/signup`) — built, needs OTP flow polish
- [~] OTP Verify (`/verify-otp`) — built, needs 6-digit input auto-advance
- [~] Login (`/login`) — built, inline SVG logo done
- [~] Doctor Signup (`/doctor-signup`) — built, 5-step form scaffolded

---

## PHASE 3 — Booking Flow (Sprint 3)
- [~] Booking Wizard (`/book/[id]`) — all 3 steps built (StepConfirm, StepPayment, StepSuccess)
- [x] Razorpay checkout integration (real payment flow)
- [ ] Booking confirmation email via Resend → **[x] Done (11.4 session)**

---

## PHASE 4 — Patient Dashboard (Sprint 4)
- [~] Layout + sidebar nav (`/patient/layout.tsx`) — built
- [~] Dashboard home (`/patient/dashboard`) — built, mock data
- [~] Appointments list (`/patient/appointments`) — built
- [x] Appointment detail (`/patient/appointments/[id]`) — wired to real API, cancel action, join session logic
- [x] Profile & settings (`/patient/profile`) — wired to real API, save full_name, polished UI
- [x] Payment history (`/patient/payments`) — wired to real API
- [~] Notifications (`/patient/notifications`) — built
- [~] Messages (`/patient/messages`) — built (stub)

---

## PHASE 5 — Doctor Portal (Sprint 5)
- [~] Layout + sidebar nav (`/provider/layout.tsx`) — built
- [~] Provider dashboard (`/provider/dashboard`) — built, stub data
- [~] Calendar (`/provider/calendar`) — built, weekly grid stub
- [~] Appointments list (`/provider/appointments`) — built
- [~] Patient records (`/provider/patients`) — built
- [~] Availability settings (`/provider/availability`) — built
- [~] Earnings (`/provider/earnings`) — built
- [~] Practice profile (`/provider/profile`) — built
- [~] Messages (`/provider/messages`) — built (stub)
- [~] Notifications (`/provider/notifications`) — built (stub)

---

## PHASE 6 — Admin Panel (Sprint 6)
- [~] Layout + sidebar nav (`/admin/layout.tsx`) — built
- [~] Admin dashboard (`/admin`) — built
- [~] Provider approval queue (`/admin/listings`) — built
- [~] User management (`/admin/users`) — built
- [~] Analytics (`/admin/analytics`) — built (stub)

---

## PHASE 7 — Static Pages (Sprint 7)
- [~] How It Works (`/how-it-works`) — built
- [~] About (`/about`) — built
- [~] FAQ (`/faq`) — built
- [~] Privacy Policy (`/privacy`) — built
- [~] Terms of Service (`/terms`) — built
- [~] 404 Page (`/not-found.tsx`) — built

---

## PHASE 8 — UI Polish Pass (current focus)
> All pages exist. This phase makes them pixel-perfect and production-ready.
> Work one step at a time. Each step = one prompt = one commit.

- [x] **8.1** Homepage — hero illustration, section spacing, mobile breakpoints
- [x] **8.2** Search Results — filter sidebar polish, DoctorCard polish, map view toggle
- [x] **8.3** Doctor Profile — sticky BookingCard, slot picker, responsive layout
- [x] **8.4** Auth pages — OTP 6-digit auto-advance, form validation UX
- [x] **8.5** Doctor Signup — 5-step form polish, progress indicator
- [x] **8.6** Booking Wizard — step progress bar, GST breakdown, Razorpay button
- [x] **8.7** Patient Dashboard — upcoming card, quick actions, past appointments
- [x] **8.8** Patient Appointments — tabs (Upcoming/Past), detail page
- [x] **8.9** Provider Dashboard — today's summary stats, schedule timeline
- [x] **8.10** Provider Calendar — 7-day grid, booked/available/blocked slots
- [x] **8.11** Provider Availability — weekday toggles, working hours grid
- [x] **8.12** Provider Earnings — monthly summary, chart placeholder, transactions
- [x] **8.13** Admin Dashboard — platform overview stats
- [x] **8.14** Specialty/City landing pages — hero, filtered doctor grid
- [x] **8.15** Static pages (About, FAQ, How It Works) — content + layout polish
- [x] **8.16** Global: mobile responsiveness pass (375px breakpoint)
- [x] **8.17** Global: dark/empty states, loading skeletons

---

## PHASE 9 — Real API Wiring
- [x] Connect auth pages to MSG91 OTP (currently Supabase phone auth stub)
- [x] Wire search to live `/api/providers` with real Supabase data
- [x] Wire doctor profile to live `/api/providers/[id]`
- [x] Wire booking wizard to `/api/appointments` + Razorpay
- [x] Wire patient dashboard to real session + appointments API
- [x] Wire provider portal to real session + appointments API
- [x] Wire admin panel to real admin API routes

---

## PHASE 10 — Testing & Launch

> **Note (updated 2026-03-30):** Unit and E2E tests for Phases 8.7–8.17 are written incrementally alongside each step (see `docs/FEATURES.md` and `docs/superpowers/plans/2026-03-30-ai-workflow-integration.md`). By the time Phase 10 begins, a passing test suite already exists.
> Phase 10 scope: run the full suite, fix any failures, and configure CI/CD only. "Write all tests from scratch" is NOT Phase 10 work.

- [x] Full test suite passes (Vitest + Playwright) — fix any failures found
- [x] GitHub Actions CI/CD pipeline — run suite on every PR and push to main
- [x] Supabase production environment setup (guide: docs/SUPABASE-PRODUCTION-SETUP.md)
- [~] Domain + deployment (Vercel → bookphysio.in, GitHub Pages retired after cutover verification)
- [x] Smoke test all flows end-to-end

---

## PHASE 11 — Post-Launch Features

- [x] **11.1** Fix remaining test config issues
  - Fixed Vitest jsdom config, excluded Server Component tests
  - All 68 tests passing
- [x] **11.2** Messages System (patient-provider chat)
  - DB: messages + conversations tables with RLS
  - API: GET/POST /api/conversations, /api/messages, /api/conversations/[user_id]/messages, /api/conversations/[user_id]/read
  - UI: Patient messages page + Provider messages page wired to real API (React Query)
  - Tests: Message API integration tests created
- [x] **11.3** Admin Analytics Dashboard
  - DB: Aggregate queries via /api/admin/analytics (users, appointments, revenue, GMV)
  - UI: KPI cards + Revenue Pulse SVG chart wired to real API (React Query)
  - Monthly revenue data for last 7 months, completion rate, active patients, provider count
- [ ] **11.4** Advanced Interactions (Mapbox Live, Auth Wiring)
  - [x] Forgot Password stub replaced with real Supabase Reset/OTP logic
  - [ ] Mapbox Live Integration (currently SVG stub)
- [ ] **11.5** Mobile app (React Native / Expo) — P3
- [ ] **11.6** Multi-language support — P3
- [ ] **11.7** Insurance partnerships — P3

## PHASE 12 — UI Refresh (21st.dev-Inspired)

> Visual system update in progress. The goal is a calmer, editorial homepage and shared card language that feels more curated and less glossy.

- [x] Global tokens and typography refresh
- [x] Homepage hero, specialties, and how-it-works redesign
- [x] Trust/proof section retuned for clearer product value
- [x] Shared doctor card and loading state refresh
- [x] Navbar, FAQ, testimonials, and footer cleanup
- [x] Build verification and review

## PHASE 13 — AI + Operations Polish

> Extend the editorial treatment into the remaining demo-heavy surfaces so the product feels premium end-to-end.

- [x] Unified BookPhysio AI shell for patient and provider chat
- [x] Search empty state demo result cards
- [x] Admin overview, user registry, and approval queue refresh
- [x] Patient dashboard insight strip + AI shortcut
- [x] Provider dashboard AI shortcut
- [x] Build verification

---

## ROADMAP (future)
- Mobile app (React Native / Expo)
- Multi-language support (Hindi, regional languages)
- Insurance / corporate tie-ups
- AI-powered physio matching
