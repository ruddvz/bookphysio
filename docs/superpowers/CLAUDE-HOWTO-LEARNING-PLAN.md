# Claude How-To Learning Plan
*Source: https://github.com/luongnv89/claude-howto*
*Created: 2026-03-29*

## Should You Do This?

**Yes.** Your setup is already strong — you have 135+ skills, agents, hooks, RTK, and a full memory system. But the `claude-howto` repo covers **March 2026 new features** you likely haven't wired up yet, and it provides a structured mental model that closes gaps even experienced users have.

### What You Already Have ✓
- Skills system (135+ skills, `using-superpowers` auto-invocation)
- Custom agents (planner, architect, tdd-guide, code-reviewer, etc.)
- Memory system (auto-memory in `~/.claude/projects/`)
- Hooks (RTK prefix system)
- CLAUDE.md project instructions
- MCP server (Microsoft Learn)

### What You're Missing or Could Deepen ✗
- **Checkpoints** — session snapshot/rewind (not currently used)
- **Auto Mode** — fully autonomous Research Preview mode
- **Git Worktrees** — isolated parallel agent workspaces
- **Scheduled Tasks** — `/loop` + cron-based remote triggers
- **Channels** — background task monitoring
- **MCP OAuth + WebSocket MCP** — advanced MCP patterns
- **Plugins** — bundled skill+command+hook collections
- **Agent Teams** — coordinated multi-agent configurations
- **Chrome Integration** — browser-aware context
- **Voice Dictation** — hands-free prompting
- **Task List** — structured in-session task tracking UI
- **Keyboard Customization** — chord shortcuts

---

## The Learning Plan

### Level 1 — Foundations (Already Mostly Done, ~30 min to verify)
*Do this to confirm you're not missing anything basic.*

- [ ] **Slash Commands** — Run `/help` and scan the 55+ built-ins. Note any you've never used.
  - Key ones to explore: `/checkpoint`, `/rewind`, `/cost`, `/context`, `/export`, `/doctor`, `/btw`, `/vim`
  - Install path: `cp .claude/commands/*.md .claude/commands/`

- [ ] **Memory audit** — Check your 7 memory types are all wired:
  - Project: `CLAUDE.md` ✓
  - Auto-memory: `~/.claude/projects/*/memory/` ✓
  - User rules: `~/.claude/rules/` ✓
  - Confirm: managed policy, local project rules

- [ ] **CLI basics** — Headless mode, permission modes, `--dangerously-skip-permissions` awareness
  - Permission modes to know: `default`, `acceptEdits`, `plan`, `auto`, `bypassPermissions`

---

### Level 2 — High-Value Gaps (Priority — do these first, ~3-4 hours)

#### 2A. Checkpoints (45 min) — HIGHEST VALUE
Checkpoints let you snapshot a session state and rewind if an agent breaks things.
This is critical for bookphysio where agents touch production schema.

```
/checkpoint save "before-migration"   # save state
/rewind "before-migration"            # restore if things go wrong
```

- [ ] Read: `08-checkpoints/README.md` in the repo
- [ ] Practice: Start a session, make changes, checkpoint, make bad changes, rewind
- [ ] **Apply to bookphysio**: Add checkpoint habit before any `bp-backend` schema migration work

#### 2B. Git Worktrees (1 hour) — HIGH VALUE for parallel agents
Your `using-git-worktrees` skill exists but you may not be using it with agents.
Worktrees let two agents work on different branches simultaneously without conflicts.

```bash
rtk git worktree add ../bookphysio-feature-auth -b feat/auth
# Agent 1 works in /bookphysio, Agent 2 works in /bookphysio-feature-auth
```

- [ ] Read: `~/.claude/skills/using-git-worktrees/` (you already have this skill)
- [ ] Read the howto repo's advanced section on worktree + subagent combos
- [ ] **Apply to bookphysio**: Use worktrees when `bp-ui-public` and `bp-backend` need to work in parallel

#### 2C. Scheduled Tasks / Loop (30 min)
You have the `schedule` and `loop` skills but may not have used them.

```
/loop 30m "check docs/planning/ACTIVE.md and summarize new items"
/schedule daily 09:00 "run bp-guardian QA check"
```

- [ ] Run `/loop` once to understand how it works
- [ ] **Apply to bookphysio**: Schedule a daily ACTIVE.md triage agent

#### 2D. Plugins (1 hour)
Plugins bundle slash commands + skills + hooks into one installable unit.
You could bundle the entire bookphysio agent system as a plugin.

Structure:
```
.claude/plugins/bookphysio/
  plugin.md          # plugin manifest
  commands/          # slash commands
  skills/            # skills
  hooks/             # hooks
```

- [ ] Read: `07-plugins/README.md` in the howto repo
- [ ] **Apply to bookphysio**: Create a `bookphysio` plugin that bundles your workflow

---

### Level 3 — Advanced (Nice to Have, ~3-5 hours total)

#### 3A. Auto Mode (Research Preview)
Fully autonomous mode — Claude executes plans without confirmation prompts.
Use only for well-defined, low-risk tasks.

```bash
claude --permission-mode auto "audit all TODO comments in src/"
```

- [ ] Understand the risk model before enabling
- [ ] **Apply to bookphysio**: Safe use case — auto-generate CODEMAPS on file changes

#### 3B. Agent Teams
Coordinate multiple named agents with defined handoff protocols.
Your `bp-orchestrator` / `bp-guardian` system is already an agent team — this formalizes it.

- [ ] Read: Advanced section on agent team configuration in howto repo
- [ ] Compare your `.claude/agents/` setup to the formal pattern
- [ ] Consider formalizing `bp-orchestrator` as a team coordinator

#### 3C. MCP: OAuth + WebSocket
Your current MCP (Microsoft Learn) uses HTTP. New patterns:
- **MCP OAuth** — authenticated MCPs (GitHub, Google Docs, Slack with real auth)
- **WebSocket MCP** — long-running persistent connections

- [ ] Add GitHub MCP (most useful for bookphysio CI/CD monitoring)
- [ ] Add Context7 MCP (library docs — already referenced in your workflow rules)

#### 3D. Channels
Background task monitoring — get notified when a long agent run completes.

```
/channel create migration-watch
# Agent posts to channel when done
```

- [ ] Read the channels section in CATALOG.md
- [ ] **Apply to bookphysio**: Use for long `bp-backend` migration runs

---

## Immediate Action: Top 3 Things to Do Today

1. **Install Context7 MCP** — Your `development-workflow.md` says to use it but you haven't wired it up. It gives agents live library docs (Next.js 15, Supabase, Razorpay, etc.)
   ```bash
   # Add to .mcp.json:
   # "context7": { "command": "npx", "args": ["-y", "@context7/mcp"] }
   ```

2. **Adopt checkpoints before any schema migration** — Before any `bp-backend` runs a Supabase migration, save a checkpoint. Zero cost, huge safety net.

3. **Skim CATALOG.md for new March 2026 features** — Fetch it and spend 15 min scanning what's new. Several features likely change how you'd prompt agents.

---

## How to Use This Plan

This file is your **self-directed curriculum**. Work through it in order:
- Level 2A → 2B → 2C → 2D (priority order)
- Level 3 when you have time

For each item, use the howto repo directly:
```bash
# Clone locally for offline reference
git clone https://github.com/luongnv89/claude-howto ~/claude-howto
```

Then reference modules as needed:
```
~/claude-howto/08-checkpoints/README.md
~/claude-howto/09-advanced/README.md
~/claude-howto/CATALOG.md
```

---

## Verdict on the Repo

**Worth it.** Not because your setup is weak — it's actually very strong. But:
- The March 2026 new features section alone is worth 30 min
- Checkpoints + worktrees are genuinely missing from your workflow
- The CATALOG.md is the best single-page Claude Code reference that exists
- Plugins could let you ship your bookphysio agent system to collaborators cleanly

Estimated time to close your real gaps: **3-4 hours** (Level 2 only).
Full mastery of everything new: **6-8 hours** total.
