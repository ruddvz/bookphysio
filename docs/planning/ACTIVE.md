# bookphysio.in — Active Bug & Task Queue

> This file is the live queue. Orchestrator reads this at startup.
> Format: one entry per task, newest first.
> Status: `[ ]` pending · `[>]` in progress · `[x]` done

---

## ✅ DONE: Auth/Admin fixes plan (2026-04-17-auth-email-admin-fixes.md) — All 6 phases complete
- Phase 1: Password reset via Resend ✓ (PR #86)
- Phase 2: Doctor signup email OTP in Step 5 ✓ (PR #86)
- Phase 3: Admin dashboard real data only ✓ (PR #86)
- Phase 4: Google OAuth no OTP re-prompt ✓ (b6a1728)
- Phase 5: Provider approval state machine ✓ (b6a1728)
- Phase 6: Email infrastructure + admin alert ✓ (b6a1728)
- **User action required:** Apply migrations 042 + 043 in Supabase; set ADMIN_ALERT_EMAIL env var.

## 👉 NEXT UP: **Slice 16.21 `/patient/pai` + `/patient/motio` v2 AI-assistant shell (Part B P2)**

Slices 16.16–16.20 complete. Next is **16.21**: `/patient/pai` + `/patient/motio` — v2 AI-assistant shell with role=patient pulse tokens. ≥ 6 unit tests.

Full spec: `docs/planning/EXECUTION-PLAN.md` → Phase 16 → Part B → Priority 2 → 16.21.

Before starting: read `CHANGELOG.md` newest entry for any WIP handoff from the previous session.

---

## ✅ COMPLETION STATUS: Phases 14 + 15 live in production; Phase 16 (ui-v2) in full redesign rollout ✓

**Last updated:** 2026-04-18

---

## 🎨 Phase 16 — Premium UI/UX Redesign (ui-v2) — ACTIVE

> Flag-gated behind `NEXT_PUBLIC_UI_V2` / `bp_ui=v2` cookie / `?ui=v2`. See `docs/planning/EXECUTION-PLAN.md` Phase 16 for the full checklist.

### Shipped (Part A — 10 slices complete)
- [x] **16.1 – 16.4** Foundations, public Navbar, hero trust strip, specialty CTA rail
- [x] **16.5** Dashboard chrome — breadcrumbs + context strip
- [x] **16.6** Provider AI elevation
- [x] **16.7** Patient dashboard — `PatientCarePulse` + `PatientInsightsStrip`
- [x] **16.8** Provider dashboard — `ProviderPulse`
- [x] **16.9** Admin dashboard — `AdminPulse` + `AdminPulseRail`
- [x] **16.10** Homepage reveal safety — `revealOnScroll()` helper; fixes blank-sections-below-hero regression

### In progress (Part B — page redesign gaps)
**Priority 1 (public + auth, highest blast radius):**
- [x] **16.11** Auth surfaces (`/login`, `/signup`, `/doctor-signup`, `/verify-otp`, password reset flow)
- [x] **16.12** `/search` result cards
- [x] **16.13** `/how-it-works`
- [x] **16.14** `/doctor/[id]`, `/city/[slug]` (note: `/provider/[slug]` route doesn't exist — scope scaled to the two live routes)
- [x] **16.15** `/book/[id]` booking flow — `BookingV2TrustStrip` under the step rail
- [x] **16.16** `/patient/appointments` + `/patient/appointments/[id]` — v2 timeline day-grouped (in PR #93)
- [x] **16.17** `/patient/payments` — v2 ledger with Badge status + GST line (in PR #93 + #94)
- [x] **16.18** `/patient/records` — v2 summary tiles + visit-frequency Sparkline (in PR #93)
- [x] **16.19** `/patient/messages` + `/patient/notifications` — v2 thread layout, unread Badge, empty-state illustrations
- [x] **16.20** `/patient/profile` — v2 form chrome, avatar + pill fields, consent toggles

**Priority 2 (patient surfaces):** 16.16–16.23 — appointments ✓, payments, records, messages, notifications, profile, pai/motio, search, specialty images

**Priority 3 (provider surfaces):** 16.24–16.32 — appointments, calendar, availability, earnings, patients, profile, ai-assistant, messages, bills, pending

**Priority 4 (admin):** 16.33–16.35 — listings, users, analytics (+ Recharts)

**Priority 5 (static + Hindi):** 16.36–16.37

**Priority 6 (cross-cutting):** 16.38 Recharts · 16.39 Command palette · 16.40 Notification drawer · 16.41 Pulse de-dupe decision · 16.42 Flag flip to default-on

### Blockers / inbound
- Specialty hero images + "after" treatment images — uploading in 2–3 days (slice **16.23** waits for this)
- PR #83 (`claude/version-16.9-NV2gO`) — dashboard chrome + patient insights + admin pulse rail — open, both CodeRabbit findings resolved in commit `9c40b81`; ready to merge

---

## Hosting
- [x] Production hosting target is Vercel; GitHub Pages is legacy and should be retired after the cutover is verified.

## 🚀 Phase 15 — Rollout Status
- [x] Apex production deploy is live on `https://bookphysio.in`
- [x] `GOOGLE_GENERATIVE_AI_API_KEY` confirmed present in Vercel Development / Preview / Production
- [x] Vercel Analytics integrated with consent-gated public-route tracking only
- [x] IndexNow key is live and deploy automation is wired best-effort in GitHub Actions
- [x] `robots.txt` is now generated from `src/app/robots.ts` with private surfaces blocked
- [x] Stale `NEXT_PUBLIC_MAPBOX_TOKEN` removed from Vercel environment variables
- [x] Latest verified repo changes are live in production: empty-state `GET /api/auth/demo-session` returns `204`, public preview is production-gated by default, OTP flows keep raw phone numbers server-side, and the auth polish/privacy pass is deployed on apex
- [~] Public providers search no longer 500s in production; a runtime fallback is deployed while the forward Supabase RPC migration still needs authenticated apply access
- [x] Forward migration `029_restrict_public_availability_read.sql` applied in production; public `availabilities` reads are restricted to unbooked slots for verified active providers
- [~] Production smoke pass completed on apex domain; public pages, sitemap, robots, and providers API return `200`
- [x] External follow-up: Google Search Console verification + sitemap submission
- [x] External follow-up: Bing Webmaster Tools submission
- [x] External follow-up: `www.bookphysio.in` DNS confirmed working via Vercel
- [ ] External follow-up: production provider dataset is still empty (`/api/providers` returns zero results)

## ✅ Phase 14 — Deploy Readiness & Code Quality (DONE)
- [x] `ignoreBuildErrors: true` removed from next.config.ts
- [x] `gleo` dead dependency removed; `transpilePackages` cleaned
- [x] `--webpack` flag removed from build script (using default Turbopack)
- [x] CSP hardened: removed `unsafe-eval`, added Razorpay, removed dead legacy map entries
- [x] AI config production warning suppressed
- [x] MSG91 dev logs cleaned (info → conditional debug)
- [x] CookieConsent component created and wired to layout.tsx
- [x] IndexNow key created (`public/9e3b426a8d844146a2ee1fac2c3fc665.txt`)
- [x] `public/manifest.json` icon paths fixed (icon.svg → icon.png)
- [x] Dead legacy map entries removed from CSP connect-src
- [x] `isAdminPath` unused import removed from middleware.ts
- [x] Mass cleanup of ~90 unused imports across ~35 files
- [x] 4 `<img>` → `<Image>` replacements (BookingInner, ClinicGallery, appointments/[id], profile)
- [x] AuthContext useEffect dep lint fix
- [x] BpLogo updated to use `logo.png` full wordmark (removed icon.png + text span)
- [x] Build ✅ | Lint ✅ (0 warnings) | TypeCheck ✅ | Tests 220/220 ✅

## ✨ Current UI Refresh — BookPhysio AI + Premium Ops Pass
- [x] Unified patient and provider chat into BookPhysio AI
- [x] Search empty states upgraded with demo result cards
- [x] Admin overview, users, and approval queue refreshed
- [x] Dashboard AI shortcuts added for patient + provider flows
- [x] Build verification and review

## 🎨 Current UI Refresh — 21st.dev-Inspired Pass
- [x] Global tokens and chrome refresh
- [x] Homepage hero, specialties, how-it-works, and trust sections
- [x] Shared doctor cards and loading states
- [x] Build verification and review

Latest Session Work (2026-04-01):
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
- [x] **11.4 — Core Page Wiring (Launch Readiness)** ✓
  - Patient appointment detail: real API, cancel confirmation, booking flow polish
  - Provider appointment detail: real API, patient profile, clinical notes save
  - API: /api/appointments/[id] now includes patient_profile in response
  - API: /api/profile — GET + PATCH user profile
  - API: /api/payments — GET patient payment history
  - Patient profile page: real data, save full_name
  - Patient payments page: real payment history table
  - Booking confirmation email: wired into payments/verify (Resend, best-effort)
  - Build green ✓ | Tests green (68/68) ✓ | Pushed ✓

---

## NEXT PHASE (Phase 11 — Post-Launch Features)

### Currently In Progress
- [ ] **11.6** Multi-language (Hindi) — PAUSED (Future Milestone)
  - Hindi static-page slice implemented: `/hi/about`, `/hi/faq`, `/hi/how-it-works`, `/hi/privacy`, `/hi/terms`
  - Auth, Search, Booking stubs exist but work is suspended to focus on English launch
  - Locale switcher remains active for existing static pages

### High Priority (P1)
- [ ] Final launch verification (English-first)
- [ ] Deploy latest verified repo state
- [ ] Add real production provider data
- [ ] Run final production smoke pass

### Medium Priority (P2)
- None at this time

### Low Priority (P3)
- [ ] **11.5** Mobile app (React Native / Expo)
- [~] **11.6** Multi-language support

---

## Completed Work This Session

- [x] Launch hardening pass: provider onboarding now stays `provider_pending` until admin approval, approving a listing promotes the user role, pay-at-clinic bookings create pending payment records, homepage proof/reviews now pull live data, and search now supports sorting with real availability previews
- [x] Deployed fix: skip Vercel workflow (GitHub Pages only)
- [x] Deployed fix: Vitest configuration + mock setup
- [x] Deployed feature: Map city selection flow + provider highlighting
- [x] Committed: 3 commits since session start (all green)
- [x] Added consent-gated Vercel Analytics for public routes only
- [x] Added `src/app/robots.ts` and removed the static robots file
- [x] Added IndexNow deploy automation script + tests
- [x] Recovered production `/api/providers` with a relational-query fallback when `search_providers_v2` fails
- [x] Added a forward Supabase migration to repair `search_providers_v2` once authenticated DB access is available
- [x] Removed the public-page demo-session 404 console noise by changing empty-state GET hydration to `204 No Content`

---

## Current Focus: Final launch readiness
- [x] Push the latest verified auth/privacy and preview hardening changes to production
- [ ] Add real provider records so `/api/providers` and `/search` are useful on apex
- [ ] Re-run a live smoke pass after deploy and provider-data update
- [~] Hindi work is paused; treat non-How-It-Works flows as English-only unless explicitly revived

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
| 1 | Search | Live map integration removed from scope; list-first search retained | P2 | Closed |
| 2 | Auth | OTP 6-digit inputs may not have auto-advance | P1 | ~~Done (8.4)~~ |
| 3 | Doctor Signup | 5-step progress indicator fidelity | P2 | ~~Done (8.5)~~ |
| 4 | Booking | Razorpay not wired — "Pay" button is UI-only | P1 | ~~Done~~ |
| 5 | Patient Dashboard | All data is mock/hardcoded | P2 | ~~Done (Phase 9)~~ |
| 6 | Provider Dashboard | All data is mock/hardcoded | P2 | ~~Done (Phase 9)~~ |
| 7 | Admin | Analytics page is a stub | P3 | ~~Done (11.3)~~ |
| 8 | Messages | Both patient + provider message pages are stubs | P3 | ~~Done (11.2)~~ |
| 10 | Global | CI/CD (GitHub Actions) not configured | P3 | ~~Done (10.2)~~ |

---

## Completed This Session (2026-03-29)
- [x] Pushed 11 modified files + E2E scaffold to main
- [x] Inline SVG logo in Navbar + auth pages
- [x] Hero illustration: doctor card, booking confirmation, stats pill
- [x] HowItWorks: step numbers, teal CTA links, border polish
- [x] Added /patient + /provider to middleware protected routes
- [x] Playwright config + ui-audit script + Supabase config added
- [x] EXECUTION-PLAN.md updated to reflect true build state
- [x] **8.1 Homepage Polish** — TopSpecialties hrefs, AppSection mobile, ProviderCTA mobile, Footer mobile padding
- [x] **8.2 Search Results Polish** — filters wired to URL params, init from URL, clear all, mobile drawer, Map View "Soon" badge
- [x] **8.3 Doctor Profile Polish** — Today label on date picker, BookingCard max-height overflow, mobile sticky booking bar, rating pill in hero
- [x] **8.4 Auth Pages Polish** — BpLogo extracted to shared component, OTP autoFocus + auto-submit + type="tel", blur validation on login/signup, loading state color consistency, forgot-password Zod validation + loading
- [x] **8.5 Doctor Signup Polish** — BpLogo + Tailwind card, numbered progress indicator (circles with checkmarks, filled connectors), PrimaryButton Tailwind + correct disabled color, BackLink lucide ArrowLeft, Step 5 OTP autoFocus + auto-submit + paste, a11y aria-labels on availability grid
- [x] **8.6 Booking Wizard Polish** — SVG step progress bar with filled connectors, teal SVG check icon on StepSuccess, Add to Calendar ICS download, UPI ID inline validation, Pay button disabled until valid UPI ID
