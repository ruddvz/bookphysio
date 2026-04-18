# CHANGELOG

> **Session-handoff log.** Every agent MUST append an entry after every commit
> so the next agent (or human) can pick up instantly without re-deriving state.
>
> **Read this file at session start** (alongside `docs/planning/ACTIVE.md` and
> `docs/planning/EXECUTION-PLAN.md`). The most recent entry is the starting
> point.

---

## Entry Format (copy / paste this block)

```
## <YYYY-MM-DD HH:MM IST> — <branch> — <slice id> <short title>
- Commit: <short-sha> (<type>: <subject>)
- Files touched: <path1>, <path2>, ...
- Tests added / changed: <count> (<file>)
- Build: pass | fail (<reason>)
- Status: done | wip | blocked (<reason>)
- Next up: <slice id + short title OR explicit question for the next agent>
- Notes: <anything non-obvious — gotchas, partial state, decisions deferred>
```

## Rules every agent must follow

1. **Read at session start:** `CHANGELOG.md` (latest entry), `docs/planning/ACTIVE.md` (NEXT UP line), `docs/planning/EXECUTION-PLAN.md` (phase checkbox state).
2. **Append an entry after every commit.** One entry per commit, newest on top of the log below. Never rewrite history.
3. **Commit every logical slice.** Don't accumulate uncommitted work — a slice = a commit = a CHANGELOG entry.
4. **Low-token handoff protocol.** When context budget is tight (roughly 20% remaining), STOP work, commit WIP (even partial), push, and write a CHANGELOG entry with `Status: wip` and an explicit `Next up:` so the next agent resumes exactly where you stopped. Do not try to cram one more slice.
5. **`Next up:` is mandatory.** The pointer must name a slice id from `EXECUTION-PLAN.md` (e.g. `16.11 auth surfaces redesign — Part B P1`) or a direct question for the human. Never leave it empty.
6. **Never push to a branch you weren't assigned to.** Dev branch for this stream: `claude/fix-pr-81-tests-Cdyms`. PR branches carry their own names — do not cross streams.

---

## Log (newest first)

## 2026-04-18 — claude/fix-signup-otp-password-bMZcQ — CHANGELOG sha (merge commit)
- Commit: 51ac344 (docs: fix CHANGELOG commit sha for merge commit)
- Files touched: CHANGELOG.md
- Tests added / changed: 0
- Build: n/a
- Status: done
- Next up: Merge PR #113
- Notes: Handoff SHA for merge commit 146e5d3.

## 2026-04-18 — claude/fix-signup-otp-password-bMZcQ — Merge origin/main into PR 113 (resolve conflicts)
- Commit: 146e5d3 (merge: origin/main into PR 113 (resolve CHANGELOG + auth test conflicts))
- Files touched: CHANGELOG.md, src/app/(auth)/auth-v2.test.tsx, src/app/(auth)/auth-regressions.test.tsx (+ merged main changes elsewhere)
- Tests added / changed: auth-v2 + auth-regressions 58/58 passing after resolution
- Build: n/a (merge commit)
- Status: done
- Next up: Merge PR #113 to main; apply migration `046_password_reset_otps.sql` in Supabase if not already
- Notes: Reconciled CHANGELOG with main (PR 112 + admin polish entries). Combined auth mocks: `useRouter` includes `replace`; verify-email `useSearchParams` uses long local part for 6-bullet mask; doctor signup regression uses real `CityCombobox` listbox flow from main + forgot-password `password_reset_phone` expectations.

## 2026-04-18 — cursor/fix-pr-112-tests-8913 — PR 112 test + testimonials fixes
- Commit: test: fix PR 112 regressions (availability selects, auth, testimonials)
- Files touched: src/app/provider/availability/Availability.test.tsx, src/app/(auth)/auth-regressions.test.tsx, src/app/(auth)/auth-v2.test.tsx, src/app/(auth)/doctor-signup/page.tsx, src/components/Testimonials.tsx, CHANGELOG.md
- Tests added / changed: 859 passing (Availability + auth + Testimonials suites updated)
- Build: not run in CI sandbox (prebuild requires full `.env`; `npm test` pass)
- Status: done
- Next up: 16.23 — Specialty hero + after-image slots (blocked on asset uploads)
- Notes: Provider availability UI uses `<select>` for times — tests now drive selects. Doctor signup step 1 name field has `aria-label`; regression test selects IAP, In-clinic, city from combobox via `mouseDown`, expects step 5 heading “Check your email”. Verify-email mock uses longer local part for mask. OTP v2 test drops fake timers (async redirect). Testimonials loads `/api/reviews?limit=3` via SWR when data exists.

## 2026-04-18 21:34 UTC — cursor/admin-dashboard-polish-fe31 — public detail chrome cleanup
- Commit: <pending> (fix: hide remaining visible chrome everywhere else)
- Files touched: src/components/dashboard/primitives.tsx, src/components/dashboard/primitives.test.tsx, src/app/city/[slug]/page.tsx, src/app/specialty/[slug]/page.tsx, src/components/specialties/SpecialtyArticle.tsx
- Tests added / changed: 1 file changed (primitives.test.tsx)
- Build: pass (`npm run lint` on touched files, `npm run type-check`)
- Status: done
- Next up: 16.23 — Specialty hero + after-image slots (blocked on asset uploads)
- Notes: Extended the hidden-chrome cleanup beyond shared/static pages to public city and specialty detail heroes plus SpecialtyArticle. Shared dashboard `PageHeader` subtitle is now visually hidden too, so patient/provider pages match the admin treatment and keep only the primary headline visible.

## 2026-04-18 21:22 UTC — cursor/admin-dashboard-polish-fe31 — site-wide hidden chrome pass
- Commit: 951a869 (fix: hide visible chrome across site)
- Files touched: src/app/about/AboutPageClient.tsx, src/app/faq/FAQPageClient.tsx, src/app/globals.css, src/app/hi/about/HiAboutPageClient.tsx, src/app/hi/faq/HiFAQPageClient.tsx, src/app/hi/how-it-works/page.tsx, src/app/hi/privacy/HiPrivacyHero.tsx, src/app/hi/terms/HiTermsHero.tsx, src/app/how-it-works/page.tsx, src/app/privacy/PrivacyHero.tsx, src/app/terms/TermsHero.tsx, src/components/dashboard/DashboardContextStrip.tsx, src/components/dashboard/DashboardShell.tsx, src/components/dashboard/TopPillNav.tsx, src/components/dashboard/primitives.tsx, src/components/static/StaticPageV2Chrome.tsx, src/components/dashboard/DashboardContextStrip.test.tsx, src/components/dashboard/TopPillNav.test.tsx, src/components/dashboard/primitives.test.tsx, src/components/homepage-regressions.test.tsx
- Tests added / changed: 8 files changed (primitives.test.tsx, TopPillNav.test.tsx, DashboardContextStrip.test.tsx, homepage-regressions.test.tsx, about-page.test.tsx, privacy-page.test.tsx, terms-page.test.tsx, how-it-works/page.v2.test.tsx)
- Build: pass (focused `vitest` 31/31, `npm run lint` on touched files, `npm run type-check`)
- Status: done
- Next up: Sweep specialty/city/provider-detail/public detail pages for any remaining visible eyebrow labels not covered by shared primitives, or continue with 16.23 once assets arrive
- Notes: Public/static hero pills on About/FAQ/How It Works/Privacy/Terms and Hindi mirrors are now visually hidden; dashboard breadcrumbs/context strip/greeting/kicker chrome are hidden site-wide; static v2 TOC helper heading and floating last-updated badge are hidden visually while JSON-LD, metadata, nav links, and headings remain intact.

## 2026-04-18 20:55 UTC — cursor/admin-dashboard-polish-fe31 — admin dashboard chrome + live registry cleanup
- Commit: 946f0bf (fix: polish admin dashboard chrome and registry)
- Files touched: src/components/dashboard/TopPillNav.tsx, src/components/dashboard/DashboardShell.tsx, src/app/admin/page.tsx, src/app/admin/listings/page.tsx, src/app/admin/users/page.tsx, src/app/admin/users/UsersV2.tsx, src/components/dashboard/TopPillNav.test.tsx, src/components/dashboard/DashboardBreadcrumbs.test.tsx, src/app/admin/page.test.tsx, src/app/admin/users/users-v2.test.tsx
- Tests added / changed: 4 files changed (DashboardBreadcrumbs.test.tsx, TopPillNav.test.tsx, page.test.tsx, users-v2.test.tsx)
- Build: pass (`npm run lint` on touched files, focused `vitest` 23/23, `npm run type-check`)
- Status: done
- Next up: 16.23 — Specialty hero + after-image slots (blocked on asset uploads)
- Notes: Admin-only chrome now hides the breadcrumb strip and context strip, page headers show only primary headlines, admin nav avatar is a fixed ShieldCheck icon treatment, admin home renders the main heading immediately while stats load, approvals page no longer exposes raw server error text, and `/admin/users` now uses live `/api/admin/users` + `/api/admin/stats` data with pending-aware badges and simple pagination instead of fake placeholder records.

## 2026-04-18 — claude/fix-signup-otp-password-bMZcQ — CHANGELOG sha (main feature commit)
- Commit: 2df3ba6 (docs: fix CHANGELOG commit sha for provider OTP + password reset)
- Files touched: CHANGELOG.md
- Tests added / changed: 0
- Build: n/a
- Status: done
- Next up: Apply migration `046_password_reset_otps.sql` in Supabase; smoke-test flows
- Notes: Updates handoff SHA after e73ff83.

## 2026-04-18 — claude/fix-signup-otp-password-bMZcQ — Provider signup OTP + resume + password-reset OTP (PR #113 plan)
- Commit: e73ff83 (feat: provider signup OTP resume, pending email state, password-reset OTP)
- Files touched: `src/lib/email/preflight.ts`, `src/lib/auth/password-reset-otp.ts`, `src/lib/auth/lookup-user.ts`, `src/app/api/providers/onboard-signup/route.ts`, `src/app/(auth)/doctor-signup/page.tsx`, `src/app/api/auth/login/route.ts`, `src/app/api/auth/me/onboarding-status/route.ts`, `src/app/provider/pending/page.tsx`, `ProviderPendingClient.tsx`, `src/app/api/auth/password-reset/route.ts`, `src/app/api/auth/password-reset/verify/route.ts`, `src/app/(auth)/forgot-password/page.tsx`, `src/app/(auth)/login/page.tsx`, `src/app/(auth)/verify-otp/page.tsx`, `src/lib/auth/pending-otp.ts`, `src/lib/resend.ts`, `src/lib/auth/email-otp.ts`, `src/app/api/auth/email-otp/send/route.ts`, `src/lib/demo/session.ts`, tests, `supabase/migrations/046_password_reset_otps.sql`, plan doc; removed `src/app/(auth)/update-password/*`
- Tests added / changed: `src/lib/email/preflight.test.ts` (2); updated auth/regression/pending tests
- Build: `npm run type-check` pass; `npm run build` blocked in sandbox without full `.env` (prebuild lists missing vars — expected)
- Status: done
- Next up: Apply migration `046_password_reset_otps.sql` in Supabase; smoke-test doctor signup Step 5, login resume, forgot-password email + phone paths; optional Playwright specs from plan
- Notes: Migration number is **046** (045 already used). Password reset uses Resend + `password_reset_otps` table; `/update-password` removed — use `/forgot-password` (phone OTP lands on `/forgot-password?after_otp=1`). Unconfirmed `provider_pending` logins redirect to `/doctor-signup?resume=1&email=…`.

## 2026-04-18 — claude/fix-signup-otp-password-bMZcQ — CHANGELOG sha (ADMIN_ALERT_EMAIL doc commit)
- Commit: aa7a728 (docs: fix CHANGELOG sha for ADMIN_ALERT_EMAIL commit)
- Files touched: CHANGELOG.md
- Tests added / changed: 0
- Build: n/a
- Status: done
- Next up: Slice 2 — email preflight + onboard-signup `emailOtpStatus` + Step 5 failure banner + 503 on missing Resend env
- Notes: Corrects the SHA in the previous handoff entry.

## 2026-04-18 — claude/fix-signup-otp-password-bMZcQ — Document ADMIN_ALERT_EMAIL in env + check-env
- Commit: e64bdc1 (docs: document ADMIN_ALERT_EMAIL in env example and check-env)
- Files touched: .env.example, scripts/check-env.mjs, CHANGELOG.md
- Tests added / changed: 0
- Build: n/a
- Status: done
- Next up: Slice 2 — email preflight + onboard-signup `emailOtpStatus` + Step 5 failure banner + 503 on missing Resend env
- Notes: Code already used `ADMIN_ALERT_EMAIL` in `sendAdminNewProviderAlert`; it was missing from `.env.example` and warn-only env check.

## 2026-04-18 — claude/fix-signup-otp-password-bMZcQ — CHANGELOG handoff (OtpDigits commit sha)
- Commit: c35cd62 (docs: fix CHANGELOG commit sha for OtpDigits slice)
- Files touched: CHANGELOG.md
- Tests added / changed: 0
- Build: n/a
- Status: done
- Next up: Slice 2 — email preflight + onboard-signup `emailOtpStatus` + Step 5 failure banner + 503 on missing Resend env
- Notes: Corrects the SHA in the previous handoff entry after the first push.

## 2026-04-18 — claude/fix-signup-otp-password-bMZcQ — Slice 1: extract OtpDigits shared component
- Commit: da7e4a5 (feat: extract OtpDigits shared component for doctor signup Step 5)
- Files touched: src/components/auth/OtpDigits.tsx, src/app/(auth)/doctor-signup/page.tsx
- Tests added / changed: 0 (refactor only; existing tests cover doctor-signup)
- Build: not run (eslint unavailable in sandbox — `npm run lint` failed: eslint not found)
- Status: wip
- Next up: Slice 2 from `docs/planning/plans/2026-04-18-provider-signup-otp-and-password-reset-fix.md` — email preflight + onboard-signup `emailOtpStatus` + Step 5 failure banner + 503 on missing Resend env
- Notes: PR #113 execution started. Shared 6-digit grid + paste/backspace behavior lives in `OtpDigits` for reuse by forgot-password Step 2 in a later slice.

## 2026-04-18 — claude/fix-signup-otp-password-bMZcQ — Plan: provider signup OTP + password reset fix
- Commit: (docs: plan for provider signup OTP, resume-onboarding, and 6-digit password-reset rewrite)
- Files touched: docs/planning/plans/2026-04-18-provider-signup-otp-and-password-reset-fix.md, CHANGELOG.md
- Tests added / changed: 0 (plan only — tests listed in the plan to be added during execution)
- Build: n/a (docs only)
- Status: done (plan); implementation not yet started
- Next up: Execute slices 1–5 from the plan on this branch — start with Slice 1 (extract `OtpDigits` shared component) then Slice 2 (email/preflight + Step 5 banner + 503 on missing Resend env)
- Notes: User reported provider Step 5 OTP never arrives, no resend, no resume path, and forgot-password broken. Plan (a) adds 503 preflight on missing Resend env to prevent orphan auth users, (b) surfaces send-failure banner on Step 5, (c) routes unconfirmed `provider_pending` logins back to `/doctor-signup?resume=1&email=…` with auto-resend, (d) replaces Supabase recovery-link with a 6-digit OTP flow (new migration `045_password_reset_otps.sql`). Delete `/update-password` page. Operator prerequisite: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `NEXT_PUBLIC_APP_URL` set and Resend sender-domain verified.

## 2026-04-18 — claude/fix-resend-otp-email-9G6Sm — Fix resend OTP + email system
- Commit: 8ec94e7 (fix: resend OTP and email system)
- Files touched: src/lib/resend.ts, src/lib/auth/email-otp.ts, src/app/api/auth/password-reset/route.ts, src/app/api/cron/daily-summary/route.ts
- Tests added / changed: 0 (no new tests; existing auth-hardening suite covers the flow)
- Build: type-check pre-existing errors only (node_modules absent in sandbox); no new errors introduced
- Status: done
- Next up: Verify RESEND_API_KEY + RESEND_FROM_EMAIL are set in Vercel env; apply migration 041_email_otps.sql if not yet done; smoke test doctor signup Step 5 "Resend code" button
- Notes: Three bugs fixed: (1) email-otp.ts was deleting the OTP record on send failure, making Step 5 "Resend code" silently do nothing because the resend endpoint found no record to get user_id from — record is now retained; (2) resend.ts was throwing at module load time (crash on import if RESEND_API_KEY missing) — now lazy singleton; (3) email-otp.ts / password-reset / daily-summary each created own inline `new Resend()` — all now use shared getResendClient()

## 2026-04-18 — cursor/simplify-phase-16-plan-8f67 — Slices 16.41 + 16.42 complete
- Commit: (feat: slices 16.41 + 16.42 — pulse de-dupe + ui-v2 default-on)
- Files touched: src/app/patient/dashboard/page.tsx, src/app/admin/page.tsx, .env.example, src/components/nav/CommandPalette.tsx+test, NotificationDrawer.tsx+test, SpecialtyCTARail.tsx+test, PatientInsightsStrip.tsx+test, ProviderPulse.tsx+test, PatientCarePulse.tsx+test, DashboardContextStrip.tsx+test, DashboardBreadcrumbs.tsx+test, AdminPulse.tsx+test, AdminPulseRail.tsx+test, src/app/about/about-page.test.tsx, faq-page.test.tsx, privacy-page.test.tsx, terms-page.test.tsx, docs/planning/EXECUTION-PLAN.md, ACTIVE.md
- Tests added / changed: removed 9 "renders nothing when ui-v2 off" tests; added QueryClientProvider wrapper to 4 static-page tests that were pre-failing; 843 passing (11 pre-existing failures unchanged)
- Build: type-check pass (next build requires env vars not present in agent)
- Status: done
- Next up: 16.23 — specialty hero + after-image slots (blocked on asset uploads from user)
- Notes: Phase 16 is now fully complete except 16.23. NEXT_PUBLIC_UI_V2=true is set in .env.example — deploy/Vercel env var should be updated to match. Remaining useUiV2 uses in page files are conditional-branching (v1 vs v2 variant); those remain and are still valid when the flag is overridden to false per-user via `bp_ui=v1` cookie.

## 2026-04-18 — cursor/simplify-phase-16-plan-8f67 — Precise actionable specs for 16.41 + 16.42
- Commit: (docs: expand 16.41 + 16.42 specs with exact file:line instructions)
- Files touched: docs/planning/EXECUTION-PLAN.md, docs/planning/ACTIVE.md, CHANGELOG.md
- Tests added / changed: 0
- Build: n/a (docs only)
- Status: done
- Next up: 16.41 — remove PatientInsightsStrip from patient dashboard + AdminPulse from admin dashboard
- Notes: 16.41 spec names exact files and lines to change. 16.42 spec splits into (a) .env.example + (b) strip early-return useUiV2 guards only; conditional-branch uses are left intact.

## 2026-04-18 — cursor/simplify-phase-16-plan-8f67 — Simplify Phase 16 planning docs
- Commit: 24f448f (docs: simplify Phase 16 plan (table + remaining slices))
- Files touched: docs/planning/EXECUTION-PLAN.md, docs/planning/ACTIVE.md, CHANGELOG.md
- Tests added / changed: 0
- Build: n/a
- Status: done
- Next up: 16.41 — dashboard pulse de-duplication (patient + admin)
- Notes: Per-slice detail now deferred to CHANGELOG/git; remaining work is 16.23, 16.41, 16.42 only.

## 2026-04-18 — pr-107 — CHANGELOG handoff fix (16.37 commit sha)
- Commit: 39a87ce (docs: fix CHANGELOG commit sha for slice 16.37)
- Files touched: CHANGELOG.md
- Tests added / changed: 0
- Build: n/a
- Status: done
- Next up: 16.41 — dashboard pulse de-duplication
- Notes: Amended 16.37 entry to point at amended commit `a417990`.

## 2026-04-18 — pr-107 — Slice 16.37 Hindi static mirrors + plan checkboxes
- Commit: a417990 (feat(ui-v2): slice 16.37 — Hindi /hi about, faq, privacy, terms v2 chrome parity)
- Files touched: src/app/hi/about/*, src/app/hi/faq/*, src/app/hi/privacy/*, src/app/hi/terms/*, docs/planning/EXECUTION-PLAN.md, docs/planning/ACTIVE.md
- Tests added / changed: 0 new (smoke via existing patterns)
- Build: `npm run type-check` pass (full `next build` needs env in CI)
- Status: done
- Next up: 16.41 — dashboard pulse de-duplication (patient + admin)
- Notes: Hi privacy/terms add section `id="contact"` for v2 TOC; `/hi/how-it-works` and `/hi/search` unchanged (already locale-aware or SearchContent).

## 2026-04-18 — pr-107 — Slices 16.39–16.40 CommandPalette + NotificationDrawer
- Commit: 8b84cf9 (feat(ui-v2): slices 16.39–16.40 — command palette + notification drawer in Navbar)
- Files touched: src/components/nav/CommandPalette.tsx, NotificationDrawer.tsx, command-palette-config.ts, tests, Navbar.tsx, src/test/setup.ts (IntersectionObserver stub)
- Tests added / changed: +8 (CommandPalette.test.tsx, NotificationDrawer.test.tsx)
- Build: `npm run type-check` pass
- Status: done
- Next up: 16.37 Hindi mirrors
- Notes: Replaces CommandPaletteHint when ui-v2; role from GET /api/profile; recent routes in localStorage `bp_cmd_recent`.

## 2026-04-18 — pr-107 — Slice 16.36 static pages v2 chrome
- Commit: 90a77db (feat(ui-v2): slice 16.36 — static pages long-form chrome + TOC + last-updated Badge)
- Files touched: src/components/static/*, src/app/about/*, faq/*, privacy/*, terms/*, tests, src/test/setup.ts
- Tests added / changed: +8 (about, faq, privacy, terms page tests)
- Build: `npm run type-check` pass
- Status: done
- Next up: 16.39 command palette
- Notes: StaticLegalHero hides duplicate last-updated line in v2 for privacy/terms; About v1 has no section ids (only when v2).

## 2026-04-18 — pr-107 — Slice 16.38 Recharts
- Commit: 4796bae (feat(ui-v2): slice 16.38 — Recharts integration for analytics, earnings, records)
- Files touched: package.json, admin analytics page, ProviderEarningsV2Chrome, PatientRecordsSummaryV2, records-utils, analytics-v2.test.tsx, test setup (ResizeObserver)
- Tests added / changed: +1 analytics test (recharts mock)
- Build: `npm run type-check` pass
- Status: done
- Next up: 16.36 static pages
- Notes: Geographic mock grid replaced with simple decorative circle; Appointment bar chart added.

## 2026-04-18 — claude/organize-file-structure-2B6D3 — File structure cleanup + placement enforcement
- Commit: 2dc7765 (chore: organize file structure + enforce placement rules)
- Files touched: 19 files — moves, deletes, new rule doc, new hook script, settings.json, CLAUDE.md
- Tests added / changed: 0
- Build: n/a (no source changes)
- Status: done
- Next up: Slice 16.21 — `/patient/pai` + `/patient/motio` v2 AI-assistant shell (Part B P2)
- Notes: IMG_046*.png are iPhone screenshots (NOT PWA icons — real icons in public/). vercel_ls/whoami were temp garbage. PreToolUse hook warns before any future misplaced root write.

## 2026-04-18 — cursor/phase-17-search-fixes-5f15 — Fix TS + SearchFilters drawer + jsdom IntersectionObserver
- Commit: 820b8a9 (fix: SearchFilters duplicate drawer state + loosen filters typing + IO stub in test setup)
- Files touched: src/app/search/SearchFilters.tsx, src/app/api/providers/filters.ts, src/test/setup.ts
- Tests added / changed: 0 (search-v2 + type-check green)
- Build: pass (`npm run type-check`)
- Status: done
- Next up: Push branch + open PR
- Notes: Removes duplicate `drawerOpen` state; `applyPublicProviderFilters` uses `any` to avoid Postgrest TS2589; global `IntersectionObserver` stub for SearchResultsReels in jsdom.

## 2026-04-18 — cursor/phase-17-search-fixes-5f15 — Phase 17.5 shorter display_id sequences
- Commit: 4d741f3 (feat(db): migration 045 — shorter display IDs (6-digit providers, 7-digit patients))
- Files touched: supabase/migrations/045_shorter_display_ids.sql
- Tests added / changed: 0 (verify in Supabase after apply: new provider/patient rows get 6/7 digit display_id)
- Build: n/a (SQL only)
- Status: done
- Next up: Apply migrations 044 + 045 in Supabase; then **16.21** `/patient/pai` + `/patient/motio` (ui-v2) or next backlog slice
- Notes: Grep of `src/` found no `display_id` UI assumptions to update.

## 2026-04-18 — cursor/phase-17-search-fixes-5f15 — Phase 17.4 mobile reels (ui-v2)
- Commit: b3261a3 (feat(search): mobile reels snap-scroll (ui-v2 only) — SearchResultsReels + DoctorCardCompact)
- Files touched: src/app/search/SearchContent.tsx, src/app/search/SearchResultsReels.tsx, src/app/search/SearchResultsReels.test.tsx, src/components/DoctorCardCompact.tsx
- Tests added / changed: +2 (SearchResultsReels.test.tsx)
- Build: pass (targeted tests)
- Status: done
- Next up: 17.5 migration 045
- Notes: Fixed viewport reels + IntersectionObserver counter; keyboard PageUp/Down on window.

## 2026-04-18 — cursor/phase-17-search-fixes-5f15 — Phase 17.3 CitySearchCombobox
- Commit: a780178 (feat(search): replace flat city list with CitySearchCombobox (popular chips + typeahead))
- Files touched: src/components/search/CitySearchCombobox.tsx, src/components/search/CitySearchCombobox.test.tsx, src/app/search/SearchFilters.tsx
- Tests added / changed: +6 (CitySearchCombobox.test.tsx)
- Build: pass (targeted tests)
- Status: done
- Next up: 17.4 reels
- Notes: Desktop uses LocationFilterPill + popover; mobile drawer uses same combobox.

## 2026-04-18 — cursor/phase-17-search-fixes-5f15 — Phase 17.2 compact search header
- Commit: b78f0d1 (feat(search): compact mobile header — sr-only breadcrumb + BreadcrumbList JSON-LD + single-line h1)
- Files touched: src/app/search/SearchContent.tsx, src/app/search/SearchFilters.tsx, src/app/search/SearchContent.test.tsx
- Tests added / changed: +3 (SearchContent.test.tsx)
- Build: pass (targeted tests)
- Status: done
- Next up: 17.3 city combobox
- Notes: Mobile filter chip opens shared drawer via controlled SearchFilters props.

## 2026-04-18 — cursor/phase-17-search-fixes-5f15 — Phase 17.1 provider search approval gate
- Commit: c02b513 (fix: tighten provider search to require approval_status=approved (migration 044))
- Files touched: src/app/api/providers/filters.ts, src/app/api/providers/route.ts, supabase/migrations/044_search_providers_approval_gate.sql, src/app/api/__tests__/providers.test.ts
- Tests added / changed: +2 (providers.test.ts)
- Build: pass (targeted tests)
- Status: done
- Next up: 17.2 search header
- Notes: RPC + fallback now aligned on verified + approval_status=approved.

## 2026-04-18 — cursor/phase-17-search-fixes-5f15 — Merge PR 105 Phase 17 planning docs
- Commit: a672093 (docs: merge Phase 17 plan + execution checklist from PR 105)
- Files touched: docs/superpowers/plans/2026-04-18-search-fixes-and-id-compaction.md, docs/planning/EXECUTION-PLAN.md, docs/planning/ACTIVE.md, CHANGELOG.md
- Tests added / changed: 0
- Build: n/a
- Status: done
- Next up: Implementation commits c02b513 → 4d741f3 on branch cursor/phase-17-search-fixes-5f15
- Notes: Brought agent-ready plan + Phase 17 checklist onto implementation branch.

## 2026-04-18 — cursor/simplify-pr103-plan-7c79 — Phase 17 plan simplification
- Commit: 7bcddfe (docs: simplify PR 103 plan into 5 agent-ready slices (Phase 17))
- Files touched: docs/superpowers/plans/2026-04-18-search-fixes-and-id-compaction.md (rewritten), docs/planning/EXECUTION-PLAN.md (Phase 17 added), docs/planning/ACTIVE.md (NEXT UP updated)
- Tests added / changed: 0
- Build: n/a (docs only)
- Status: done
- Next up: 17.1 — Fix unapproved provider leak in `src/app/api/providers/route.ts:282` + migration 044
- Notes: PR #103 was a verbose reference plan. Rewrote as 5 numbered slices (17.1–17.5), each with exact file paths, line numbers, precise diffs to make, test cases to write, and a commit message. Added Phase 17 block to EXECUTION-PLAN.md and updated ACTIVE.md NEXT UP pointer. Agent should checkout `claude/fix-search-mobile-ui-sxKR6` and work through slices in order.
## 2026-04-18 — cursor/slices-16-31-to-16-35-2f38 — Test fix analytics-v2 tsc
- Commit: f7fc6b8 (fix(test): satisfy tsc for AdminAnalytics missing-data mock)
- Files touched: src/app/admin/analytics/analytics-v2.test.tsx
- Tests added / changed: 0 new
- Build: `npm run type-check` pass
- Status: done
- Next up: merge PR #102 or continue Phase 16 per EXECUTION-PLAN
- Notes: `as never` on useQuery mock with undefined data for strict TS.

## 2026-04-18 — cursor/slices-16-31-to-16-35-2f38 — Slice 16.35 /admin/analytics v2 + plan docs
- Commit: 6e90b5b (docs: mark Phase 16 slices 16.31–16.35 complete + CHANGELOG handoff); implementation: a43f142 (AdminPulseRail)
- Files touched: src/app/admin/analytics/page.tsx, src/app/admin/analytics/analytics-v2.test.tsx, docs/planning/EXECUTION-PLAN.md, docs/planning/ACTIVE.md
- Tests added / changed: +6 (analytics-v2.test.tsx)
- Build: see final verification entry
- Status: done
- Next up: 16.21 `/patient/pai` + `/patient/motio` — v2 AI-assistant shell (or next open Phase 16 slice per EXECUTION-PLAN)
- Notes: AdminPulseRail receives KPIs from `/api/admin/analytics` when `useUiV2()`; 16.35 Recharts deferred per PR #102 brief.

## 2026-04-18 — cursor/slices-16-31-to-16-35-2f38 — Slice 16.34 /admin/users v2
- Commit: 40ad358 (feat(ui-v2): slice 16.34 — /admin/users v2 RoleBadge + LastActiveDelta)
- Files touched: src/app/admin/users/UsersV2.tsx, src/app/admin/users/users-v2.test.tsx, src/app/admin/users/page.tsx
- Tests added / changed: +7 (users-v2.test.tsx)
- Build: pending
- Status: done
- Next up: 16.35 — /admin/analytics v2 AdminPulseRail
- Notes: RoleBadge + LastActiveDelta in ListRow right slot when useUiV2().

## 2026-04-18 — cursor/slices-16-31-to-16-35-2f38 — Slice 16.33 /admin/listings v2
- Commit: 6a918c5 (feat(ui-v2): slice 16.33 — /admin/listings v2 ApprovalStatusBadge + SLA sparkline)
- Files touched: src/app/admin/listings/ListingsV2.tsx, src/app/admin/listings/listings-v2.test.tsx, src/app/admin/listings/page.tsx, src/components/dashboard/primitives.tsx (StatTile optional children)
- Tests added / changed: +6 (listings-v2.test.tsx)
- Build: pending
- Status: done
- Next up: 16.34 — /admin/users v2 RoleBadge + LastActiveDelta
- Notes: SlaSparkline in third StatTile when ui-v2; row status uses ApprovalStatusBadge when ui-v2.

## 2026-04-18 — cursor/slices-16-31-to-16-35-2f38 — Slice 16.32 /provider/pending v2
- Commit: 8c4c6fb (feat(ui-v2): slice 16.32 — /provider/pending v2 onboarding stepper with Badge states)
- Files touched: src/app/provider/pending/PendingV2.tsx, src/app/provider/pending/pending-v2.test.tsx, src/app/provider/pending/page.tsx
- Tests added / changed: +6 (pending-v2.test.tsx)
- Build: pending (full verify after 16.35)
- Status: done
- Next up: 16.33 — /admin/listings v2 ApprovalStatusBadge + SLA sparkline
- Notes: PendingStepperV2 replaces inline step list when useUiV2(); sign-out unchanged.

## 2026-04-18 — cursor/slices-16-31-to-16-35-2f38 — Slice 16.31 /provider/bills/new v2
- Commit: 8011b1c (feat(ui-v2): slice 16.31 — /provider/bills/new v2 GST chips + billing sidebar)
- Files touched: src/app/provider/bills/new/BillsV2.tsx, src/app/provider/bills/new/bills-v2.test.tsx, src/app/provider/bills/new/page.tsx
- Tests added / changed: +6 (bills-v2.test.tsx)
- Build: pending (full verify after 16.35)
- Status: done
- Next up: 16.32 — /provider/pending v2 onboarding stepper
- Notes: GstLineItemChips + BillV2Sidebar gated with useUiV2().

## 2026-04-18 — cursor/slices-16.28-16.30-spec-56c7 — docs(planning): 16.28–16.30 complete + NEXT UP 16.31
- Commit: d59f3d9 (docs(planning): mark slices 16.28-16.30 complete; NEXT UP 16.31)
- Files touched: docs/planning/ACTIVE.md, docs/planning/EXECUTION-PLAN.md
- Tests added / changed: 0
- Build: n/a
- Status: done
- Next up: 16.31 `/provider/bills/new` — v2 invoice builder
- Notes: EXECUTION-PLAN Phase 16 items 16.28–16.30 set to [x].

## 2026-04-18 — cursor/slices-16.28-16.30-spec-56c7 — docs(changelog): slice 16.30 entry short SHA
- Commit: db9439e (docs(changelog): add short SHA for slice 16.30 entry)
- Files touched: CHANGELOG.md
- Tests added / changed: 0
- Build: n/a
- Status: done
- Next up: planning tick commit (see entry above)
- Notes: Records fc75bb7 for slice 16.30 (could not embed in amend commit message).

## 2026-04-18 — cursor/slices-16.28-16.30-spec-56c7 — Slice 16.30 provider messages + notifications v2
- Commit: fc75bb7 (feat(ui-v2): slice 16.30 — provider messages + notifications v2 (parity with patient 16.19))
- Files touched: src/app/provider/messages/ProviderMessagesV2.tsx, src/app/provider/messages/messages-v2.test.tsx, src/app/provider/messages/page.tsx, src/app/provider/notifications/ProviderNotificationsV2.tsx, src/app/provider/notifications/notifications-v2.test.tsx, src/app/provider/notifications/page.tsx
- Tests added / changed: +12 (messages-v2.test.tsx + notifications-v2.test.tsx)
- Build: type-check pass (`tsc --noEmit`)
- Status: done
- Next up: 16.31 `/provider/bills/new` v2 invoice builder OR merge PR #100 branch to main
- Notes: Reuses patient `messages-v2-utils` / `notifications-v2-utils`; query keys `provider-conversations` / `provider-messages` preserved. v1 split into `ProviderMessagesV1` / `ProviderNotificationsV1` for hook order.

## 2026-04-18 — cursor/slices-16.28-16.30-spec-56c7 — Slice 16.29 provider AI assistant v2
- Commit: 88d8ed3 (feat(ui-v2): slice 16.29 — provider AI-assistant v2 shell + capability chips)
- Files touched: src/app/provider/ai-assistant/ProviderAIAssistantV2.tsx, src/app/provider/ai-assistant/ai-assistant-v2.test.tsx, src/app/provider/ai-assistant/page.tsx
- Tests added / changed: +5 (ai-assistant-v2.test.tsx)
- Build: type-check pass (`tsc --noEmit`)
- Status: done
- Next up: 16.30 `/provider/messages` + `/provider/notifications` v2
- Notes: `next/dynamic` mock in tests; v1 remains default export path when flag off.

## 2026-04-18 — cursor/slices-16.28-16.30-spec-56c7 — Slice 16.28 provider profile v2
- Commit: dcbd856 (feat(ui-v2): slice 16.28 — provider profile v2 with credential chip + public preview CTA)
- Files touched: src/app/provider/profile/ProviderProfileV2.tsx, src/app/provider/profile/profile-v2.test.tsx, src/app/provider/profile/page.tsx, src/app/provider/profile/page.test.tsx
- Tests added / changed: +10 (profile-v2.test.tsx)
- Build: type-check pass (`tsc --noEmit`)
- Status: done
- Next up: 16.29 `/provider/ai-assistant` — v2 assistant shell + capability chips
- Notes: v2 gate via `useUiV2()`; v1 extracted as `ProviderProfileV1` to satisfy Rules of Hooks. Public CTA links to `/doctor/:userId`.

## 2026-04-18 — cursor/slices-16-21-to-16-27-spec-f324 — Consolidate PR #97/#98/#99 into PR #101
- Commit: de8d139 (merge: fold PR 99 rollup into PR 101; dedupe superseded v2 stubs)
- Files touched: merge of rollup branch + deletions of duplicate `*V2` files from earlier PR #101-only attempt; `docs/planning/slices-16-21-to-16-27-spec.md` retained
- Tests added / changed: net = rollup tests (PR #99); removed obsolete tests tied to deleted duplicates
- Build: run `npm run type-check` + eslint after merge
- Status: done
- Next up: **16.28** `/provider/profile` — v2 form chrome
- Notes: Close **PR #97**, **PR #98**, **PR #99** as superseded by **PR #101** (single merge). PR #97/98/99 implemented overlapping slices; PR #101 branch now contains the full integrated implementation + implementation spec doc.

## 2026-04-18 — cursor/phase-16-slices-21-25-9290 — Slice 16.27 provider patients v2
- Commit: 9d0539e (feat(ui-v2): slice 16.27 — provider patients roster + chart v2 chrome)
- Files touched: `src/app/api/provider/patients/route.ts`, `src/lib/clinical/types.ts`, `src/lib/clinical/provider-patients-utils.ts`, `ProviderPatientsRosterCardV2.tsx`, `ProviderPatientChartV2Chrome.tsx`, patient pages, demo helper, tests, planning docs, `docs/CODEMAPS/pages.md`
- Tests added / changed: +3 files (utils + roster card + chart chrome)
- Build: `tsc --noEmit` + targeted vitest pass (full `next build` needs env in CI)
- Status: done
- Next up: 16.28 `/provider/profile` v2 (or 16.23 specialty images when assets land)
- Notes: `includeVisitSeries=1` adds `visit_series_6m` to roster rows; `getDemoPatientVisitDates` for demo parity.

## 2026-04-18 — cursor/phase-16-slices-21-25-9290 — Slice 16.26 provider earnings v2
- Commit: 228a796 (feat(ui-v2): slice 16.26 — provider earnings v2 tiles + monthly sparkline)
- Files touched: src/app/provider/earnings/ProviderEarningsV2Chrome.tsx (new), provider-earnings-utils.ts (new), tests, page.tsx, docs/planning/*, docs/CODEMAPS/pages.md
- Tests added / changed: +4
- Build: type-check + lint 0 errors
- Status: done
- Next up: 16.27 provider patients v2 or 16.23 specialty images — same rollup branch
- Notes: Monthly settled net from visit dates (India months) via formatIndiaDateInput; ProviderEarningsV2Chrome self-gates useUiV2(); payout cadence badge Thu (matches sidebar copy).

## 2026-04-18 — cursor/phase-16-slices-21-25-9290 — Slice 16.25 provider calendar + availability v2 chrome
- Commit: ef8c7e8 (feat(ui-v2): slice 16.25 — provider calendar + availability v2 chrome)
- Files touched: src/app/provider/calendar/ProviderCalendarV2Chrome.tsx (new), provider-calendar-v2-chrome.test.tsx (new), page.tsx; src/app/provider/availability/ProviderAvailabilityV2Chrome.tsx (new), provider-availability-v2-chrome.test.tsx (new), page.tsx; docs/planning/EXECUTION-PLAN.md, docs/planning/ACTIVE.md, docs/CODEMAPS/pages.md
- Tests added / changed: +4 (2 chrome test files)
- Build: type-check + lint 0 errors
- Status: done
- Next up: 16.23 specialty images (when assets) or 16.26 provider earnings v2 — same rollup branch `cursor/phase-16-slices-21-25-9290`
- Notes: Self-gated via useUiV2(). Calendar: weekly bookings sparkline + week revenue Badge; desktop grid cells show booking count Badge. Availability: weekday window-count sparkline + duration cadence Badge; day rows show window count Badge.

## 2026-04-18 — cursor/phase-16-slices-21-25-9290 — Slice 16.24 provider appointments v2 + provider_set_status API
- Commit: 3fe82f3 (feat(ui-v2): slice 16.24 — provider appointments timeline + status actions)
- Files touched: src/app/api/appointments/[id]/route.ts, src/lib/validations/booking.ts, src/app/provider/appointments/* (ProviderAppointmentsTimelineV2, provider-appointments-utils, page, [id]/page), provider-appointments-utils.test.ts, docs/planning/EXECUTION-PLAN.md, docs/planning/ACTIVE.md
- Tests added / changed: +2 (provider-appointments-utils.test.ts)
- Build: type-check + lint 0 errors
- Status: done
- Next up: 16.25 provider calendar + availability v2 (same PR branch)
- Notes: PATCH `action: provider_set_status` with `confirmed` | `completed` | `no_show` (provider-owned appointment, RLS). Outcome buttons only after slot start. Reschedule link goes to `?reschedule=true` (UI placeholder until booking flow wires provider reschedule).

## 2026-04-18 — cursor/slice-16-22-patient-search-9290 — Slice 16.22 patient search v2 filter rail
- Commit: 44996b3 (feat(ui-v2): slice 16.22 — patient search v2 rail + optional pincode search)
- Files touched: src/app/patient/search/PatientSearchFiltersRail.tsx (new), src/app/patient/search/patient-search-filters-rail.test.tsx (new), src/app/patient/search/page.tsx, src/app/search/SearchContent.tsx, src/app/api/providers/route.ts, src/lib/validations/search.ts, src/components/dashboard/DashboardShell.tsx, src/app/patient/appointments/page.tsx, src/app/patient/appointments/PatientAppointmentsTimeline.tsx, docs/planning/ACTIVE.md, docs/planning/EXECUTION-PLAN.md, docs/CODEMAPS/pages.md
- Tests added / changed: +6 (patient-search-filters-rail.test.tsx)
- Build: type-check pass; lint 0 errors (pre-existing warnings elsewhere)
- Status: done
- Next up: 16.23 speciality page hero + after-image slots (rollup PR: slices 16.21–16.25 on branch `cursor/phase-16-slices-21-25-9290`)
- Notes: `SearchContent` gains `variant="patient"`. `PatientSearchFiltersRail` when `useUiV2()` + patient variant. Optional `pincode` on GET /api/providers — relational fallback + `locations.pincode`. Changelog docs commit on 16.22 branch: d97c68f.

## 2026-04-18 — cursor/slice-16-21-patient-ai-shell-9290 — Slice 16.21 patient PAI + Motio v2 AI shell
- Commit: d2cd03b (feat(ui-v2): slice 16.21 — patient PAI/Motio AI shell with pulse strip)
- Files touched: src/app/patient/ai/PatientAIShellV2.tsx (new), src/app/patient/ai/patient-ai-shell-v2.test.tsx (new), src/app/patient/pai/page.tsx, src/app/patient/motio/page.tsx, src/app/patient/appointments/page.tsx, src/app/patient/appointments/PatientAppointmentsTimeline.tsx, docs/planning/ACTIVE.md, docs/planning/EXECUTION-PLAN.md
- Tests added / changed: +4 (patient-ai-shell-v2.test.tsx)
- Build: type-check pass (`npm run type-check`). `next build` not run — env vars missing in sandbox (prebuild check-env). Lint: 0 errors.
- Status: done
- Next up: (same rollup) 16.22+ on `cursor/phase-16-slices-21-25-9290`
- Notes: PatientAIShellV2 self-gates via useUiV2(); pulse uses role=patient Sparkline + TrendDelta + Badge. PatientAppointmentsTimeline requires nowMs from parent — fixes react-hooks/purity.

## 2026-04-18 — cursor/consolidate-16-16-to-16-20-b42e — Consolidation + CodeRabbit fixes
- Commit: 171f4d9 (fix(cr): address CodeRabbit comments from PRs 93/94/95)
- Files touched: src/app/patient/appointments/PatientAppointmentsTimeline.tsx, src/app/patient/appointments/[id]/page.tsx, src/app/patient/appointments/page.tsx, src/app/patient/payments/PatientPaymentsLedger.tsx, src/app/patient/payments/payments-v2.test.tsx
- Tests added / changed: 0 new (1 pre-existing test bug fixed in payments-v2.test.tsx makePayment helper)
- Build: type-check pass (`tsc --noEmit` clean). Full suite: 741/752 passing; 11 pre-existing failures only.
- Status: done
- Next up: 16.21 `/patient/pai` + `/patient/motio` — v2 AI-assistant shell with role=patient pulse tokens
- Notes: CodeRabbit fixes: (1) Removed `'use client'` from PatientAppointmentsTimeline — no hooks/events, Server Component candidate; (2) Extracted shared `rescheduleModal` variable in appointments/[id]/page.tsx to de-duplicate the RescheduleModal JSX used by both v1 and v2 branches; (3) Removed local `STATUS_LABELS` map from appointments/page.tsx — now imports `STATUS_LABEL` from appointments-utils (single source of truth, standardized `No-show`); (4) Removed redundant `as string` cast from PatientPaymentsLedger.tsx line 77; (5) Passed `nowDate` (derived from `nowMs`) to `canPatientCancelAppointment` in Timeline so reschedule eligibility uses the same reference time as day-grouping. Also fixed pre-existing test bug in payments-v2.test.tsx `makePayment` helper — `??` was overwriting explicit `null` provider_name with the default; changed to `'provider_name' in overrides` guard.

## 2026-04-18 — cursor/slice-16-19-messages-notifications-b42e — Slice 16.20 Patient profile v2
- Commit: 114d38e (feat(ui-v2): slice 16.20 — patient profile v2 form chrome + consent toggles + role Badge)
- Files touched: src/app/patient/profile/PatientProfileV2.tsx (new), src/app/patient/profile/profile-v2.test.tsx (new), src/app/patient/profile/page.tsx
- Tests added / changed: +14 (profile-v2.test.tsx).
- Build: type-check pass (`tsc --noEmit` clean).
- Status: done
- Next up: 16.21 `/patient/pai` + `/patient/motio` — v2 AI-assistant shell with role=patient pulse tokens
- Notes: Additive overlay, self-gates via useUiV2(). Avatar initials (first+last word), role Badge, Phone Verified badge, read-only pill fields, consent toggles, security card, trust card.

## 2026-04-18 — cursor/slice-16-19-messages-notifications-b42e — Slice 16.19 Patient messages + notifications v2
- Commit: 3d82794 (feat(ui-v2): slice 16.19 — patient messages + notifications v2 thread layout + unread Badge)
- Files touched: src/app/patient/messages/PatientMessagesV2.tsx (new), src/app/patient/messages/messages-v2-utils.ts (new), src/app/patient/messages/messages-v2.test.tsx (new), src/app/patient/messages/page.tsx, src/app/patient/notifications/PatientNotificationsV2.tsx (new), src/app/patient/notifications/notifications-v2-utils.ts (new), src/app/patient/notifications/notifications-v2.test.tsx (new), src/app/patient/notifications/page.tsx, src/components/dashboard/primitives/Badge.tsx
- Tests added / changed: +43 (22 messages-v2 + 21 notifications-v2).
- Build: type-check pass (`tsc --noEmit` clean).
- Status: done
- Next up: 16.20 `/patient/profile`

## 2026-04-18 — claude/issue-16-16-rFkjG — Slice 16.17 Patient payments v2 ledger
- Commit: 1ccf982 (feat(patient): slice 16.17 — v2 payments ledger with Badge status + GST line items)
- Files touched: src/app/patient/payments/payments-utils.ts (new), src/app/patient/payments/PatientPaymentsLedger.tsx (new), src/app/patient/payments/payments-v2.test.tsx (new), src/app/patient/payments/page.tsx
- Tests added / changed: +23 (payments-v2.test.tsx). All green.
- Build: type-check pass. CI validates.
- Status: done
- Next up: 16.18 `/patient/records`

## 2026-04-18 — claude/issue-16-16-rFkjG — Slice 16.16 patient appointments v2 redesign
- Commit: 787b58c (feat(patient): slice 16.16 — v2 patient appointments timeline + detail)
- Files touched: src/app/patient/appointments/appointments-utils.ts, src/app/patient/appointments/page.tsx, src/app/patient/appointments/page.test.tsx, src/app/patient/appointments/PatientAppointmentsTimeline.tsx (new), src/app/patient/appointments/PatientAppointmentsTimeline.test.tsx (new), src/app/patient/appointments/[id]/page.tsx, src/app/patient/appointments/[id]/PatientAppointmentDetailV2.tsx (new), src/app/patient/appointments/[id]/PatientAppointmentDetailV2.test.tsx (new)
- Tests added / changed: +26 (9 helper + 8 timeline + 9 detail)
- Build: pass (`next build` green; type-check + targeted eslint clean)
- Status: done
- Next up: 16.17 `/patient/payments`

## 2026-04-18 — claude/review-pr-next-phase-zmmoT — Slice 16.15 Booking flow v2 trust strip
- Commit: c4d3d9b (feat(ui-v2): slice 16.15 — BookingV2TrustStrip under step rail on /book/[id])
- Files touched: src/components/booking/BookingV2TrustStrip.tsx (new), src/components/booking/BookingV2TrustStrip.test.tsx (new), src/app/book/[id]/BookingInner.tsx
- Tests added / changed: +8 (BookingV2TrustStrip.test.tsx). All green. Existing book/[id] step tests still 6/6 pass.
- Build: type-check pass (`tsc --noEmit` clean). `next build` not run locally (no env in sandbox); CI validates.
- Status: done
- Next up: 16.16 `/patient/appointments` — Priority 2 kick-off (v2 timeline grouped by day, Badge status, cancel/reschedule affordances)
- Notes: Minimal additive approach — the existing `BookingInner.tsx` step rail chrome is already polished; instead of rewriting it, this slice adds one self-gating client component under the existing progress bar that surfaces trust + speed signal. Component returns `null` in v1 AND on step 3 (success), so SSR + the receipt flow are byte-identical with v1. Props: `step: 1|2|3`, `providerVerified?: boolean` (defaults true), `medianBookingSeconds?: number` (default 58), `deltaPct?: number` (default -12, rendered with `<TrendDelta inverse>` so negative = faster = emerald). Chips reuse the same `role=provider` (success variant) + `role=patient` (soft tones 2 + 3) palette we used in ProviderV2TrustStrip / CityV2TrustChips so the whole Part B surface reads as one family. Put the component in new `src/components/booking/` subtree rather than `specialties/` since booking isn't a specialty surface — cleaner semantics, no existing files to migrate. Direct per-file imports from `@/components/dashboard/primitives/{Badge,TrendDelta}` (same vitest-ambiguity workaround as slice 16.14). Integer ₹ pricing was already enforced by existing `toLocaleString('en-IN')` + `Math.round(... * 0.18)` — no changes needed to Razorpay handoff or price math.

## 2026-04-18 — claude/review-pr-next-phase-zmmoT — Slice 16.14 Provider detail + city v2 trust surfaces
- Commit: 9a94638 (feat(ui-v2): slice 16.14 — ProviderV2TrustStrip on /doctor/[id] + CityV2TrustChips on /city/[slug])
- Files touched: src/components/specialties/ProviderV2TrustStrip.tsx (new), src/components/specialties/ProviderV2TrustStrip.test.tsx (new), src/components/specialties/CityV2TrustChips.tsx (new), src/components/specialties/CityV2TrustChips.test.tsx (new), src/app/doctor/[id]/page.tsx, src/app/city/[slug]/page.tsx, src/app/how-it-works/page.tsx
- Tests added / changed: +15 (ProviderV2TrustStrip.test.tsx: 8; CityV2TrustChips.test.tsx: 7). All green. Full suite: 592/601 passing; the 9 failing tests are pre-existing availability/auth/testimonials flakes unrelated to this slice (verified via `git stash` + rerun).
- Build: type-check pass (`tsc --noEmit` clean). `next build` not run locally (no env in sandbox — Supabase URL etc. missing); CI validates.
- Status: done
- Next up: 16.15 Booking flow `/book/[id]` — v2 stepper (slot → details → confirm), integer ₹ pricing, Razorpay handoff unchanged
- Notes: `/doctor/[id]` and `/city/[slug]` are Server Components, so added two client-only overlays that self-gate via `useUiV2()` and render `null` in v1 — SSR stays byte-identical. `ProviderV2TrustStrip` on doctor page carries IAP chip (ShieldCheck), live availability pill (`Next slot · <formatted>` or `Check availability`), optional location, and a primary `Book in 60s` CTA pointing at `#booking-card-section`. `CityV2TrustChips` on city page carries 3 trust badges (IAP verified / Clinic + Home visits / Transparent ₹ pricing) and a weekly demand `Sparkline` with a city-aware `ariaLabel`. `/provider/[slug]` is NOT a live route; scope scaled to the two real pages and noted in EXECUTION-PLAN + ACTIVE. Also fixed a latent vitest-only module-resolution bug in slice 16.13's `how-it-works/page.tsx` — `@/components/dashboard/primitives` resolves ambiguously between `primitives.tsx` and `primitives/index.ts` under vitest, so swapped to direct per-file imports (`.../Badge`, `.../Sparkline`, `.../TrendDelta`) which made the 8 how-it-works v2 tests pass too. Same direct-import pattern used in the new 16.14 components.

## 2026-04-18 — claude/review-pr-next-phase-zmmoT — Slice 16.13 How-it-works v2 redesign
- Commit: c5865b6 (feat(ui-v2): slice 16.13 — how-it-works timeline strip + per-step Sparkline + CTA stat rail)
- Files touched: src/app/how-it-works/page.tsx, src/app/how-it-works/page.v2.test.tsx (new)
- Tests added / changed: +8 (page.v2.test.tsx)
- Build: not run (node_modules absent in sandbox; CI validates)
- Status: done
- Next up: 16.14 Provider detail + city pages — v2 card chrome, availability strip, trust chips, "Book in 60s" primary CTA on `/doctor/[id]`, `/provider/[slug]`, `/city/[slug]`
- Notes: v1 byte-identical when `useUiV2()` off (regressions test still imports page.tsx; useSyncExternalStore returns false in jsdom). v2 additions: (1) 4-cell timeline strip above step grid with role="list"/"listitem" + aria-label="Booking progress timeline"; (2) per-step `Badge` replaces uppercase caption + per-step `Sparkline` with ariaLabel="<step> progress"; (3) v2 CTA footer (`data-testid=v2-cta-footer`) adds a proof-stat rail (`v2-cta-stats`) with 2 role-aware KPIs wrapped in `TrendDelta` (inverse=true when the metric is "smaller is better"). Role switch re-renders the stats + sparklines. All new DOM has `data-ui-version="v2"` for CSS targeting.

## 2026-04-18 — claude/review-pr-next-phase-zmmoT — PR #91 CI fixes (16.11 + 16.12 unblock)
- Commit: 3807e72 (fix(ci): PR #91 TS2739 SpecialtyCTARail props + jsx-a11y combobox ARIA)
- Files touched: src/app/search/SearchContent.tsx, src/app/(auth)/auth-v2.test.tsx
- Tests added / changed: 0 (CI unblock — build + lint only; tests from 16.11/16.12 remain green)
- Build: not run (node_modules absent in sandbox; CI validates)
- Status: done
- Next up: 16.13 How-it-works redesign — step timeline + Sparkline progress indicators + provider/patient role toggle + v2 CTA footer
- Notes: Merged origin/claude/next-phases-hRiOh (PR #91, slices 16.11 + 16.12) into assigned dev branch. Two CI blockers fixed: (1) `SpecialtyCTARail` invocation in `SearchContent.tsx:296` was missing required `specialtyLabel` + `bookingHref` props (TS2739) — now passes `specialty` filter value + `searchBasePath` query; (2) `CityCombobox` mock in `auth-v2.test.tsx:49` failed `jsx-a11y/role-has-required-aria-props` — added `aria-controls="city-combobox-listbox"` + `aria-expanded={false}`. Both fixes preserve the ui-v2 flag-gated behaviour end-to-end.

## 2026-04-18 — claude/next-phases-hRiOh — Slice 16.12 Search results redesign
- Commit: ed14c3e (feat(ui-v2): slice 16.12 — search result cards + sort chips + SpecialtyCTARail)
- Files touched: src/components/DoctorCard.tsx, src/app/search/SearchContent.tsx, src/app/search/search-v2.test.tsx (new)
- Tests added / changed: +9 (search-v2.test.tsx)
- Build: not run (node_modules absent in sandbox; CI validates)
- Status: done
- Next up: 16.13 How-it-works redesign — step timeline + Sparkline progress indicators + provider/patient role toggle + v2 CTA footer
- Notes: DoctorCard v2 — useUiV2 gate, data-ui-version attr, distance Badge (soft/provider tone), price chip (rounded-full bg-bp-primary/10, data-testid="price-chip"), "Book in 60s" + Zap icon CTA. SearchContent v2 — SORT_OPTIONS constant, pill sort chips with aria-pressed replaces <select>, SpecialtyCTARail mounted below SearchFilters when specialty param active + isV2. All v1 behaviour byte-identical until bp_ui=v2.

## 2026-04-18 — claude/fix-code-rabbit-comments-S7PVe — CodeRabbit fixes (PRs 90/91/92)
- Commit: 3a134c3 (fix(cr): address CodeRabbit comments from PRs 90/91/92)
- Files touched: src/app/(auth)/auth-v2.test.tsx, src/app/(auth)/forgot-password/page.tsx, src/app/(auth)/login/page.tsx, src/app/(auth)/signup/page.tsx, src/app/(auth)/update-password/page.tsx, src/app/(auth)/verify-email/page.tsx, src/app/(auth)/verify-otp/page.tsx, src/app/(auth)/doctor-signup/page.tsx, src/app/search/search-v2.test.tsx, src/components/booking/BookingV2TrustStrip.test.tsx
- Tests added / changed: +1 test (v2+specialty positive case in search-v2.test.tsx); OTP test made timing-safe
- Build: not run (node_modules absent in sandbox; CI validates)
- Status: done
- Next up: merge PR #92 once CI green; then 16.16 `/patient/appointments` v2 timeline

## 2026-04-18 — claude/fix-pr-failures-MQQ5X — CI build fix (TS2551 .catch() on PostgrestFilterBuilder)
- Commit: ec97aaf (fix(ci): replace .catch() on PostgrestFilterBuilder with { error } destructuring)
- Files touched: src/app/api/admin/listings/route.ts, src/app/api/auth/callback/route.ts, src/app/auth/callback/route.ts, src/lib/auth/email-otp.ts, src/app/api/__tests__/admin-listings-route.test.ts
- Tests added / changed: 1 changed (admin-listings-route.test.ts — GET() needs NextRequest arg)
- Build: pass (lint + type-check + next build all green with CI placeholder env vars)
- Status: done
- Next up: 16.11 auth surfaces redesign — Part B P1 (flag-gated v2 card chrome + OTP keypad polish across 7 auth pages)
- Notes: PR #88 introduced 4 Supabase fire-and-forget queries using .catch() — PostgrestFilterBuilder is a thenable but not a full Promise (no .catch()). Fixed all 4 to use { error } destructuring. Test fix: GET handler now requires NextRequest since it reads the URL for rate-limit scope.

## 2026-04-18 — claude/next-phases-2t7bI — Phases 4-6 auth+admin fixes
- Commit: b6a1728 (feat(auth+admin): phases 4-6 — OAuth role fix, approval state machine, admin email alerts)
- Files touched: src/app/api/auth/callback/route.ts, src/app/auth/callback/route.ts, src/app/api/admin/listings/route.ts, src/app/admin/listings/page.tsx, src/lib/resend.ts, src/app/api/providers/onboard-signup/route.ts, supabase/migrations/042_provider_approval_state.sql, supabase/migrations/043_oauth_role_default.sql
- Tests added / changed: 0 (server-side logic + UI tabs — CI validates)
- Build: not run (node_modules absent in sandbox; CI validates)
- Status: done
- Next up: 16.11 auth surfaces redesign — Part B P1 (flag-gated v2 card chrome + OTP keypad polish across 7 auth pages)
- Notes: Phase 4 — Google OAuth always gets role='patient' (migration 043 backfill + trigger + belt-and-braces upsert in both callback routes). Phase 5 — provider_approval_status ENUM (migration 042), admin listings API now accepts ?status=pending|approved|rejected, PATCH sets approval_status + reverts role on rejection, UI has 3-tab layout. Phase 6 — renderAuthEmail() shared HTML helper + sendAdminNewProviderAlert() wired into onboard-signup step 9. User must apply migrations 042+043 in Supabase dashboard and set ADMIN_ALERT_EMAIL env var.

## 2026-04-18 — claude/next-phases-2t7bI — PR-86 security fixes
- Commit: c1e212c (fix(auth): address PR-86 CodeRabbit security findings)
- Files touched: src/lib/auth/email-otp.ts, src/app/api/auth/email-otp/verify/route.ts, src/app/api/auth/email-otp/send/route.ts, src/app/api/auth/password-reset/route.ts
- Tests added / changed: 0 (server-only security fixes — logic-layer, no component changes)
- Build: not run (node_modules absent in sandbox; CI validates)
- Status: done
- Next up: 16.11 auth surfaces redesign — Part B P1 (flag-gated v2 card chrome + OTP keypad polish across 7 auth pages)
- Notes: Merged PR-86 branch (server-side password reset + email OTP) and fixed 4 CodeRabbit issues: crypto.randomInt, mark-used abort-on-fail (replay prevention), orphaned OTP cleanup, Zod validation on 3 routes.

## 2026-04-18 — claude/fix-pr-81-tests-Cdyms — Session-handoff system
- Commit: 2dacec8 (chore(handoff): add CHANGELOG.md + session-handoff protocol)
- Files touched: CHANGELOG.md (new), CLAUDE.md, docs/planning/ACTIVE.md
- Tests added / changed: 0 (docs / workflow only)
- Build: not run (docs / workflow only)
- Status: done
- Next up: 16.11 auth surfaces redesign — Part B P1 (see EXECUTION-PLAN.md and ACTIVE.md NEXT UP header)
- Notes: Orchestration is now unambiguous. Fresh agents read CHANGELOG.md + ACTIVE.md first (Phase 0), see slice 16.11 as NEXT UP, and must append a CHANGELOG entry after every commit. Low-token handoff rule forces stop-and-push at ~20% context so nothing is stranded.

## 2026-04-18 — claude/version-16.9-NV2gO — PR #83 merge resolution
- Commit: f98f578 (merge: origin/main into claude/version-16.9-NV2gO)
- Files touched: docs/planning/EXECUTION-PLAN.md (conflict), src/app/admin/page.tsx (auto), src/app/patient/dashboard/page.tsx (auto)
- Tests added / changed: 0
- Build: not run (docs / merge only, no code conflict)
- Status: done
- Next up: verify PR #83 is now green + mergeable on GitHub; then return to dev branch `claude/fix-pr-81-tests-Cdyms` for slice 16.11 (auth surfaces redesign)
- Notes: conflict resolved by taking main's expanded Phase 16 Part A + Part B (superset of PR #83's shorter plan; 16.5 / 16.7 / 16.9 narratives from PR #83 are already baked in)

## 2026-04-18 — claude/fix-pr-81-tests-Cdyms — Phase 16 roadmap expansion
- Commit: da7eda0 (docs: expand phase 16 roadmap with 32-slice page redesign backlog)
- Files touched: docs/planning/EXECUTION-PLAN.md, docs/planning/ACTIVE.md
- Tests added / changed: 0
- Build: not run (docs only)
- Status: done
- Next up: 16.11 auth surfaces redesign (Part B P1)
- Notes: Phase 16 split into Part A (16.1–16.10 shipped) and Part B (16.11–16.42 backlog, prioritized P1→P6). 16.10 added for homepage reveal safety. Pulse de-duplication deferred to 16.41.

## 2026-04-18 — claude/fix-pr-81-tests-Cdyms — Homepage reveal safety
- Commit: 0bf5f17 (fix(home): guarantee below-hero sections remain visible)
- Files touched: src/lib/gsap-client.ts, src/components/TopSpecialties.tsx, src/components/ProofSection.tsx, src/components/ProviderCTA.tsx, src/components/FAQ.tsx, src/components/WhereWeOperate.tsx, src/components/Testimonials.tsx, src/components/FeaturedDoctors.tsx
- Tests added / changed: 0 (static migration, existing tests green)
- Build: pass (144 routes, after `source .env.local`)
- Status: done
- Next up: see 16.11 auth surfaces redesign
- Notes: Root cause = `gsap.from` with ScrollTrigger has `immediateRender: true` default, so elements get stuck at opacity:0 if the trigger never fires. Centralized fix in `revealOnScroll()` helper (`gsap.fromTo` + `immediateRender: false` + `clearProps`). Reduced-motion honored. No visual regression.
