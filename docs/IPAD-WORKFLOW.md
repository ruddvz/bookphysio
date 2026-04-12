# iPad Development & Deployment Workflow

No laptop? No problem. Everything below works from Safari on an iPad.

---

## Quick Start: Deploy Right Now

1. Open **Claude Code** at [claude.ai/code](https://claude.ai/code) — make changes, commit, push
2. Or open the repo on GitHub and press `.` to launch the **GitHub.dev** web editor
3. Commit to `main` → deploy triggers automatically
4. Or go to **Actions** tab → "Deploy to Vercel" → "Run workflow" for manual deploy

---

## Setup: GitHub Secrets (One-Time)

The deploy workflow needs 3 secrets. Set them in your repo:
**GitHub → Settings → Secrets and variables → Actions → New repository secret**

| Secret | Where to find it |
|--------|-----------------|
| `VERCEL_TOKEN` | [vercel.com/account/tokens](https://vercel.com/account/tokens) → Create token |
| `VERCEL_ORG_ID` | Vercel dashboard → Settings → General → "Vercel ID" |
| `VERCEL_PROJECT_ID` | Vercel dashboard → Your project → Settings → General → "Project ID" |

**How to check if they're already set:**
Go to your repo → Settings → Secrets and variables → Actions. If you see all 3 listed, you're good.

---

## Development Tools (All Browser-Based)

### Claude Code Web (Recommended)
- **URL:** [claude.ai/code](https://claude.ai/code)
- Full AI-assisted development — edit files, run commands, commit, push
- Best for: feature work, bug fixes, refactoring

### GitHub.dev Editor
- **How:** Open any repo page on GitHub, press `.` (period key)
- Lightweight VS Code in the browser
- Best for: quick edits, config changes, content updates

### GitHub Codespaces
- **How:** Repo page → Code button → Codespaces → Create
- Full Linux dev environment with terminal, Node.js, npm
- Can run `npm run dev` and preview the site
- Best for: when you need to run tests or the dev server
- Note: free tier = 60 hours/month

### Vercel Dashboard
- **URL:** [vercel.com/dashboard](https://vercel.com/dashboard)
- Monitor deployments, view build logs, change environment variables
- Trigger redeploys of existing commits

---

## Workflow: Making Changes

### Small Changes (config, content, quick fixes)
1. Open GitHub.dev (press `.` on repo page)
2. Edit files
3. Commit to `main` from the Source Control panel
4. Deploy triggers automatically

### Feature Work
1. Open **Claude Code** at claude.ai/code
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make changes, test with `npm run build`
4. Push the branch
5. Open a PR on GitHub
6. **Preview deployment** will auto-deploy and post a URL on the PR
7. Review the preview → merge to `main` → production deploy

### Emergency Fix
1. Go to **Actions** tab on GitHub
2. Click "Deploy to Vercel"
3. Click "Run workflow" → select `main` branch → run
4. Or: edit directly on GitHub, commit to `main`, auto-deploys

---

## CI/CD Pipeline

| Trigger | What runs | Result |
|---------|-----------|--------|
| Push to `main` | `ci.yml` (lint, type-check, build) and `deploy.yml` (production deploy) | Production at bookphysio.in |
| PR to `main` | `ci.yml` (lint, type-check, build) and `preview.yml` (preview deploy) | Preview URL posted on PR |
| Manual dispatch | `deploy.yml` only | Production deploy |

---

## Monitoring

- **Build logs:** GitHub Actions tab → click the workflow run
- **Deploy status:** Vercel dashboard → Deployments
- **Site health:** Visit [bookphysio.in](https://bookphysio.in) directly
- **Errors:** Vercel dashboard → Logs (runtime logs)

---

## Tips for iPad

- Use **Split View** — Safari + Notes for tracking tasks
- **Keyboard shortcuts** work in GitHub.dev if you have a keyboard attached
- **GitHub Mobile app** is great for reviewing PRs and checking CI status
- Bookmark the Actions page for quick manual deploys
