# GitHub Pages Static Export — Legacy Changes Log

This file tracks the legacy changes that were made to support `output: 'export'` for GitHub Pages.
The production hosting target is now Vercel. Keep this file only as migration history while any GitHub Pages cleanup remains outstanding.

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

**Changed to:** Thin server wrapper using `next/dynamic` (required because Next.js forbids
`generateStaticParams` in `'use client'` files):
```ts
import dynamic from 'next/dynamic'
const BookingPageClient = dynamic(() => import('./BookingPageClient'), { ssr: false })
export async function generateStaticParams() { return [] as never[] }
export default function BookPage() { return <BookingPageClient /> }
```

**Also created:** `src/app/book/[id]/BookingPageClient.tsx` — original `page.tsx` content
(component renamed from `BookPage` to `BookingPageClient`).

**To revert:**
1. Copy `BookingPageClient.tsx` content back into `page.tsx`, rename component back to `BookPage`
2. Delete `BookingPageClient.tsx`

---

## REVERT — layout.tsx files (new files in each dynamic segment)

Created in every dynamic segment to ensure Next.js/Turbopack detects `generateStaticParams`.
Files created:
- `src/app/book/[id]/layout.tsx`
- `src/app/city/[slug]/layout.tsx`
- `src/app/doctor/[id]/layout.tsx`
- `src/app/patient/appointments/[id]/layout.tsx`
- `src/app/provider/appointments/[id]/layout.tsx`
- `src/app/provider/patients/[id]/layout.tsx`
- `src/app/specialty/[slug]/layout.tsx`

Each contains:
```ts
export async function generateStaticParams() { return [] as never[] }
export default function Layout({ children }) { return <>{children}</> }
```
**To revert:** Delete all of the above layout.tsx files.

---

## REVERT — src/app/city/[slug]/page.tsx

Added after imports (line 7):
```ts
export function generateStaticParams() { return [] }
```

---

## REVERT — src/app/doctor/[id]/page.tsx

Added after imports (line 9):
```ts
export function generateStaticParams() { return [] }
```

---

## REVERT — src/app/patient/appointments/[id]/page.tsx

Added after imports (line 4):
```ts
export function generateStaticParams() { return [] }
```

---

## REVERT — src/app/provider/appointments/[id]/page.tsx

Added after imports (line 3):
```ts
export function generateStaticParams() { return [] }
```

---

## REVERT — src/app/provider/patients/[id]/page.tsx

Added after imports (line 4):
```ts
export function generateStaticParams() { return [] }
```

---

## REVERT — src/app/specialty/[slug]/page.tsx

Added after imports (line 7):
```ts
export function generateStaticParams() { return [] }
```

---

## Status

- [ ] Build passing
- [ ] Deployed to https://ruddvz.github.io/bookphysio/
- [ ] Source files reverted (REVERT items above undone)
