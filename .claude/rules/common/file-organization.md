# File Organization Rules

> Every new file must land in the right place. The root is not a dumping ground.

## Canonical Directory Map

| File type | Correct location |
|-----------|-----------------|
| Planning docs, backlogs, roadmaps | `docs/planning/` |
| Research PDFs, competitor notes, market data | `docs/research/` |
| Architecture decisions, audit reports | `docs/` |
| Pre-deploy / ops checklists | `docs/operations/` |
| Screenshots, design assets, images (non-public) | `docs/assets/screenshots/` |
| Public-facing images & icons | `public/images/` or `public/` |
| One-off utility / migration scripts | `scripts/` |
| End-to-end tests | `e2e/` |
| Unit / integration tests | co-located with source (`*.test.ts`) |
| Database migrations | `supabase/migrations/` |
| Environment docs | `.env.example` (never `.env`) |

## Root-level allowed files (keep it short)

Only these belong at the project root:
```
CLAUDE.md           CHANGELOG.md        AGENTS.md
package.json        package-lock.json   tsconfig.json
next.config.ts      tailwind.config.ts  postcss.config.mjs
eslint.config.mjs   playwright.config.ts vitest.config.ts
components.json     vercel.json         next-env.d.ts
.env.example        .gitignore          .mcp.json
```

## Rules (enforced by PreToolUse hook)

1. **Never create `.md` docs at root** unless they are in the allowed list above.
2. **Never drop images or PDFs at root** — they go in `docs/assets/` or `public/`.
3. **Never create `*.txt` temp files at root** — delete them or put them in `/tmp`.
4. **Planning / spec docs → `docs/planning/`** every time, no exceptions.
5. **New scripts → `scripts/`** with a descriptive name, never at root.
6. **Research materials → `docs/research/`**.

## Enforcement

A `PreToolUse` hook (`scripts/check-file-placement.mjs`) warns Claude before writing
a file to a disallowed location. The hook prints a warning but does NOT block
(exit 0) so the agent can self-correct before the Write executes.
