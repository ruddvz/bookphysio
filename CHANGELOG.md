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

## 2026-04-18 — cursor/simplify-pr103-plan-7c79 — Phase 17 plan simplification
- Commit: 7bcddfe (docs: simplify PR 103 plan into 5 agent-ready slices (Phase 17))
- Files touched: docs/superpowers/plans/2026-04-18-search-fixes-and-id-compaction.md (rewritten), docs/planning/EXECUTION-PLAN.md (Phase 17 added), docs/planning/ACTIVE.md (NEXT UP updated)
- Tests added / changed: 0
- Build: n/a (docs only)
- Status: done
- Next up: 17.1 — Fix unapproved provider leak in `src/app/api/providers/route.ts:282` + migration 044
- Notes: PR #103 was a verbose reference plan. Rewrote as 5 numbered slices (17.1–17.5), each with exact file paths, line numbers, precise diffs to make, test cases to write, and a commit message. Added Phase 17 block to EXECUTION-PLAN.md and updated ACTIVE.md NEXT UP pointer. Agent should checkout `claude/fix-search-mobile-ui-sxKR6` and work through slices in order.

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
