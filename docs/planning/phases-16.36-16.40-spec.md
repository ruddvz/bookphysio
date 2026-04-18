# Phases 16.36–16.40 — Execution Spec

> Simplified for agent hand-off. Follow phases in the order listed at the bottom.
> After each phase: `npm run build` must be zero errors before committing.

---

## 16.36 — Static pages v2 chrome

**Files:** `src/app/about/page.tsx`, `src/app/faq/page.tsx`, `src/app/privacy/page.tsx`, `src/app/terms/page.tsx`

**What to build:**
- Wrap content in a v2 two-column layout: narrow prose column (max ~720px) + sticky TOC sidebar (~220px) on `lg:` screens.
- TOC sidebar applies only to long-form pages (`/faq`, `/privacy`, `/terms`). `/about` has **no TOC**.
- TOC: anchor links to each `<h2>` section heading. Active heading highlighted in `#00766C`.
- Add a "Last updated: [date]" `Badge` in the page header, below the title. Use `src/components/dashboard/primitives/Badge.tsx`.
- Gate all v2 additions with `useUiV2()` — v1 layout must be unchanged when the flag is off.
- **No content changes** — chrome/layout only.

**Tests:** `.test.tsx` per page — TOC renders on long-form pages, Badge renders with a date string, v1 layout untouched when `useUiV2()` returns false.

---

## 16.37 — Hindi mirrors v2

**Files:** `src/app/hi/about/page.tsx`, `src/app/hi/faq/page.tsx`, `src/app/hi/privacy/page.tsx`, `src/app/hi/terms/page.tsx`; also check `src/app/hi/how-it-works/` and `src/app/hi/search/`.

**What to build:**
- Port the v2 chrome from 16.36 to all four Hindi static pages. Same TOC sidebar + last-updated Badge + `useUiV2()` gate.
- Pass `locale="hi"` to `Navbar` and `Footer` (already the pattern in existing `/hi/*` pages).
- **No new Hindi translations needed** — English content as placeholder is fine. Goal is structural parity.
- For `how-it-works` and `search`: look at the English v2 counterpart and apply the same v2 overlay pattern (`useUiV2()` gate + import existing `*V2` component if one exists).

**Tests:** Smoke test per page — renders without crash, `locale="hi"` passed to Navbar.

---

## 16.38 — Recharts integration

**Files:** `src/app/admin/analytics/page.tsx`, `src/app/provider/earnings/ProviderEarningsV2Chrome.tsx`, `src/app/patient/records/PatientRecordsSummaryV2.tsx`. Do **NOT** touch `src/components/dashboard/primitives/Sparkline.tsx`.

**What to build:**
1. `npm install recharts` (and `npm install --save-dev @types/recharts` if needed — check if types are bundled).
2. **Admin analytics** (`page.tsx`): replace the hand-rolled `buildChartPath` SVG + raw `<svg>` with:
   - `<AreaChart>` (inside `<ResponsiveContainer>`) for monthly revenue.
   - `<BarChart>` for monthly appointments.
   - Delete `buildChartPath` function and `GEO_GRID_CELL_OPACITIES` mock geo grid entirely.
3. **Provider earnings**: replace any hand-drawn SVG chart with a Recharts `<LineChart>` for earnings trend.
4. **Patient records**: replace any hand-drawn SVG chart with a Recharts `<LineChart>` for session trends.
5. Only replace **full dashboard charts** (large canvas). Leave all `<Sparkline>` component calls untouched.

**Colour tokens:** stroke `#00766C`, fill `#E6F4F3`, bar fill `#00766C` at 80% opacity (`rgba(0,118,108,0.8)`).

**Tests:** Update `analytics-v2.test.tsx` — mock `recharts` module and assert `AreaChart`/`BarChart` render.

---

## 16.39 — Command palette (full modal)

**New file:** `src/components/nav/CommandPalette.tsx`
**Update:** `src/components/Navbar.tsx` — swap `CommandPaletteHint` for `CommandPalette`.

**What to build:**
- Full-screen modal overlay (backdrop `bg-black/40`) with a centred card (`max-w-xl`, `rounded-2xl`, `shadow-2xl`).
- Search input at top with `Search` icon. Filters results as user types.
- Three sections in results list (skip empty sections):
  1. **Jump to page** — role-aware routes:
     - Unauthenticated/public: Home `/`, Search `/search`, How it works `/how-it-works`, About `/about`
     - Patient: Dashboard `/patient/dashboard`, Appointments `/patient/appointments`, Records `/patient/records`, Messages `/patient/messages`
     - Provider: Dashboard `/provider/dashboard`, Calendar `/provider/calendar`, Patients `/provider/patients`, Earnings `/provider/earnings`
     - Admin: Dashboard `/admin`, Listings `/admin/listings`, Users `/admin/users`, Analytics `/admin/analytics`
  2. **Quick actions** — role-aware:
     - Patient: "Book a session" → `/search`
     - Provider: "New invoice" → `/provider/bills/new`, "Set availability" → `/provider/availability`
     - Admin: "Review listings" → `/admin/listings`
  3. **Recent items** — last 5 `router.push()` destinations stored in `localStorage` key `bp_cmd_recent`. Display with `Clock` icon.
- Keyboard: `⌘K`/`Ctrl+K` opens, `Escape` closes, `↑`/`↓` navigates, `Enter` selects.
- Role: read from the existing Supabase auth hook already in the codebase (check how other components get user role — look for `useSession`, `useUser`, or `useSupabaseClient`).
- The ⌘K shortcut handler that was in `CommandPaletteHint` moves into this component. Remove it from the hint.
- Export: named export `export function CommandPalette()`.

**Tests:** `CommandPalette.test.tsx` — closed by default, opens on ⌘K keydown, closes on Escape, input filters results, role-appropriate links shown.

---

## 16.40 — Notification drawer (slide-over)

**New file:** `src/components/nav/NotificationDrawer.tsx`
**Update:** `src/components/Navbar.tsx` — add Bell icon + drawer trigger.

**What to build:**
- Slide-over panel: `fixed inset-y-0 right-0 w-full sm:max-w-sm`, slides in from right (`translate-x-0` / `translate-x-full` CSS transition). Backdrop `bg-black/30` closes on click outside.
- Bell icon in Navbar (next to the CommandPalette trigger) with an unread count `Badge` (red, hidden when count is 0). Use `Badge` from `src/components/dashboard/primitives/Badge.tsx`.
- Drawer fetches from `GET /api/notifications` — same endpoint as `PatientNotificationsV2`. Use `useQuery({ queryKey: ['notifications', 'drawer'] })`.
- Display: grouped by day using `groupNotificationsByDay` from `src/app/patient/notifications/notifications-v2-utils.ts` (already exists — import it).
- Each row: icon + title + relative time + unread dot. Clicking a row fires `PATCH /api/notifications/:id/read`.
- "Mark all read" button in the drawer header — fires `PATCH /api/notifications`.
- "View all" link at the bottom → `/patient/notifications` or `/provider/notifications` based on role. Admin gets no drawer.
- Render only for authenticated users. No drawer shown when logged out.

**Tests:** `NotificationDrawer.test.tsx` — closed by default, opens on Bell click, unread Badge count matches mock data, "Mark all read" fires mutation.

---

## Execution order

| Step | Phase | Why this order |
|------|-------|----------------|
| 1 | **16.38** | `npm install recharts` must land first |
| 2 | **16.36** | Self-contained; 16.37 ports what this builds |
| 3 | **16.39** | Self-contained |
| 4 | **16.40** | Self-contained |
| 5 | **16.37** | Ports 16.36 chrome to Hindi routes |

Each phase = one commit. Commit message format: `feat: 16.XX — <short description>`.
After each commit, tick `[x]` for that phase in `docs/planning/EXECUTION-PLAN.md`.
