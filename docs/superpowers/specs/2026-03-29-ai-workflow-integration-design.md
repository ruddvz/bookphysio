# bookphysio.in — AI Workflow Integration Design

> Based on: "How I Actually Build Apps with AI: The Complete Workflow"
> Date: 2026-03-29
> Status: Approved for implementation

---

## Overview

The article describes a five-step AI-assisted development workflow:
1. Wireframe → 2. Validate with AI → 3. Document in markdown → 4. Build feature-by-feature → 5. Test each feature

bookphysio.in already implements steps 1–4 well. The project has:
- `docs/research/` — full visual audit, component specs, interaction patterns (wireframing output)
- `docs/superpowers/specs/bpdesign.md` — validated design spec
- `docs/CODEMAPS/` — architecture and codebase documentation
- `docs/planning/EXECUTION-PLAN.md` — phased feature-by-feature build plan
- `.claude/agents/` + `workflow-101.md` — AI conversation structure

**The gap is step 5: test-as-you-go.** All features have been built without tests — zero tests exist as of 2026-03-29. The project currently defers all testing to Phase 10, which means bugs are invisible until the very end.

**Scope note:** Phases 1–8.6 are out of scope for retroactive testing. This spec closes the testing gap going forward only — from Phase 8.7 onwards.

This spec covers three additions to close that gap:

1. `docs/FEATURES.md` — acceptance criteria per feature (improves AI output quality)
2. `docs/USER_FLOWS.md` — step-by-step flows with error/edge states (improves AI wiring quality in Phase 9)
3. Test-as-you-go discipline — Vitest + Playwright tests written alongside Phase 8.7+ work

---

## 1. FEATURES.md

### Purpose
Convert EXECUTION-PLAN.md's phase steps into explicit, checkable acceptance criteria. The article's insight: when you give AI a feature with acceptance criteria, it builds the right thing. Without criteria, it builds something visual that may not work correctly.

### Format
```markdown
## [Feature Name]

**Route / Component:** `app/(patient)/dashboard`
**Phase:** 8.7
**Status:** [ ] pending / [>] in progress / [x] done
**Tests:** [ ] pending / [x] passing

### Acceptance Criteria
- [ ] Criterion 1 (observable behavior)
- [ ] Criterion 2
- [ ] Criterion 3

### Edge Cases
- Empty state: what renders when there are no appointments
- Error state: what renders when the API fails
- Loading state: skeleton shown while fetching

### Dependencies
- Requires: list of other features or API endpoints
```

The `Status` and `Tests` fields mirror ACTIVE.md's convention (`[ ]` / `[>]` / `[x]`). A step is only fully done when both fields are `[x]`.

### Scope
FEATURES.md is the single source of truth for acceptance criteria. It covers:
- All remaining Phase 8 steps (8.7–8.17), one entry per step
- All Phase 9 API wiring steps, one entry per step

Phase 9 entries are created from `docs/planning/EXECUTION-PLAN.md` Phase 9 section. Do not duplicate Phase 9 descriptions from EXECUTION-PLAN.md — use FEATURES.md as the authoritative criteria reference and treat the EXECUTION-PLAN.md Phase 9 checklist as a status tracker only.

---

## 2. USER_FLOWS.md

### Purpose
The existing `docs/research/PHYSIO_USER_JOURNEY.md` describes the patient journey at a high level (discovery → search → evaluate → book → post-booking). It does not cover:
- Exact step-by-step sequences with screen transitions
- Permission grant/deny paths (microphone, location)
- Error and failure paths (payment failure, OTP timeout, no results)
- Provider and admin flows
- Offline / slow network scenarios

USER_FLOWS.md fills this gap. It is the primary reference for Phase 9 API wiring — when connecting UI to real Supabase/Razorpay/MSG91 APIs, every branch needs to be accounted for.

**Coverage note:** Admin and provider flows (12–13) are documented here for Phase 9 wiring reference. Their Playwright E2E test coverage is deferred to Phase 10 — they are not in the Phase 8 test-scope table below.

**Dependency note:** Phase 8.16 mobile tests reference USER_FLOWS.md by flow number. USER_FLOWS.md must be completed (Implementation Order step 2) before Phase 8.16 test work begins.

### Flows to Document

**Patient flows:**
1. Search → Select Doctor → Book Slot → Pay → Confirmation
2. OTP Login (new user + returning user paths)
3. OTP Login failure (wrong code, expired code, no SMS delivery)
4. Booking failure (payment declined, slot taken between select and pay)
5. Appointment cancellation
6. Patient dashboard: view upcoming, view past, view details

**Provider flows:**
7. Doctor signup (5 steps, ICP number required)
8. Provider login
9. Availability setup
10. Appointment accept / reject
11. Online session join (100ms room) — error paths required: room init failure, camera/mic permission denied by browser, provider disconnects mid-session

**Admin flows:**
12. Admin login
13. Provider approval / rejection

### Format (per flow)
```markdown
## [Flow Name]

**Entry point:** [page/component where flow begins]
**Happy path:**
1. User does X → screen shows Y
2. User does A → screen shows B
3. ...

**Error paths:**
- If [condition]: show [state], offer [recovery action]
- If [condition]: redirect to [page]

**Edge cases:**
- [scenario]: [behavior]
```

---

## 3. Test-as-You-Go Discipline

### The Problem
Zero tests exist as of 2026-03-29. All testing is deferred to Phase 10. This means:
- Bugs from Phase 8 polish are invisible until Phase 10
- Phase 9 API wiring can break Phase 8 UI with no detection
- Phase 10 becomes a debugging marathon rather than a verification pass

### The Fix
Starting with Phase 8.7 (Patient Dashboard Polish), every step produces:
1. **Vitest unit tests** for any client-side logic added (data formatting, state transitions, validation, `generateMetadata` output)
2. **Playwright E2E test** for the critical path of that feature

Phase 10 then becomes: run the existing passing suite + configure CI/CD. Not "write all the tests."

### Test scope per phase step

| Phase Step | Vitest | Playwright |
|---|---|---|
| 8.7 Patient Dashboard | Mock data shape, date formatting | Patient can see upcoming appointment on dashboard |
| 8.8 Patient Appointments | Tab state, filter logic | Patient can view appointment list and detail |
| 8.9 Provider Dashboard | Client-side stats display formatting | Provider sees today's appointments |
| 8.10 Provider Calendar | Slot render logic | Provider can view 7-day calendar |
| 8.11 Provider Availability | Toggle logic, hours validation | Provider can save availability settings |
| 8.12 Provider Earnings | INR amount formatting | Provider can view earnings summary |
| 8.13 Admin Dashboard | Client-side stats display formatting | Admin can access dashboard |
| 8.14 Specialty/City pages | `generateMetadata()` returns correct `title` + `description` for a given slug (call directly, assert returned object → `src/__tests__/metadata.test.ts`) | Landing page renders with correct `<title>` in `<head>` |
| 8.15 Static pages | — | Routes `/about`, `/faq`, `/how-it-works`, `/privacy`, `/terms` load without errors |
| 8.16 Mobile pass | — | Flows 1 (booking), 2 (OTP login), 6 (patient dashboard) from USER_FLOWS.md render correctly at 375px viewport — **begin only after USER_FLOWS.md is complete** |
| 8.17 Empty/loading states | Skeleton component renders without data prop | Empty state shown when appointments list is empty |

**Note on "stats" rows (8.9, 8.13):** "Stats calculation" refers to client-side data transformation (e.g., formatting a number from API response for display). If the calculation lives server-side in an API route, no Vitest test is required for that step — mark Vitest as `—` and note the reason in FEATURES.md.

### Test file locations
- **Vitest unit tests:** co-locate as `[component].test.tsx` for single-component logic; use `src/__tests__/[feature].test.ts` for utilities or logic not tied to one component (e.g., formatters, `generateMetadata`)
- **Playwright E2E:** `e2e/[flow].spec.ts` (directory already scaffolded, files currently empty)

### Rule and Enforcement
**A Phase 8 step is not done until its tests pass.** The `bp-guardian` agent enforces this gate — guardian's HANDOFF veto criteria include: "feature step marked done but tests are absent or failing."

ACTIVE.md step entries include a `tests` field as part of the done definition. Example:

```markdown
- [x] **8.7** Patient Dashboard — upcoming card, quick actions, past appointments
  - tests: [x] Vitest: date formatting, mock data shape | Playwright: patient sees upcoming appointment
```

A step without a green `tests:` line is not mergeable. **FEATURES.md `Tests` field is the authoritative gate; the `tests:` line in ACTIVE.md is a convenience mirror.** If they conflict, FEATURES.md takes precedence.

---

## Implementation Order

Steps 1–3 are independent and can be done in parallel or in any order. Steps 4–5 follow after.

1. **Write `docs/FEATURES.md`** — acceptance criteria for 8.7–8.17 and Phase 9 steps (sourced from EXECUTION-PLAN.md). Note: Phase 9 booking FEATURES.md entry must explicitly call out the "slot taken between select and pay" race condition (Flow 4 in USER_FLOWS.md) as a required error path.
2. **Write `docs/USER_FLOWS.md`** — all 13 flows above, with happy path, error paths, and edge cases
3. **Update ACTIVE.md** — add `tests: [ ]` field to each remaining Phase 8 step entry (see format above); mirror the step list from FEATURES.md
4. **Update EXECUTION-PLAN.md Phase 10** — prepend this note to the Phase 10 section: "Unit and E2E tests for Phases 8.7–8.17 will already exist by the time Phase 10 begins. Phase 10 scope is: run the full suite, fix any failures, and configure CI/CD only."
5. **Apply going forward** — from 8.7 onwards, each step includes tests per the table above; Phase 8.16 begins only after step 2 (USER_FLOWS.md) is complete

---

## What This Does NOT Change

- The agent ecosystem (`bp-orchestrator`, `bp-ui-*`, `bp-backend`, `bp-guardian`) — no structural changes; `bp-guardian` gains explicit test-gate responsibility already implied by its veto role
- The CODEMAPS — no changes
- The design system — no changes
- The build stack — no changes
- Phases 1–8.6 — already done, no retroactive testing required

---

## Success Criteria

- `docs/FEATURES.md` exists with acceptance criteria for all remaining Phase 8 (8.7–8.17) and Phase 9 steps
- `docs/USER_FLOWS.md` exists with all 13 flows documented including error paths and edge cases
- Phase 8.7 onwards: each step has the tests specified in the test-scope table (Section 3), all passing, before it is marked done
- Phase 10 CI/CD pipeline runs an existing passing test suite — not a from-scratch write
