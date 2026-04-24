# bookphysio.in — Execution Plan

> Roadmap with phase checkboxes. Orchestrator reads this at startup.
> `[ ]` = pending, `[x]` = done, `[~]` = built but needs polish/wiring
>
> **STATUS AS OF 2026-04-08: Phase 14 COMPLETE ✅ · Phase 15 rollout in final launch window · Phase 11.6 PAUSED**
> Production hosting target is Vercel. Apex is live, analytics/robots/IndexNow are wired, Search Console and Bing sitemap submission are complete, Supabase migrations `025` → `029` are applied in production, and the latest auth/privacy polish release is now deployed on apex.
> Remaining rollout work is operational: add real production provider data and run a wider live smoke pass on apex. `www` DNS, notification cleanup cron, and the JWT role custom claim hook are follow-up items rather than launch blockers.

---

## PHASE 0 — Project Setup
- [x] Define tech stack (Next.js 15, Supabase, Razorpay, MSG91, Resend, Upstash)
- [x] Scaffold project structure (App Router, route groups, lib/, api/)
- [x] Configure TypeScript, ESLint, Tailwind CSS v4
- [x] Set up Vitest / testing infrastructure
- [x] Configure GitHub Actions CI/CD
- [x] Set up environment variables (.env.example documented)
- [x] Supabase migrations (001_initial_schema, 002_rls_policies, 003_indexes)
- [x] Seed data (specialties, cities, mock providers)
- [x] All API routes scaffolded (auth, providers, appointments, payments, reviews, notifications, admin, upload)
- [x] TypeScript contracts published (src/app/api/contracts/)
- [x] External service clients (Razorpay, MSG91, Resend, Upstash)
- [x] Zod validation schemas (auth, provider, booking, payment, review, search)
- [x] Middleware (auth route protection + Upstash rate limiting)

---

## PHASE 1 — Public Pages (Sprint 1)
- [~] Homepage — all sections built, needs visual polish pass
- [~] Search Results (`/search`) — built, mock data fallback, map view stub
- [~] Doctor Profile (`/doctor/[id]`) — built, BookingCard wired, needs polish
- [~] Specialty article pages (`/specialties/[slug]`) — built; former `/specialty/*` removed (301 to `/specialties/*`)
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
- [x] **11.4** Account Recovery & Search Simplification
  - [x] Forgot Password stub replaced with real Supabase Reset/OTP logic
  - [x] Removed live map integration from scope; search remains list-first with lightweight location cues only
- [ ] **11.5** Mobile app (React Native / Expo) — P3
- [~] **11.6** Multi-language (Hindi) — PAUSED (Future Milestone)
  - [x] Added English/Hindi locale switcher for public static pages
  - [x] Added Hindi routes for About, FAQ, How It Works, Privacy, and Terms
  - [x] Added bilingual metadata alternates and sitemap coverage for the Hindi static routes
  - [ ] Search, auth, booking, and dashboard flows remain English-only (Work Suspended)

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

## PHASE 14 — Deploy Readiness & Code Quality ✅

> Comprehensive pre-production audit: eliminate build warnings, fix broken PWA assets, harden CSP, clean unused code.

- [x] Removed `ignoreBuildErrors: true` from `next.config.ts`
- [x] Removed dead `gleo` dependency; cleaned `transpilePackages`
- [x] Removed `--webpack` flag from build script (Turbopack by default)
- [x] CSP hardened: removed `unsafe-eval`, added Razorpay, removed dead legacy map entries
- [x] AI SDK config production warning suppressed (`experimental.telemetry` guard)
- [x] MSG91 dev logs cleaned (conditional debug only)
- [x] `CookieConsent` component created and wired into `layout.tsx`
- [x] IndexNow key file created at `public/9e3b426a8d844146a2ee1fac2c3fc665.txt`
- [x] `public/manifest.json` all icon paths fixed: `icon.svg` → `icon.png` (file exists)
- [x] Dead legacy map CSP entries removed from `next.config.ts` connect-src
- [x] `isAdminPath` unused import removed from `src/middleware.ts`
- [x] Mass lint cleanup: ~90 unused imports eliminated across ~35 source files
  - Lucide icon imports, `cn`, unused hooks, `Link`, unused variables
- [x] 4 `<img>` → `<Image>` replacements (Next.js image optimization)
  - `BookingInner.tsx`, `ClinicGallery.tsx`, `appointments/[id]/page.tsx`, `profile/page.tsx`
- [x] `AuthContext.tsx` useEffect missing dep fix (eslint-disable, queryClient is stable)
- [x] `BpLogo.tsx` updated: removed `icon.png` + text span → `logo.png` full wordmark

**Verification results:**
- Build: ✅ exit 0 (91 static pages)
- Lint: ✅ 0 warnings, 0 errors (was ~90 warnings)
- TypeCheck: ✅ 0 errors
- Tests: ✅ 220/220 passing

---

## PHASE 15 — Post-Launch Growth (upcoming)

- [x] **15.1** Set `GOOGLE_GENERATIVE_AI_API_KEY` in Vercel env → enable AI chatbot in production
  - Confirmed already present in Development / Preview / Production Vercel environments
- [ ] **15.2** Google Search Console verification (submit sitemap, verify domain ownership)
- [ ] **15.3** Bing Webmaster Tools submission
- [x] **15.4** IndexNow ping automation on content publish
  - Deploy workflow now runs `npm run ping:indexnow` as a best-effort post-deploy step
- [x] **15.5** Vercel Analytics integration (`@vercel/analytics` package)
  - Tracking is consent-gated and restricted to public marketing/search routes only
- [x] **15.6** Domain cutover: bookphysio.in → Vercel (retire GitHub Pages)
  - `bookphysio.in` is live on Vercel
  - `www.bookphysio.in` confirmed working via Vercel
- [~] **15.7** End-to-end smoke test in production after domain cutover
  - Apex smoke checks passed for `/`, `/search`, `/sitemap.xml`, `/robots.txt`, and the IndexNow key file
  - Auth smoke checks now pass for `/login`, `/signup`, and the English-only `/hi/login` redirect
  - Public providers API no longer returns `500`; runtime fallback deployed while `search_providers_v2` DB migration awaits authenticated apply access
  - Repo fix ready for next deploy: public pages no longer treat the missing demo-session state as a 404 error during auth hydration
  - Production dataset currently returns zero public providers, so results rendering remains data-limited rather than route-broken
- [x] **15.8** Launch hardening: pending provider approvals, tracked pay-at-clinic bookings, live homepage proof/reviews, sortable search, and live availability previews

---

## PHASE 16 — Premium UI/UX Redesign (ui-v2, flag-gated)

> Additive redesign behind `NEXT_PUBLIC_UI_V2` / `bp_ui=v2` / `?ui=v2`. v1 stays default until **16.42**.

### Done (summary)

| Range | Theme |
|-------|--------|
| **16.1–16.10** | Foundations: dashboard primitives, Navbar, hero + specialty rails, dashboard chrome, patient/provider/admin pulse rails, homepage `revealOnScroll()` safety |
| **16.11–16.15** | Public + booking: auth, `/search`, `/how-it-works`, `/doctor/[id]` + `/city/[slug]`, `/book/[id]` |
| **16.16–16.22** | Patient: appointments, payments, records, messages, notifications, profile, PAI/Motio, patient search |
| **16.24–16.32** | Provider: appointments, calendar/availability, earnings, patients, profile, AI assistant, messages/notifications, bills, pending |
| **16.33–16.35** | Admin: listings, users, analytics |
| **16.36–16.37** | Static legal pages + Hindi `/hi/*` mirrors |
| **16.38–16.40** | Recharts on full charts, command palette (⌘K), notification drawer |

Per-slice detail and PR references live in `CHANGELOG.md` and git history.

### Remaining

- [ ] **16.23** Specialty hero + after-image slots — wire uploads into `SPECIALTIES` / `SpecialtyCTARail` when assets arrive; tune per-specialty backgrounds *(often blocked on incoming uploads)*.
- [x] **16.41** Pulse de-dupe — removed `<PatientInsightsStrip>` from `src/app/patient/dashboard/page.tsx` (kept `<PatientCarePulse>` right rail); removed `<AdminPulse>` and its now-dead analytics query from `src/app/admin/page.tsx` (kept `<AdminPulseRail>`). Component files stay on disk.
- [x] **16.42** Default-on — **(a)** `NEXT_PUBLIC_UI_V2=true` added to `.env.example`. **(b)** Stripped `useUiV2()` early-return guards from 9 components + `NotificationDrawer` conditional; updated 11 test files. Tests: 843 passed (11 pre-existing failures unchanged).

---

## PHASE 17 — Search Fixes + ID Compaction

> Source plan: `docs/superpowers/plans/2026-04-18-search-fixes-and-id-compaction.md`
> Implemented on branch `cursor/phase-17-search-fixes-5f15` (merge of PR #105 plan + code). Apply migrations `044` + `045` in Supabase after deploy.

- [x] **17.1** Fix unapproved provider leak — add `.eq('verified', true).eq('approval_status', 'approved')` to fallback in `src/app/api/providers/route.ts:282`; extract `applyPublicProviderFilters()` to `src/app/api/providers/filters.ts`; new migration `044_search_providers_approval_gate.sql`
- [x] **17.2** Compact search header — `sr-only` breadcrumb + `BreadcrumbList` JSON-LD + single-line h1 (`N physios · City`) + mobile filter chip (`src/app/search/SearchContent.tsx:229–254`)
- [x] **17.3** City filter typeahead — new `src/components/search/CitySearchCombobox.tsx` (12 popular chips + `useDeferredValue` typeahead, cap 20); replace flat `CITIES` list in `src/app/search/SearchFilters.tsx:16,216,370`
- [x] **17.4** Mobile reels snap-scroll (ui-v2 only) — new `src/app/search/SearchResultsReels.tsx` + `src/components/DoctorCardCompact.tsx`; branch in `SearchContent.tsx` results section (`isV2 && < md` → reels, otherwise existing grid)
- [x] **17.5** Shorten display IDs — new migration `045_shorter_display_ids.sql` (providers 6-digit `100000+`, patients 7-digit `1000000+`); safe DO block guards existing rows

---

## ROADMAP (future)
- Mobile app (React Native / Expo)
- Multi-language support (Hindi, regional languages)
- AI-powered physio matching
