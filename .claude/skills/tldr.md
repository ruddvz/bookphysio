---
name: tldr
description: Save a summary of this conversation to the Obsidian vault. Captures key decisions, things to remember, and next actions. Auto-categorizes into the right vault folder. Use at the end of any Claude Code session or when the user runs /tldr.
---

# TLDR — Session Summary to Vault

## Vault Location
```
C:\Users\pvr66\OneDrive\Documents\Obsidian Vault\
```

## What to Capture

Summarize the conversation into three sections:
1. **Decisions / Findings** — What was decided or discovered
2. **Things to Remember** — Context, constraints, preferences worth keeping
3. **Next Actions** — Concrete next steps

## Where to Save

Choose the folder based on what the conversation was about:

| Topic | Save to |
|-------|---------|
| Client or project work | `projects/[project-name]/` |
| Research, learning, ideas | `research/` |
| Caught in 4K (C4K) work | `C4K-Brain/` |
| Everything else | `daily/YYYY-MM-DD.md` (append) |

## File Format

```markdown
# [Topic] — [YYYY-MM-DD]

## Decisions
- ...

## Remember
- ...

## Next Actions
- [ ] ...
```

## Memory Update

After saving the note, append a one-line entry to `memory.md` at vault root:

```
[YYYY-MM-DD] [Topic]: [one-sentence summary of what was decided or learned]
```

## Notes
- Keep it short — the goal is a 30-second scannable cheat sheet, not a transcript
- If unsure which folder, default to `daily/`
- Always use today's actual date
