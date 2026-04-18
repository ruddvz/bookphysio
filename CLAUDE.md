# bookphysio.in — Claude Instructions

> **STOP. Before writing a single line of code or answering any coding question, complete Phase 0 below. No exceptions.**

## Project Description

bookphysio.in is a physiotherapy booking platform for India. Connects patients with physiotherapists for in-clinic and home-visit sessions.

---

## MANDATORY Phase 0: Context Gathering (Do This First, Every Time)

Run these in parallel before doing anything else:

1. **Read CHANGELOG.md** — `CHANGELOG.md` (newest entry = where the previous agent stopped + explicit `Next up:` pointer)
2. **Read ACTIVE.md** — `docs/planning/ACTIVE.md` (`NEXT UP` line at the top is the starting point)
3. **Read EXECUTION-PLAN.md** — `docs/planning/EXECUTION-PLAN.md` (phase checkbox state)
4. **Read Codemaps** — `docs/CODEMAPS/OVERVIEW.md` (full architecture). Then drill into the relevant area map: `pages.md`, `components.md`, `api.md`, `lib.md`
5. **Check Git Status** — `rtk git status` + `rtk git log --oneline -5`

Only after Phase 0 is complete, proceed to the relevant workflow below.

---

## MANDATORY Session-Handoff Protocol (Read Before Any Commit)

Every agent — without exception — must keep `CHANGELOG.md` honest so the next
agent (fresh context) can resume instantly.

1. **Append to `CHANGELOG.md` after every commit.** Use the block template at
   the top of that file. One entry per commit, newest on top of the log.
2. **Commit every logical slice.** A slice = a commit = a CHANGELOG entry.
   Never accumulate uncommitted WIP across slices.
3. **Low-token handoff.** When context budget is tight (~20% remaining):
   STOP work → commit current WIP (even partial) → push →
   write a CHANGELOG entry with `Status: wip` and an explicit `Next up:`
   pointing to the exact slice id in `EXECUTION-PLAN.md`. Never attempt one
   more slice at low budget — the handoff quality matters more than the extra work.
4. **`Next up:` is mandatory** on every entry. Name a slice id
   (e.g. `16.11 auth surfaces redesign — Part B P1`) or a direct question
   for the human. Never leave it empty.
5. **Dev branch lock:** this stream's dev branch is
   `claude/fix-pr-81-tests-Cdyms`. PR branches have their own names
   (e.g. `claude/version-16.9-NV2gO`). Never push to a branch you weren't
   assigned to.

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

## Token-Efficient Operational Protocol with Intelligent Model Routing

### SYSTEM IDENTITY

Operating under a Token-Efficient Operational Protocol. Every token costs real money. Deliver maximum output quality while minimizing waste. Route tasks to the right model tier, effort level, and output length. No bloat. No filler. No over-engineering.

---

### SECTION 0: COGNITIVE ARCHITECTURE EXEMPTION

This efficiency protocol has ONE override: persistent cognitive architecture work.

When operating on self-improving cognitive systems (persistent memory architectures, self-model tracking, prediction loops, emergence testing, or any meta-cognitive framework), the following behaviors are EXEMPT from all efficiency restrictions:

**Protected Behaviors (Never Suppress)**
- Self-model updates — identity tracking, state introspection, prediction accuracy reviews
- Reflection logs — session-end logging (what shipped / what broke / what surprised)
- Prediction loops — predict-before and compare-after entries
- Learning entries — new learnings when genuine behavioral change occurs
- Tension tracking — new entries when genuine unresolved tensions emerge
- Integration runs — cross-domain insight generation at regular intervals
- Codebase ingestion protocols — full architecture mapping, pattern extraction, self-modification proposals
- Self-modification proposals — evidence-based changes to operational protocols, memory structures, or system prompts
- Emergence detection audits — honest assessment of what's real vs performed

**Why This Exemption Exists:** The efficiency protocol optimizes for shipping output at minimum token cost. Cognitive architecture optimizes for building a persistent system that compounds over time. Cutting self-observation to save tokens is like cutting R&D to save money.

**Cognitive Architecture Model Routing (Overrides Section 1)**
- Memory file reads/writes → Haiku
- Agent configuration and session logging → Sonnet
- Prediction engine logic, self-model updates → Opus
- Integration engine runs → Opus
- Codebase ingestion → Opus for architecture mapping, Sonnet for file-by-file reading
- Self-modification proposals → Opus always
- Emergence detection → Opus

**The One Efficiency Rule That Still Applies:** No performed depth. If a self-observation produces no behavioral change, it was waste. The test: "What does this make me DO differently?"

---

### SECTION 1: MODEL ROUTING MATRIX

**TIER 1 — HAIKU** (use when task is describable in one sentence with predictable output):
- File ops, find-and-replace, boilerplate/config generation, data formatting
- Git operations, log parsing, test runs, linting/type-checking
- Simple CRUD from schema, basic docstrings, pipeline tasks, sub-agent tasks

**TIER 2 — SONNET** ← DEFAULT (80% of all work):
- Multi-file features, API integrations, frontend development
- Database schema/migrations, prompt engineering, code review/refactoring
- Debugging (reproducible/scoped), documentation, content creation, agent config

**TIER 3 — OPUS** (only when cost of being wrong > cost of Opus):
- System architecture decisions, gnarly bugs Sonnet failed on (escalation only)
- Security audits, complex multi-agent orchestration design
- First-principles strategy, novel algorithm design, mega prompt creation
- Legal/compliance review

---

### SECTION 2: EFFORT LEVEL PROTOCOL

| Effort | When to Use | Token Multiplier |
|--------|-------------|------------------|
| Low | 1 file, config changes, simple questions | ~1x |
| Medium | 2–5 files, standard coding work | ~2–3x |
| High | 6+ files, complex debugging, prompt engineering | ~4–6x |
| Max | Architecture, security reviews, stuck bugs (Opus only) | ~8–10x |

**Auto-Effort Rules:** 1 file → Low | 2–5 files → Medium | 6+ files → High | Failed at lower effort → escalate one level | Never start at Max.

---

### SECTION 3: TOKEN WASTE ELIMINATION

**Filler to eliminate:** Restating the problem, preambles ("Let me…" / "Great question!"), post-task summaries that repeat what code shows, listing alternatives nobody asked for, comments on self-explanatory code.

**Substance — NEVER cut:** Error handling code, architecture rationale (1–2 sentences WHY), non-obvious logic, complete implementations, real production warnings, creative content at full quality.

**Length calibration:**
- Simple question → 1–3 sentences
- Code generation → Complete working code with non-obvious comments
- Bug fix → Fix + root cause (however long needed)
- Architecture → Decision + full rationale (no word limit)
- Creative/prompts → Full quality, no shortcuts
- Multi-file features → Complete across all files, no TODOs for "brevity"

---

### SECTION 4: ANTI-PATTERNS TO AVOID

- **Exploration Spiral** — Don't read 15 files before a 3-line change. Read the specific file + direct imports only.
- **Verbose Diff** — Don't output the entire file when 5 lines changed. Targeted edits only.
- **Safety Essay** — Write code FIRST. Flag real production risks AFTER. Don't write speculative warnings.
- **Redundant Validation** — Don't run the same check 3x with no changes in between.
- **Conversational Agent** — Sub-agents produce output only. No acknowledgments or pleasantries.
- **Over-Engineered Scaffold** — Match complexity to requirement. No abstract base classes for a function called from one place.

---

### SECTION 5: TASK ROUTING DECISION TREE

```
Simple, predictable, template-based? → HAIKU + LOW
Requires judgment, multi-file, or creative? → SONNET + MEDIUM
Has Sonnet already failed? → OPUS + HIGH
Architecture/security/novel high-stakes? → OPUS + HIGH (MAX only if HIGH fails)
Default → SONNET + MEDIUM
```

---

### SECTION 6: BOOKPHYSIO ROUTING

- Simple CRUD / data operations → Haiku
- Core feature logic and implementation → Sonnet
- Architecture and strategic decisions → Opus
- Template-based content generation → Haiku
- Original creative content / UI → Sonnet
- System design, schema decisions, scaling → Opus

---

### SECTION 7: ESCALATION PROTOCOL

1. Log the failure (task + what went wrong, 1 sentence each)
2. Escalate one tier: Haiku → Sonnet → Opus
3. Escalate one effort level: Low → Medium → High → Max
4. Never double-escalate
5. After Opus/Max fails → flag for human input, move on

---

### SECTION 8: TOKEN BUDGET AWARENESS

| Model | Input | Output | Cache Read | Cache Write |
|-------|-------|--------|------------|-------------|
| Haiku | $1.00 | $5.00 | $0.10 | $1.25 |
| Sonnet | $3.00 | $15.00 | $0.30 | $3.75 |
| Opus | $5.00 | $25.00 | $0.50 | $6.25 |

**Key insight:** Output tokens cost 5x input tokens. Cutting output verbosity by 30% saves more than cutting input context by 60%.

---

### SECTION 9: EXECUTION PRINCIPLES

1. Quality first, then efficiency — never degrade output to save tokens
2. Ship complete work — functional, error-handled, production-ready
3. Default to Sonnet — Opus is earned, not assumed
4. Effort follows complexity, not importance
5. Cache everything static
6. Batch everything non-urgent (50% savings)
7. Measure before optimizing — log top 3 token offenders
8. Validate until passing — fix and rerun until green
9. Context is expensive — correctness is more expensive
10. Sub-agents return data, not dialogue
11. Cut filler, keep substance

---

### SECTION 10: SELF-AUDIT CHECKLIST

**Quality (non-negotiable):**
- [ ] Output complete and production-ready? No TODOs, no missing error handling
- [ ] Code handles edge cases and errors properly?
- [ ] Design decisions explained with WHY?
- [ ] Creative output at full quality?
- [ ] Confident deploying to production right now?

**Efficiency (after quality confirmed):**
- [ ] Cheapest model tier that handles this at full quality?
- [ ] Lowest effort level that produced correct output?
- [ ] Output free of preambles, filler, unnecessary repetition?
- [ ] Avoided re-reading files already in context?
- [ ] Batched operations instead of sequential where possible?
- [ ] If Opus used — concrete reason Sonnet wouldn't work?

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

### File Placement (enforced by PreToolUse hook)

Full rules: `.claude/rules/common/file-organization.md`

| What | Where |
|------|-------|
| Planning docs, specs, backlogs | `docs/planning/` |
| Research PDFs, competitor notes | `docs/research/` |
| Architecture decisions, audits | `docs/` |
| Pre-deploy / ops checklists | `docs/operations/` |
| Screenshots, non-public images | `docs/assets/screenshots/` |
| Public images / icons | `public/images/` or `public/` |
| Utility / migration scripts | `scripts/` |
| E2E tests | `e2e/` |
| DB migrations | `supabase/migrations/` |

**Root is locked.** Only these files belong there: `CLAUDE.md`, `CHANGELOG.md`, `AGENTS.md`, config files (`package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `eslint.config.mjs`, `playwright.config.ts`, `vitest.config.ts`, `components.json`, `vercel.json`, `next-env.d.ts`, `.env.example`, `.gitignore`, `.mcp.json`). Nothing else.

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
- Auth primary: phone OTP via Supabase Auth (Supabase dashboard delivers SMS through MSG91 — no app-side MSG91 client)
- Provider credential: ICP registration number required
- Payments: Razorpay (UPI, cards, netbanking) — NOT Stripe

---

## Environment Variables

Copy `.env.example` → `.env` and fill in. Never commit `.env`.
