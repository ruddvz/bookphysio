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

## 2026-04-18 — claude/next-phases-2t7bI — PR-88 CodeRabbit security fixes
- Commit: a78fe94 (fix(auth): address PR-88 CodeRabbit security findings)
- Files touched: src/lib/auth/email-otp.ts, src/app/api/auth/email-otp/verify/route.ts, src/app/api/auth/email-otp/send/route.ts, src/app/api/auth/password-reset/route.ts, supabase/migrations/044_email_otps_security.sql, .env.example
- Tests added / changed: 0 (security fixes — logic-layer)
- Build: not run (node_modules absent in sandbox; CI validates)
- Status: done
- Next up: 16.11 auth surfaces redesign — Part B P1
- Notes: 5 CodeRabbit findings fixed: (1) plaintext OTP → HMAC-SHA256 code_hash (migration 044 + app code); (2) .catch() compile error on PostgrestFilterBuilder → proper await+error check; (3) mark-used race condition → .select('id').single() so zero-rows-updated is fatal; (4) send resend depends on transient email_otps → get_user_id_by_email() RPC; (5) password-reset user enumeration → maskedResponse for all post-generateLink failures. USER ACTION: apply migration 044, set EMAIL_OTP_SECRET env var.

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
