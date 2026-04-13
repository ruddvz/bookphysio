# PR Fix Command

Fetch review comments from GitHub PRs (Copilot, CodeRabbit, human reviewers) and apply the fixes directly to the same PR branch.

## Usage

```
/pr-fix <PR numbers>
```

**Examples:**
- `/pr-fix 50` — Fix all review comments on PR #50
- `/pr-fix 50 52` — Fix review comments on PR #50 and #52
- `/pr-fix 50 --dry-run` — Show what would be fixed without making changes

## Arguments

$ARGUMENTS — One or more PR numbers (space-separated). Optional flags:
- `--dry-run` — List actionable comments without applying fixes
- `--skip-resolved` — Skip already-resolved review threads (default: included)
- `--author <name>` — Only fix comments from a specific reviewer (e.g., `--author coderabbitai`)

## Instructions

For each PR number provided in `$ARGUMENTS`, execute the following pipeline:

### Phase 1: Fetch PR Context

1. **Get PR details** — Use GitHub MCP `pull_request_read` with method `get` to fetch the PR metadata (title, branch, base branch, author).
2. **Get review comments** — Use GitHub MCP `pull_request_read` with method `get_review_comments` to fetch all review threads. Paginate if needed (perPage: 100).
3. **Get PR reviews** — Use GitHub MCP `pull_request_read` with method `get_reviews` to understand review status.
4. **Get changed files** — Use GitHub MCP `pull_request_read` with method `get_files` to know which files are in scope.

### Phase 2: Classify Comments

Parse all review comments and classify each into:

| Category | Action | Examples |
|----------|--------|---------|
| **Actionable Code Fix** | Apply fix | "Add null check here", "Use optional chaining", "Missing error handling" |
| **Suggestion with Diff** | Apply suggested change | GitHub suggestion blocks (```suggestion ... ```) |
| **Style/Formatting** | Apply fix | "Use const instead of let", "Remove unused import" |
| **Architecture/Design** | Flag for user | "Consider refactoring this into a separate service" |
| **Question/Clarification** | Skip | "Why was this approach chosen?" |
| **Resolved** | Skip (unless --skip-resolved not set) | Already resolved threads |
| **Nitpick** | Apply fix | "Typo in variable name", "Missing semicolon" |

**Priority order:** Actionable Code Fix > Suggestion with Diff > Style/Formatting > Nitpick > Architecture (flag only)

### Phase 3: Checkout PR Branch

1. Fetch the PR branch: `git fetch origin pull/<PR_NUMBER>/head:<branch_name>` or `git fetch origin <branch_name>`
2. Checkout the branch: `git checkout <branch_name>`
3. Verify clean working tree

### Phase 4: Apply Fixes

For each actionable comment (in file order, top to bottom):

1. **Read the file** at the referenced line(s)
2. **Understand the context** — read surrounding code to avoid breaking changes
3. **Apply the fix** using the Edit tool — minimal, surgical changes only
4. **Track what was fixed** — maintain a list of applied fixes with comment ID and description

**Rules:**
- Apply GitHub suggestion blocks exactly as provided (they are pre-approved diffs)
- For code fix suggestions, implement the minimum change that addresses the comment
- Never refactor beyond what the comment asks for
- If a fix could break other code, read the dependent files first
- If unsure about a fix, add it to the "Needs Review" list instead of applying it
- Group fixes by file to minimize file operations

### Phase 5: Verify

1. **Build check** — Run `npm run build` (or project build command)
2. **Type check** — Run `npm run type-check`
3. **Lint check** — Run `npm run lint`
4. If any check fails:
   - Diagnose and fix the build error if it's caused by the applied changes
   - If the error is pre-existing (not caused by fixes), note it and continue
   - If a fix cannot be resolved, revert that specific fix and note it

### Phase 6: Commit & Push

1. Stage all changes: `git add .`
2. Commit with descriptive message:
   ```
   fix: address PR review comments

   Applied fixes from review comments:
   - [list of fixes applied]

   Reviewers: [CodeRabbit, Copilot, human reviewers]
   ```
3. Push to the PR branch (use report_progress tool to push)

### Phase 7: Report

Generate a summary report:

```
╔══════════════════════════════════════════════════════════════╗
║                    PR FIX REPORT — PR #XX                    ║
╠══════════════════════════════════════════════════════════════╣
║ Branch:     feature/xyz                                      ║
║ Reviewers:  CodeRabbit, Copilot                              ║
╚══════════════════════════════════════════════════════════════╝

✅ APPLIED (X fixes):
  1. [file:line] — Description of fix (reviewer: CodeRabbit)
  2. [file:line] — Description of fix (reviewer: Copilot)
  ...

⚠️  NEEDS REVIEW (X items):
  1. [file:line] — "Architecture suggestion..." (reviewer: human)
  2. [file:line] — "Consider refactoring..." (reviewer: CodeRabbit)

⏭️  SKIPPED (X items):
  1. [file:line] — Already resolved
  2. [file:line] — Question, not actionable

BUILD STATUS: ✅ PASS / ❌ FAIL (details)
TYPE CHECK:   ✅ PASS / ❌ FAIL (details)
LINT:         ✅ PASS / ❌ FAIL (details)

Commit: abc1234 — "fix: address PR review comments"
Pushed to: origin/feature/xyz
```

## Handling Multiple PRs

When multiple PR numbers are provided:
1. Process each PR sequentially
2. After completing one PR, stash/commit changes and switch to the next PR branch
3. Generate a combined report at the end

## Edge Cases

- **PR branch doesn't exist locally** — Fetch it from origin
- **Merge conflicts** — Report the conflict, skip that file's fixes, continue with others
- **Comment on deleted code** — Skip, note in report
- **Outdated comments** — Still attempt to apply if the code context matches; skip if code has changed significantly
- **No actionable comments** — Report "No actionable review comments found" and exit cleanly
- **Rate limiting** — Respect GitHub API rate limits, wait if needed

## Dry Run Mode

When `--dry-run` is passed:
- Execute Phases 1-2 only
- Show the classified comment list
- Show what fixes WOULD be applied
- Don't checkout, edit, or commit anything

## Notes

- This command pushes to the SAME PR branch — no new PRs are created
- Always verify builds pass before pushing
- Architecture/design comments are flagged but never auto-applied
- The command works with any reviewer (CodeRabbit, Copilot, human reviewers)
- Use `--author coderabbitai` to only fix CodeRabbit comments, `--author copilot` for Copilot only
