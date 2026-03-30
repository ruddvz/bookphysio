# bookphysio.in — Claude Instructions

> **STOP. Before writing a single line of code or answering any coding question, complete Phase 0 below. No exceptions.**

## Project Description

bookphysio.in is a physiotherapy booking platform for India. Connects patients with physiotherapists for in-clinic, home-visit, and online sessions.

---

## MANDATORY Phase 0: Context Gathering (Do This First, Every Time)

Run these in parallel before doing anything else:

1. **Read Codemaps** — `docs/CODEMAPS/OVERVIEW.md` (full architecture). Then drill into the relevant area map: `pages.md`, `components.md`, `api.md`, `lib.md`
2. **Check Git Status** — `rtk git status` + `rtk git log --oneline -5`
3. **Read ACTIVE.md** — `docs/planning/ACTIVE.md` (current task queue, what's next)
4. **Read EXECUTION-PLAN.md** — `docs/planning/EXECUTION-PLAN.md` (phase status)

Only after Phase 0 is complete, proceed to the relevant workflow below.

---

## Full Workflow: `.claude/workflow-101.md`

**All phases are mandatory.** The workflow covers:

- **UI Polish Mode** (Phase 8 steps) — lightweight loop for polish steps
- **Phase 1: Planning & Analysis** — blast-radius check, planner agent, feature branch
- **Phase 2: TDD Setup** — tdd-guide agent, write failing tests first
- **Phase 3: Execution** — implement, green tests, refactor
- **Phase 4: Automated Verification** — `rtk npm run build`, `rtk npm test`, Playwright
- **Phase 5: Quality Review** — code-reviewer + security-reviewer agents (parallel)
- **Phase 6: Docs & Memory** — update codemaps, EXECUTION-PLAN.md, ACTIVE.md
- **Phase 7: Wrap-up** — ask user for next step
- **Phase 8: Safe Push** — build → lint → test → diff scan → commit → push

Read the full checklist in `.claude/workflow-101.md` and follow it step by step.

---

## UI Polish Mode (Phase 8 — Current Focus)

When user says "do Step 8.X" or "work on [page]":

1. Read the step in `docs/planning/EXECUTION-PLAN.md`
2. Read the spec in `docs/superpowers/plans/2026-03-28-ui-build-plan.md`
3. Read relevant component spec in `docs/research/components/` if applicable
4. Read current file(s)
5. Edit — changes for this step only, no scope creep
6. Build check — `rtk npm run build` (zero TS errors)
7. Mark done — tick `[x]` in `EXECUTION-PLAN.md` and `ACTIVE.md`
8. Commit — `rtk git add` + `rtk git commit -m "feat: step 8.X — [page] polish"`
9. Ask — "Step 8.X done. Ready for Step 8.Y?"

**Next step:** Step 8.7 — Patient Dashboard Polish

---

## Token Efficiency (MANDATORY)

**ALL commands must use `rtk` prefix** — no exceptions, including `&&` chains:

```bash
# Build & check
rtk npm run build
rtk npm run lint
rtk npm test
rtk next build

# Git
rtk git status
rtk git log --oneline -5
rtk git diff
rtk git add [files]
rtk git commit -m "type: description"
rtk git push

# Playwright
rtk playwright test
```

---

## Agent System

Use agents proactively — don't wait to be asked:

| Agent | When to Use |
|-------|-------------|
| `planner` | Complex features (3+ files) |
| `architect` | New routes, schema changes, new services |
| `tdd-guide` | New features, bug fixes — write tests FIRST |
| `code-reviewer` | After writing any code |
| `security-reviewer` | Auth, payment, API route changes |
| `build-error-resolver` | Build or type errors |
| `e2e-runner` | UI flow changes |
| `typescript-reviewer` | TS/JS changes |
| `database-reviewer` | SQL, schema, RLS |
| `doc-updater` | After adding files/routes |
| `bp-orchestrator` | Task routing |
| `bp-guardian` | QA gate, verification, veto |

Run `code-reviewer` + `security-reviewer` **in parallel** (they're independent).

---

## Design System (Never Break These)

- Primary teal: `#00766C` | Dark: `#005A52` | Light: `#E6F4F3`
- Accent CTA: `#FF6B35` — only for primary CTAs
- Surface: `#F5F5F5` | Body bg: `#F7F8F9` | Body text: `#333333` | Muted: `#666666`
- Font: Inter | Card radius: `8px` | Button radius: `24px` | Max width: `1142px`
- Currency: `₹` integer rupees only — never `$`, never paise
- Phone: `+91` prefix always shown
- Full spec: `.claude/design-system/DESIGN.md`

---

## Key Conventions

- Read `docs/CODEMAPS/OVERVIEW.md` before touching code — never scan blindly
- All user input validated with Zod schemas
- No hardcoded secrets — use `.env`, document in `.env.example`
- Immutable data patterns — never mutate state in place
- Files max 800 lines, functions max 50 lines
- Server Components by default — `'use client'` only when needed
- `src/components/shared/` owned by `bp-ui-public` — others read-only

---

## Planning Docs

- `docs/planning/ACTIVE.md` — open bugs / urgent tasks (read at session start)
- `docs/planning/EXECUTION-PLAN.md` — roadmap with phase checkboxes
- `docs/superpowers/specs/bpdesign.md` — full design spec (approved)
- `memories/repo/` — lessons learned, architecture notes

---

## India-Specific Rules

- Currency: INR (₹), stored as integer rupees — NEVER paise, NEVER Stripe
- Phone: +91 XXXXX XXXXX, E.164 in DB, Zod validated
- Pincode: 6-digit, regex `/^[1-9][0-9]{5}$/`
- GST: 18%, computed server-side only, stored in `payments.gst_amount_inr`
- Auth primary: phone OTP via MSG91 (not email)
- Provider credential: ICP registration number required
- Payments: Razorpay (UPI, cards, netbanking) — NOT Stripe

---

## Environment Variables

Copy `.env.example` → `.env` and fill in. Never commit `.env`.
