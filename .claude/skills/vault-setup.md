---
name: vault-setup
description: Interactive Obsidian vault configurator. Interviews the user about their role, priorities, and scope, then builds a personalized vault structure with a custom CLAUDE.md, memory.md, and optional slash commands. Use when the user runs /vault-setup or wants to set up or reconfigure their second brain.
---

# Vault Setup — Obsidian Second Brain Configurator

## Trigger
Run when user says `/vault-setup`, "set up my vault", "configure my second brain", or "personalize my Obsidian".

## Vault Location
The user's Obsidian vault is at:
```
C:\Users\pvr66\OneDrive\Documents\Obsidian Vault\
```

## Five-Step Process

### Step 1 — Interview the User

Ask the following four questions. You can present them as plain questions or as multiple-choice using the ask_user_input tool if the user requests it:

1. **What do you do for work?** (role, industry, type of work)
2. **What falls through the cracks the most?** What do you wish you tracked better?
3. **Scope**: Work-only, personal life only, or both (full Life OS)?
4. **Existing files**: Do you have PDFs, docs, slides, or other files you want to import and synthesize?

### Step 2 — Infer and Preview

Without further questions, infer the user's needs and present a customized vault structure preview. Examples:

**Business owner** → `people/ operations/ decisions/ clients/ projects/`
**Developer** → `research/ clients/ code-notes/ decisions/ projects/`
**Creator/Writer** → `ideas/ drafts/ published/ research/ projects/`
**Student** → `courses/ notes/ research/ projects/ resources/`

Always include:
- `inbox/` — uncategorized fast capture
- `daily/` — daily notes (YYYY-MM-DD.md)
- `archive/` — completed work (never delete, always archive)

### Step 3 — Build the Vault

After user confirms (or adjusts) the structure:

1. Create all confirmed folders inside the vault root
2. Generate a personalized `CLAUDE.md` at vault root that includes:
   - Who the user is (role, goals, working style)
   - The vault structure and each folder's purpose
   - Context loading rules (what to read when starting a session)
   - Available slash commands
3. Create or update `memory.md` at vault root
4. Create a starter `inbox/README.md` explaining the inbox

### Step 4 — Context Injection Options

Offer three options:

**A. Global (automatic)** — Add vault path to `~/.claude/settings.json` additionalDirectories so CLAUDE.md is always loaded
**B. Manual (per-project)** — User opens Claude Code inside the vault folder when they want full context
**C. Vault-only** — Claude Code is only used inside the vault folder

Recommended: **Option A** for always-available context.

### Step 5 — Final Instructions + Optional Commands

Tell the user:
- How to enable Obsidian CLI: Settings → General → Command line interface accessibility → ON
- How to use `/daily` to start each day
- How to use `/tldr` to save session summaries
- How to use `/file-intel` to process documents

Ask if they want to install the `/daily`, `/tldr`, and `/file-intel` commands (they're already installed if this skill is running).

## Key Principles
- **Infer over interrogate** — Don't ask more than 4 questions. Build from what you know.
- **Fast** — The whole setup should feel instant (< 30 seconds of back and forth)
- **Personal** — The CLAUDE.md should feel like it was written by the user, not a template
