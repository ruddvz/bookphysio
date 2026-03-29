# Claude Code System — Master Index

Complete snapshot of your entire Claude Code setup. Everything needed to bootstrap any new project from zero.

#claude-code #system #reference #second-brain

---

## New Project Checklist

```
[ ] Copy workflow-101.md → .github/workflow-101.md
[ ] Copy gsd-system/skills/ → .github/skills/
[ ] Copy gsd-system/agents/ → .github/agents/
[ ] Copy agents/ → .claude/agents/
[ ] Copy rules/ → .claude/rules/  (pick your language stack)
[ ] Set up .env from [[templates/env/.env.example]]
[ ] Wire claude-organize hook from [[hooks/project-settings.json]]
[ ] Set up API proxy if using LLMs: [[templates/api-proxy/api-proxy.js]]
[ ] Create CLAUDE.md with project context
[ ] Run /vault-setup for long-term projects
[ ] Use /daily each morning, /tldr to close sessions
```

---

## Core Workflow

### [[workflow-101]]
Mandatory 8-phase checklist every agent follows on every prompt:
- **Phase 0** Context gathering (memory, CLAUDE.md, codemaps)
- **Phase 1** Planning & blast-radius analysis
- **Phase 2** TDD setup — write failing tests first
- **Phase 3** Execution
- **Phase 4** Automated verification (Playwright, lint, build)
- **Phase 5** Deep quality review (code-reviewer + security-reviewer)
- **Phase 6** Documentation & memory update
- **Phase 7** Wrap-up, ask "what's next?"
- **Phase 8** Safe push to GitHub

---

## Environment & Configuration

### [[templates/env/.env.example]]
Template for any AI-powered project. Covers:
- Gemini / Pollinations.AI proxy URLs
- Headroom token caching (`ANTHROPIC_BASE_URL`) — saves ~34% tokens
- Claude Organize bypass flags
- Never commit real keys — copy this, fill in values, add to `.gitignore`

### [[organizing.md]]
Complete blueprint for `claude-organize` — auto-sorts every file Claude creates into the right folder. Wire it once as a PostToolUse hook and never deal with project root clutter again.

**19 auto-sort categories:**
- Docs: `testing/ analysis/ architecture/ operations/ development/ planning/ troubleshooting/ cleanup/ general/`
- Scripts: `checks/ testing/ deployment/ utilities/ fixes/ database/ debug/ setup/ workflows/ activation/`

---

## API Proxy Pattern

For any project using an LLM API — keeps your API keys off the frontend.

### [[templates/api-proxy/api-proxy.js]]
Express.js backend proxy. Drop-in for local dev:
- Rate limiting (30 req/min general, 10/min for AI endpoints)
- Helmet security headers + CORS
- Gemini 2.0 Flash integration with system prompt control
- Temperature, max tokens, safety filters

### [[templates/api-proxy/api-proxy-template.js]]
Same pattern but works on **Vercel, Netlify, or local Node**. Use this for deployments.

---

## Design System

### [[design-system/DESIGN.md]]
Living design system doc. Update this every project — it's the single source of truth for tokens, typography, and components.

**Key tokens from C4K (reusable dark UI starting point):**
- Background: `#1e2029` body, `#2a2c38` surface
- Accent: `#ffffff` primary, `#ff4d4f` secondary (swap this per brand)
- Radius: `32px` cards, `999px` pills
- Typography: Inter/Outfit, 0.65rem–3.5rem scale

---

## Hooks

### [[hooks/project-settings.json]]
Project-level `.claude/settings.json`. Wires `claude-organize` to run after every Write/Edit. Copy into any new project's `.claude/` folder.

### [[hooks/hooks.json]]
Global hook system — the full automation layer:
- **PreToolUse**: Block `--no-verify` git bypass, security monitoring, strategic compaction reminders
- **PostToolUse**: Prettier formatting, TypeScript checking, PR logging, console.log warnings
- **Lifecycle**: Session persistence, cost tracking, pattern extraction

### [[hooks/README.md]]
How hooks work — PreToolUse vs PostToolUse vs Stop vs SessionStart. How to block vs warn. How to disable per-session with env vars.

### [[hooks/global-settings.json]]
Global `~/.claude/settings.json` — permissions, additional directories, session start hooks.

---

## MCP Servers

### [[mcp-configs/mcp-servers.json]]
30+ pre-configured MCP integrations. Copy and add your API keys:

| MCP | Purpose |
|-----|---------|
| GitHub | PR/issue management, code search |
| Firecrawl | Web scraping |
| Supabase | Database operations |
| Memory | Persistent cross-session memory |
| Sequential-Thinking | Step-by-step reasoning |
| Vercel / Railway | Deployment |
| Cloudflare | Workers, docs, observability |
| Exa | Neural web search |
| Context7 | Library docs lookup |
| Playwright | Browser automation |
| DevFleet | Multi-agent orchestration |
| fal.ai | Image/video/audio generation |
| InsAIts | Security monitoring |

---

## Agents (29 global)

Live in `~/.claude/agents/` — available in every project automatically.

| Agent | Purpose |
|-------|---------|
| [[agents/planner]] | Implementation planning for complex features |
| [[agents/architect]] | System design decisions |
| [[agents/code-reviewer]] | Review code after writing |
| [[agents/tdd-guide]] | Test-driven development enforcement |
| [[agents/security-reviewer]] | Vulnerability detection before commits |
| [[agents/typescript-reviewer]] | TypeScript/JS code review |
| [[agents/python-reviewer]] | Python code review |
| [[agents/rust-reviewer]] | Rust code review |
| [[agents/go-reviewer]] | Go code review |
| [[agents/kotlin-reviewer]] | Kotlin/Android review |
| [[agents/java-reviewer]] | Java/Spring Boot review |
| [[agents/cpp-reviewer]] | C++ review |
| [[agents/flutter-reviewer]] | Flutter/Dart review |
| [[agents/e2e-runner]] | Playwright E2E testing |
| [[agents/build-error-resolver]] | Fix build/TypeScript errors |
| [[agents/database-reviewer]] | PostgreSQL/Supabase review |
| [[agents/doc-updater]] | Update docs and codemaps |
| [[agents/refactor-cleaner]] | Dead code cleanup |
| [[agents/security-reviewer]] | Security scanning |
| [[agents/loop-operator]] | Monitor autonomous loops |

---

## Slash Commands (60 global)

Live in `~/.claude/commands/`.

**Dev:** `/plan` `/tdd` `/code-review` `/build-fix` `/verify` `/e2e` `/test-coverage` `/quality-gate` `/refactor-clean`

**Language:** `/cpp-build` `/cpp-review` `/cpp-test` · `/go-build` `/go-review` `/go-test` · `/kotlin-build` `/kotlin-review` `/kotlin-test` · `/rust-build` `/rust-review` `/rust-test` · `/gradle-build` `/python-review`

**Session:** `/save-session` `/resume-session` `/sessions` `/checkpoint` `/context-budget`

**Docs:** `/update-docs` `/update-codemaps` `/docs`

**Learning:** `/skill-create` `/skill-health` `/learn` `/learn-eval` `/evolve` `/instinct-status` `/instinct-import` `/instinct-export` `/promote` `/rules-distill`

**Multi-model:** `/multi-plan` `/multi-frontend` `/multi-backend` `/multi-execute` `/multi-workflow` `/orchestrate` `/devfleet`

**Utility:** `/enhance` `/prompt-optimize` `/model-route` `/loop-start` `/loop-status` `/aside` `/eval` `/harness-audit` `/claw` `/pm2`

**Second Brain:** `/vault-setup` `/daily` `/tldr` `/file-intel`

---

## GSD System (Get Shit Done)

Lives in `.github/` — structured project execution with phases, milestones, and autonomous loops.

**18 agents:** [[gsd-system/agents/gsd-planner]] · [[gsd-system/agents/gsd-executor]] · [[gsd-system/agents/gsd-verifier]] · [[gsd-system/agents/gsd-debugger]] and 14 more

**57 skills — key ones:**
- [[gsd-system/skills/gsd-do]] — Execute any task end-to-end
- [[gsd-system/skills/gsd-autonomous]] — Full autonomous mode
- [[gsd-system/skills/gsd-plan-phase]] / [[gsd-system/skills/gsd-execute-phase]] — Phase management
- [[gsd-system/skills/gsd-debug]] — Systematic debugging
- [[gsd-system/skills/gsd-health]] — Project health check
- [[gsd-system/skills/gsd-forensics]] — Deep investigation
- [[gsd-system/skills/gsd-fast]] — Speed mode

---

## Rules (Coding Standards)

Live in `~/.claude/rules/`. Pick the language folders that match your stack.

**Always include common/:**
- [[rules/common/coding-style]] — Immutability, file size limits, error handling
- [[rules/common/testing]] — 80% coverage, TDD mandatory
- [[rules/common/security]] — No hardcoded secrets, OWASP top 10
- [[rules/common/git-workflow]] — Conventional commits, PR process
- [[rules/common/development-workflow]] — Full feature pipeline: research → plan → TDD → review → commit
- [[rules/common/performance]] — Model selection (Haiku/Sonnet/Opus), context window management
- [[rules/common/agents]] — When to use which agent

**Language-specific (pick one or more):**
`rules/typescript/` · `rules/python/` · `rules/golang/` · `rules/kotlin/` · `rules/rust/` · `rules/swift/` · `rules/java/` · `rules/cpp/` · `rules/php/` · `rules/perl/`

---

## Architecture Docs (Codemaps Template)

### [[codemaps-template/OVERVIEW.md]]
How to document a codebase — module index, dependency graph, line counts, architecture overview.

8 template files:
`OVERVIEW` · `app-shell` · `common` · `components` · `routes` · `services` · `types` · `config-and-backend`

Copy these into `docs/CODEMAPS/` for any new project and fill in your architecture.

---

## Build & Deploy Templates

### [[templates/webpack.config.js]]
Advanced Webpack 5 config with:
- Thread-loader parallelization (uses all CPU cores)
- CSS Modules + cssnano minification
- Source maps: `eval-source-map` dev, `source-map` prod
- WASM worker entry point
- Commit hash in output paths

### [[templates/ci-cd/]]
- `build.yml` — Node 20 + pnpm CI with lint, test, build
- `release.yml` — Automated release workflow
- `Dockerfile` — Multi-stage Alpine build, pnpm + corepack, Express static server

### [[templates/scripts/]]
- `setup.sh` / `setup.bat` — Cross-platform project bootstrap
- `start-claude.sh` / `start-claude.bat` — Start Headroom token proxy
- `token-optimization.sh` / `token-optimization.bat` — Configure 34% token savings
- `http_server.js` — Express static file server with smart caching

---

## Global Config Reference

### [[global-CLAUDE.md]]
RTK (Rust Token Killer) — token-optimized command wrappers. 80–99% savings on builds, tests, git, GitHub CLI.

### [[global-AGENTS.md]]
Full agent orchestration guide — when to use parallel agents, how to split roles (factual, senior engineer, security, consistency), multi-perspective analysis.

---

## Second Brain Skills

- [[skills/vault-setup]] — `/vault-setup` Personalize vault for your role
- [[skills/daily]] — `/daily` Morning briefing from vault
- [[skills/tldr]] — `/tldr` Save session summary to vault
- [[skills/file-intel]] — `/file-intel` Synthesize documents via Gemini
