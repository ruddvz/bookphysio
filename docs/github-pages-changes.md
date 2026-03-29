# GitHub Pages Static Export — Changes Log

This file tracks every change made to support `output: 'export'` for GitHub Pages.
Once the deployment is live and stable, revert these changes (marked REVERT) from
source files and keep only the workflow + config changes (marked KEEP).

---

## KEEP — next.config.ts

Added static export config:

```ts
output: "export",
basePath: "/bookphysio",
images: { unoptimized: true },
```

**Why:** Required for `next build` to produce a static `out/` folder for GitHub Pages.

---

## KEEP — .gitignore

Added:
```
out/
playwright-report/
test-results/
supabase/.temp/
```

---

## KEEP — .github/workflows/deploy.yml (new file)

Full GitHub Actions workflow: builds static export, uploads artifact, deploys to gh-pages.
Also stashes `route.ts` API handlers to `/tmp` before build (restores after) and injects
placeholder env vars so Supabase SDK doesn't throw during build.

---

## REVERT — src/app/book/[id]/page.tsx

**Original:** Was the full `'use client'` booking page component.

**Changed to:** Thin server wrapper:
```ts
export function generateStaticParams() { return [] }
export { default } from './BookingPageClient'
```

**Also created:** `src/app/book/[id]/BookingPageClient.tsx` — the original `page.tsx` content
moved here (minus the `generateStaticParams` export).

**To revert:**
1. Copy `BookingPageClient.tsx` content back into `page.tsx`
2. Remove the `generateStaticParams` line from `page.tsx`
3. Delete `BookingPageClient.tsx`

---

## REVERT — src/app/city/[slug]/page.tsx

Added at top of file:
```ts
export function generateStaticParams() { return [] }
```

---

## REVERT — src/app/doctor/[id]/page.tsx

Added at top of file:
```ts
export function generateStaticParams() { return [] }
```

---

## REVERT — src/app/patient/appointments/[id]/page.tsx

Added at top of file:
```ts
export function generateStaticParams() { return [] }
```

---

## REVERT — src/app/provider/appointments/[id]/page.tsx

Added at top of file:
```ts
export function generateStaticParams() { return [] }
```

---

## REVERT — src/app/provider/patients/[id]/page.tsx

Added at top of file:
```ts
export function generateStaticParams() { return [] }
```

---

## REVERT — src/app/specialty/[slug]/page.tsx

Added at top of file:
```ts
export function generateStaticParams() { return [] }
```

---

## Status

- [ ] Build passing
- [ ] Deployed to https://ruddvz.github.io/bookphysio/
- [ ] Source files reverted (REVERT items above undone)
