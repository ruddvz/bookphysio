# bookphysio.in — Claude Instructions

## Project Description

bookphysio.in is a physiotherapy booking platform for India. Connects patients with physiotherapists for in-clinic, home-visit, and online sessions.

## Workflow

All agents MUST follow `.claude/workflow-101.md` sequentially for every prompt.

## Agent System

Agents live in `.claude/agents/`. GSD system in `.claude/gsd-system/`.

| Agent | Purpose |
|-------|---------|
| planner | Implementation planning |
| architect | System design decisions |
| tdd-guide | Test-driven development |
| code-reviewer | Code review after writing |
| security-reviewer | Security audit before commits |
| build-error-resolver | Fix build failures |
| e2e-runner | E2E testing |
| doc-updater | Docs and codemaps |
| typescript-reviewer | TS/JS review |
| database-reviewer | SQL, schema, migrations |

## Development Commands

```bash
# (to be filled in once stack is chosen)
npm run dev
npm run build
npm run test
npm run lint
```

## Key Conventions

- RTK prefix on ALL commands: `rtk git status`, `rtk npm run build`
- Read `docs/CODEMAPS/OVERVIEW.md` before touching code — never scan blindly
- All user input validated with Zod schemas
- No hardcoded secrets — use `.env`
- Immutable data patterns — never mutate state in place
- Files max 800 lines, functions max 50 lines

## Planning Docs

- `docs/planning/ACTIVE.md` — open bugs / urgent tasks
- `docs/planning/EXECUTION-PLAN.md` — roadmap with phase checkboxes
- `memories/repo/` — lessons learned, architecture notes

## Environment Variables

Copy `.env.example` → `.env` and fill in.
