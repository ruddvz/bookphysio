# Workflow 101 — BookPhysio Agent Master Instructions

> **MANDATORY:** Every AI agent in this repository follows this workflow. It ensures correct agent coordination, quality gates, and token efficiency.

---

## UI Polish Mode (Phase 8 — lightweight loop for polish steps)

> When the user says "do Step 8.X" or "work on [page name]", use this instead of full workflow:

1. **Read** the step definition in `docs/planning/EXECUTION-PLAN.md` (Phase 8 section)
2. **Read** the relevant page spec in `docs/superpowers/plans/2026-03-28-ui-build-plan.md`
3. **Read** relevant component spec in `docs/research/components/` if applicable
4. **Read** current file(s) to understand what's already there
5. **Edit** — make only the changes for this step, no scope creep
6. **Build check** — `rtk npm run build` to confirm zero TS errors
7. **Mark done** — tick `[x]` in `EXECUTION-PLAN.md`
8. **Update ACTIVE.md** — move completed items to "Completed" section
9. **Commit** — `rtk git add` + `rtk git commit` with `feat: step 8.X — [page] polish`
10. **Ask** — "Step 8.X done. Ready for Step 8.Y?"

### Design rules (never break these)
- Primary teal: `#00766C`, Dark: `#005A52`, Light: `#E6F4F3`
- Accent CTA: `#FF6B35` — only for primary CTAs
- Surface: `#F5F5F5`, Body bg: `#F7F8F9`
- Font: Inter, Body text: `#333333`, Muted: `#666666`
- Card radius: `8px`, Button radius: `24px`, Max width: `1142px`
- Prices: `₹` integer rupees only — never `$`, never paise
- Phone: `+91` prefix always shown
- Full design spec: `.claude/design-system/DESIGN.md`

---

## Phase 0: Context Gathering (Before Anything Else)

- [ ] **Read Codemaps:** Read `docs/CODEMAPS/OVERVIEW.md` for full architecture, then drill into the relevant area map. This replaces codebase scanning.
    - Available maps: `OVERVIEW.md`, `pages.md`, `components.md`, `api.md`, `lib.md`
- [ ] **Read `CLAUDE.md`:** Root-level project instructions
- [ ] **Check Git Status:** `rtk git status` + `rtk git log --oneline -5`
- [ ] **Read ACTIVE.md:** `docs/planning/ACTIVE.md` for current task queue
- [ ] **Read EXECUTION-PLAN.md:** `docs/planning/EXECUTION-PLAN.md` for phase status

---

## Phase 1: Planning and Analysis

- [ ] **Blast-Radius Analysis:** Consult CODEMAPS to identify all callers, dependents, and tests of files you'll touch. Flag surprising blast radius to user.
- [ ] **Invoke Planner:** Use `planner` agent for complex features (3+ files). Skip for single-file edits.
- [ ] **Consult Architect (if structural):** New route groups, schema changes, new services → `architect` agent first.
- [ ] **Create Feature Branch:** For non-trivial changes: `rtk git checkout -b feat/description`
- [ ] **Draft the Strategy:** Ask user for validation before writing code.

---

## Phase 2: Test-Driven Setup

- [ ] **Consult TDD Guide:** Use `tdd-guide` agent to outline tests for the change.
- [ ] **Prepare E2E Runner:** If UI flow changed, use `e2e-runner` for Playwright scenarios.
- [ ] **Write Failing Tests First (RED):** Create tests before implementation. Verify they fail.

---

## Phase 3: Execution

- [ ] **Implement:** Minimal, focused changes that solve the task. No over-engineering.
- [ ] **Make Tests Pass (GREEN):** Iterate until all tests pass.
- [ ] **Refactor (IMPROVE):** Clean up if needed, without changing behavior.

---

## Phase 4: Automated Verification

- [ ] **Build:** `rtk npm run build` — zero errors
- [ ] **Tests:** `rtk npm test` — all pass
- [ ] **Playwright E2E:** `rtk playwright test` — if E2E tests exist for affected flows
- [ ] **Build Error Resolver:** If build/tests fail unexpectedly, use `build-error-resolver` agent

---

## Phase 5: Quality Review

- [ ] **Code Review:** Use `code-reviewer` agent with blast-radius file set. Must flag CRITICAL/HIGH issues.
- [ ] **Security Review:** Use `security-reviewer` agent. Mandatory for auth, payment, and API route changes.
- [ ] **Review Loop-Back:** CRITICAL issues → go back to Phase 3. Do NOT proceed with unresolved criticals.

> **Tip:** Code review and security review run in parallel (independent agents).

---

## Phase 6: Documentation & Memory

- [ ] **Update Codemaps:** If new files/routes added, update relevant codemap in `docs/CODEMAPS/`
- [ ] **Update Docs:** If UI or API behavior changed, use `doc-updater` agent
- [ ] **Update EXECUTION-PLAN.md:** Mark completed items `[x]`
- [ ] **Update ACTIVE.md:** Move resolved bugs to "Completed" section

---

## Phase 7: Wrap-up & Loop

- [ ] **Ask User:** "What's the next step?" Continue loop until user is done.

---

## Phase 8: Safe Push to GitHub

> **NEVER push blindly.** Every push passes through these gates:

- [ ] **Build:** `rtk npm run build` — zero errors
- [ ] **Lint:** `rtk npm run lint` — resolve errors
- [ ] **Tests:** `rtk npm test` — all pass
- [ ] **Diff Review:** `rtk git diff --staged` — scan for:
    - Hardcoded secrets or API keys
    - Debug `console.log` left behind
    - Unintended file changes
    - Files that should be in `.gitignore`
- [ ] **Commit:** `rtk git add [files]` + `rtk git commit -m "type: description"`
- [ ] **Push:** `rtk git push` — only after ALL checks green
- [ ] **Verify:** `rtk git status` shows "up to date"

---

## Quick Reference: Agents

| Agent | File | When to Use |
|-------|------|-------------|
| `bp-orchestrator` | `.claude/agents/bp-orchestrator.md` | Task routing + coordination |
| `bp-guardian` | `.claude/agents/bp-guardian.md` | QA gate, verification, veto |
| `bp-ui-public` | `.claude/agents/bp-ui-public.md` | Public pages, auth, shared components |
| `bp-ui-patient` | `.claude/agents/bp-ui-patient.md` | Patient dashboard |
| `bp-ui-provider` | `.claude/agents/bp-ui-provider.md` | Provider portal |
| `bp-ui-admin` | `.claude/agents/bp-ui-admin.md` | Admin panel |
| `bp-backend` | `.claude/agents/bp-backend.md` | API routes, Supabase, Razorpay, services |
| `bp-ui` | `.claude/agents/bp-ui.md` | Cross-portal UI (generic) |
| `planner` | `.claude/agents/planner.md` | Complex feature planning |
| `architect` | `.claude/agents/architect.md` | System design decisions |
| `tdd-guide` | `.claude/agents/tdd-guide.md` | Test-driven development |
| `code-reviewer` | `.claude/agents/code-reviewer.md` | Code review after writing |
| `security-reviewer` | `.claude/agents/security-reviewer.md` | Security audit |
| `build-error-resolver` | `.claude/agents/build-error-resolver.md` | Fix build failures |
| `e2e-runner` | `.claude/agents/e2e-runner.md` | Playwright E2E tests |
| `typescript-reviewer` | `.claude/agents/typescript-reviewer.md` | TS/JS code review |
| `database-reviewer` | `.claude/agents/database-reviewer.md` | SQL, schema, RLS review |
| `doc-updater` | `.claude/agents/doc-updater.md` | Documentation updates |
| `refactor-cleaner` | `.claude/agents/refactor-cleaner.md` | Dead code cleanup |

## Quick Reference: Codemaps

| Map | Covers | Use When |
|-----|--------|----------|
| `docs/CODEMAPS/OVERVIEW.md` | Full architecture, agent ownership, dependency flows | Start of every session |
| `docs/CODEMAPS/pages.md` | Every route, component imports, Server/Client type | Page changes, routing |
| `docs/CODEMAPS/components.md` | All shared components, props, who imports them | Component changes |
| `docs/CODEMAPS/api.md` | API routes, methods, contracts, validation schemas | Backend changes |
| `docs/CODEMAPS/lib.md` | Service clients, env vars, validation schemas | Integration changes |
