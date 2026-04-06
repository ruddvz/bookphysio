# bookphysio.in — Active Bug & Task Queue

> This file is the live queue. Orchestrator reads this at startup.
> Format: one entry per task, newest first.
> Status: `[ ]` pending · `[>]` in progress · `[x]` done

---

## ✅ COMPLETION STATUS: Phase 14 complete, Phase 11.6 slice in progress ✓

**Last updated:** 2026-04-04

## Hosting
- [x] Production hosting target is Vercel; GitHub Pages is legacy and should be retired after the cutover is verified.

## 🚀 Phase 15 — Rollout Status
- [x] Apex production deploy is live on `https://bookphysio.in`
- [x] `GOOGLE_GENERATIVE_AI_API_KEY` confirmed present in Vercel Development / Preview / Production
- [x] Vercel Analytics integrated with consent-gated public-route tracking only
- [x] IndexNow key is live and deploy automation is wired best-effort in GitHub Actions
- [x] `robots.txt` is now generated from `src/app/robots.ts` with private surfaces blocked
- [x] Stale `NEXT_PUBLIC_MAPBOX_TOKEN` removed from Vercel environment variables
- [~] Repo fix ready for next deploy: empty-state `GET /api/auth/demo-session` now returns `204` so public pages stop logging a 404 when no demo session exists
- [~] Public providers search no longer 500s in production; a runtime fallback is deployed while the forward Supabase RPC migration still needs authenticated apply access
- [~] Forward Supabase migration added to restrict public `availabilities` reads to unbooked slots for verified active providers; authenticated apply access is still required before calling production fully rolled out
- [~] Production smoke pass completed on apex domain; public pages, sitemap, robots, and providers API return `200`
- [ ] External follow-up: Google Search Console verification + sitemap submission
- [ ] External follow-up: Bing Webmaster Tools submission
- [ ] External follow-up: `www.bookphysio.in` DNS still needs registrar-side configuration
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
- [ ] External follow-up: Google Search Console verification + sitemap submission
- [ ] External follow-up: Bing Webmaster Tools submission

### Medium Priority (P2)
- None at this time

### Low Priority (P3)
- [ ] **11.5** Mobile app (React Native / Expo)
- [~] **11.6** Multi-language support

---

## Completed Work This Session

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

## Current Focus: Phase 11.6 — Multi-language static pages
- [x] English/Hindi locale switcher added to public static pages
- [x] Hindi routes added for About, FAQ, How It Works, Privacy, and Terms
- [x] Hindi static routes added to sitemap and metadata alternates
- [ ] Search, auth, booking, and dashboard flows remain English-only

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
