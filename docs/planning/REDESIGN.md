# bookphysio.in — Dashboard Redesign Spec

> Full redesign of **patient, provider, and admin** dashboard sections. Inspired by Apointa-style layouts: top pill nav, soft white cards, colored circular stat-tile badges, schedule timelines, side rails. Adapted for physiotherapy context.
>
> This doc is the single source of truth for resuming the redesign. Any AI or human picking this up should read it first, then `docs/CODEMAPS/OVERVIEW.md` and `docs/planning/ACTIVE.md`.

---

## 📊 Live Status (updated automatically every change)

**Last updated:** 2026-04-07 — ✅ Phase A · ✅ Phase B · ✅ Phase C · ✅ Phase D · ✅ Phase E committed (build green)
**Current task:** Post-Phase-E hardening complete in repo — apply migration `032_patient_records_privacy_boundary.sql` before release

### Phase A — Foundation ✅
- [x] Role palette tokens in `globals.css`
- [x] `src/components/dashboard/TopPillNav.tsx`
- [x] `src/components/dashboard/primitives.tsx` (StatTile, DashCard, PageHeader, SectionCard, ListRow, EmptyState)
- [x] Refactor `src/app/patient/layout.tsx` → Mint Breeze + TopPillNav
- [x] Refactor `src/app/provider/layout.tsx` → Periwinkle Bloom + TopPillNav
- [x] Refactor `src/app/admin/layout.tsx` → Monochrome Noir + TopPillNav
- [x] Rewrite `src/app/patient/dashboard/page.tsx`
- [x] Rewrite `src/app/provider/dashboard/page.tsx` (clean rewrite — deleted old "Operations Intelligence")
- [x] Rewrite `src/app/admin/page.tsx`
- [x] Verify auth login chrome (`src/app/(auth)/login/page.tsx` uses `BpLogo size="auth"`)
- [x] `rtk npm run build` passes — ✓ Compiled successfully (117 pages)
- [ ] ⬜ Commit: `feat: dashboard redesign phase A — shared chrome + palettes + home pages`

### Phase B — Patient secondary (6 pages) ✅
- [x] `appointments` — Mint Breeze swap
- [x] `records` — Mint Breeze swap
- [x] `messages` — Mint Breeze swap
- [x] `payments` — Mint Breeze swap
- [x] `profile` — Mint Breeze swap
- [x] `notifications` — Mint Breeze swap
- [x] `rtk npm run build` passes
- [ ] ⬜ Commit: `feat: dashboard redesign phase B — patient pages mint breeze`
### Phase C — Provider secondary (10 pages) ✅
- [x] calendar, appointments, patients, patients/[id], earnings, availability, messages, profile, notifications, bills/new — Periwinkle Bloom hex→CSS var sweep
- [x] `rtk npm run build` passes
- [ ] ⬜ Commit: `feat: dashboard redesign phase C — provider pages periwinkle bloom`
### Phase D — Admin secondary (3 pages) ✅
- [x] listings, users, analytics — Monochrome Noir hex→CSS var sweep
- [x] `rtk npm run build` passes
- [ ] ⬜ Commit: `feat: dashboard redesign phase D — admin pages monochrome noir`
### Phase E — Public pages sweep (~13 + Hindi) — ✅ complete
(never touch public top nav)

**Legend:** ✅ done · 🔄 in progress · ⬜ pending · ❌ blocked

---

## 1. Goals & Non-Goals

### Goals
- Redesign **every page** across all three dashboard sections (~23 pages), not just dashboard homes.
- **Top pill nav** on all three roles (patient, provider, admin). No more sidebars.
- Three **distinct palettes per role**:
  - **Patient — "Mint Breeze"** (pastel teal/mint, calm/wellness)
  - **Provider — "Periwinkle Bloom"** (pastel periwinkle, professional warm)
  - **Admin — "Monochrome Noir"** (black/white/editorial, sophisticated)
- Mobile-friendly (hamburger + sticky bottom tab bar under `lg`).
- Consistent login/auth chrome (BpLogo visible, matches new look).
- **Nothing breaks.** All existing features remain functional.
- Stay true to bp pastel heritage; introduce new pastels as needed — do **not** adopt Apointa's colors.

### Non-Goals
- No new features. Skip Medical Tests / Prescription tabs from references.
- No schema changes, no API contract changes.
- No refactor of data-fetching logic (keep TanStack Query calls as-is).
- No commits split before the redesign — build on top of existing WIP.

---

## 2. Design Tokens (already in `src/app/globals.css`)

Three full palettes added to `@theme inline`. Each palette has: primary, primary-hover, ink, body, muted, surface, card, border, border-soft, active-bg, active-fg, track-bg, nav-bg, and 6 tile (bg/fg) pairs.

Prefixes:
- `--color-pt-*` — Patient (Mint Breeze)
- `--color-pv-*` — Provider (Periwinkle Bloom)
- `--color-ad-*` — Admin (Monochrome Noir)

### Patient — Mint Breeze
- primary `#2BA78D` / hover `#248F78`
- surface `#F4FBF8`, nav-bg `#FFFFFF`, track-bg `#F4FBF8`
- active-bg `#1F2A37` (dark ink), active-fg `#FFFFFF`
- tiles: mint, sky, peach, pink, lavender, sand

### Provider — Periwinkle Bloom
- primary `#6B7BF5` / hover `#5363D7`
- surface `#F7F8FC`, nav-bg `#FFFFFF`, track-bg `#F8F9FC`
- active-bg `#1A1C29`, active-fg `#FFFFFF`
- tiles: periwinkle, rose, peach, sage, lilac, teal

### Admin — Monochrome Noir
- primary `#0A0A0A` / hover `#27272A`
- surface `#F6F6F7`, nav-bg `#FFFFFF`, track-bg `#F1F1F2`
- active-bg `#0A0A0A`, active-fg `#FFFFFF`
- tiles: 5 grayscale + 1 warm-sand accent (`#FAF5E9`) reserved for warnings only

---

## 3. Shared Components

### Already created
- **`src/components/dashboard/TopPillNav.tsx`** — role-parameterized chrome.
  Props: `role: 'patient' | 'provider' | 'admin'`, `items: NavItem[]`, `notificationsHref?`, `messagesHref?`, `profileHref?`, `roleLabel: string`, `children`.
  Responsive: `≥xl` desktop pill nav, `<xl` hamburger dropdown, `<lg` sticky bottom tab bar (first 5 items).
  Themes via inline styles reading `var(--color-${prefix}-*)`.

### To create — `src/components/dashboard/primitives.tsx`
Parameterized by `role` prefix (`pt` | `pv` | `ad`). All tokens pulled from CSS vars.

1. **`StatTile`** — colored circular icon badge + label + value + optional delta
   - Props: `icon: LucideIcon`, `label: string`, `value: string | number`, `tone: 1|2|3|4|5|6` (tile palette index), `delta?: { value: string; positive?: boolean }`, `role`
2. **`DashCard`** — white card with soft shadow, 16–20px radius, border using `--color-${prefix}-border`
3. **`PageHeader`** — greeting-style header: title + subtitle + optional action button
4. **`SectionCard`** — card with title row (title, optional action link), slot for body
5. **`ListRow`** — avatar/icon + primary + secondary text + right slot (used for schedule items, patient rows, notifications)
6. **`EmptyState`** — icon + title + description + optional CTA (keep simple)

Card radius: 16px. Button radius: 24px (existing convention). Tile circle: 44–48px.

---

## 4. Layouts — refactor to use TopPillNav

### `src/app/patient/layout.tsx` → Mint Breeze
Replace existing left sidebar entirely. Nav items:
| href | label | icon | exact |
|---|---|---|---|
| /patient/dashboard | Dashboard | LayoutDashboard | ✓ |
| /patient/appointments | Appointments | Calendar |  |
| /patient/records | Records | FileText |  |
| /patient/messages | Messages | MessageSquare |  |
| /patient/payments | Payments | CreditCard |  |
| /patient/profile | Profile | User |  |

`notificationsHref="/patient/notifications"`, `messagesHref="/patient/messages"`, `profileHref="/patient/profile"`, `roleLabel="Patient"`.

### `src/app/provider/layout.tsx` → Periwinkle Bloom
Replace existing inline pill nav with shared component. Nav items:
| href | label | icon |
|---|---|---|
| /provider/dashboard | Overview | LayoutDashboard |
| /provider/calendar | Schedule | Calendar |
| /provider/patients | Patients | Users |
| /provider/earnings | Earnings | TrendingUp |
| /provider/availability | Availability | Clock |
| /provider/bills | Bills | Receipt |

`notificationsHref="/provider/notifications"`, `messagesHref="/provider/messages"`, `profileHref="/provider/profile"`, `roleLabel="Practitioner"`.

### `src/app/admin/layout.tsx` → Monochrome Noir
Drop dark slate theme entirely. Nav items:
| href | label | icon |
|---|---|---|
| /admin | Overview | LayoutDashboard |
| /admin/listings | Approvals | ShieldCheck |
| /admin/users | Users | Users |
| /admin/analytics | Analytics | BarChart3 |

`roleLabel="Administrator"`. No messages button (admin has none).

---

## 5. Dashboard Home Rewrites (full rewrites)

### `src/app/patient/dashboard/page.tsx`
- Keep `/api/patient/records` fetch via TanStack Query.
- Sections:
  1. `PageHeader` — "Hi, {first}" + "Here's your care at a glance"
  2. Stat row (4 `StatTile`s): Upcoming visits, Care team size, Last visit, Unread messages
  3. Two-column grid (lg+): left = Recent Visits (`SectionCard` + `ListRow`s, "View all" → /patient/records), right rail = Quick Actions (Book visit, Message care team, Update profile) + Upcoming appointment card
- Palette: `pt-*`.

### `src/app/provider/dashboard/page.tsx` — CLEAN REWRITE
- **Delete** existing over-styled version ("Operations Intelligence", 48px radii, dark hero, "Active Duty Log").
- Keep `/api/provider/schedule` and `/api/provider/patients` fetches.
- Sections:
  1. `PageHeader` — "Good morning, Dr. {last}" + today's date
  2. Stat row (4 `StatTile`s): Today's visits, Active patients, This week earnings (₹), Pending SOAP notes
  3. Two-column grid (xl+): left = Today's Schedule timeline (`SectionCard` with time-grouped `ListRow`s, empty state if none), right rail = Recent Patients (top 5) + Quick Actions (New bill, Block slot, Add patient)
- Palette: `pv-*`.

### `src/app/admin/page.tsx`
- Keep `/api/admin/stats` fetch.
- Sections:
  1. `PageHeader` — "Platform overview" + today's date
  2. Stat row (4 `StatTile`s): Active providers, Pending approvals (warning tone 4), Total patients, GMV this month (₹)
  3. Two-column: left = Verification Queue (`SectionCard` + `ListRow`s → /admin/listings), right rail = Admin Actions + Recent signups
- Palette: `ad-*`. Warm sand tile only on Pending approvals.

---

## 6. Secondary Pages — color/class sweep (no rewrites)

Rule: **touch only className + inline style**. Do not change data flow, hooks, or JSX structure beyond swapping wrapper divs.

Replace:
- hard-coded slate/blue/amber/violet classes → role CSS vars
- bg-white cards → `DashCard` or matching card classes
- sidebar-aware padding → rely on `TopPillNav`'s `<main>` (`pb-24 lg:pb-10`)

### Patient (6 pages)
- `src/app/patient/appointments/page.tsx`
- `src/app/patient/records/page.tsx`
- `src/app/patient/messages/page.tsx`
- `src/app/patient/payments/page.tsx`
- `src/app/patient/profile/page.tsx`
- `src/app/patient/notifications/page.tsx`

### Provider (9+ pages)
- `src/app/provider/calendar/page.tsx`
- `src/app/provider/appointments/page.tsx`
- `src/app/provider/patients/page.tsx`
- `src/app/provider/patients/[id]/page.tsx`
- `src/app/provider/earnings/page.tsx`
- `src/app/provider/availability/page.tsx`
- `src/app/provider/messages/page.tsx`
- `src/app/provider/profile/page.tsx`
- `src/app/provider/notifications/page.tsx`
- `src/app/provider/bills/new/page.tsx`

### Admin (3 pages)
- `src/app/admin/listings/page.tsx`
- `src/app/admin/users/page.tsx`
- `src/app/admin/analytics/page.tsx`

---

## 7. Auth / Login Consistency

- Verify `src/app/(auth)/login/page.tsx` and siblings use `<BpLogo size="auth" />`.
- Keep existing layout; only ensure background surface + card radius match new chrome (soft white card on neutral surface).
- No palette swap — auth is role-agnostic.

---

## 8. Phased Execution

### Phase A — Foundation (in progress)
- [x] Add role palette tokens to `globals.css`
- [x] Create `src/components/dashboard/TopPillNav.tsx`
- [ ] Create `src/components/dashboard/primitives.tsx`
- [ ] Refactor patient/provider/admin `layout.tsx` to use `TopPillNav`
- [ ] Rewrite 3 dashboard home pages
- [ ] Verify auth login chrome
- [ ] `rtk npm run build` — zero TS errors
- [ ] Commit: `feat: dashboard redesign phase A — shared chrome + palettes + home pages`

### Phase B — Patient secondary pages (6 pages)
- [ ] Color/class sweep all 6
- [ ] Build check
- [ ] Commit: `feat: dashboard redesign phase B — patient pages mint breeze`

### Phase C — Provider secondary pages (9+ pages)
- [ ] Color/class sweep all
- [ ] Build check
- [ ] Commit: `feat: dashboard redesign phase C — provider pages periwinkle bloom`

### Phase D — Admin secondary pages (3 pages)
- [ ] Color/class sweep all
- [ ] Build check
- [ ] Commit: `feat: dashboard redesign phase D — admin pages monochrome noir`

After each phase: `rtk npm run build` must pass. If anything breaks, fix before committing.

---

## 9. Rules & Guardrails

- **RTK prefix** on every shell command (`rtk git status`, `rtk npm run build`).
- **Never** mutate data in place — immutable updates only.
- Files max 800 lines, functions max 50 lines.
- Server Components by default; `'use client'` only when hooks/state needed.
- Zod-validate all user input (no changes needed for this redesign — existing boundaries unchanged).
- Currency: `₹` integer rupees only.
- Phone: `+91` always shown.
- Do not touch `src/components/shared/` (owned by bp-ui-public).
- Do not edit API routes, migrations, or lib/ utilities during redesign.

---

## 10. Definition of Done

- [ ] All 23+ pages render in all three palettes with top pill nav
- [ ] Mobile (375px): hamburger works, bottom tab bar visible, no horizontal scroll
- [ ] Tablet (768px): hamburger active, content readable
- [ ] Desktop (1280px+): full pill nav visible
- [ ] `rtk npm run build` passes (zero TS errors, zero lint errors)
- [ ] `rtk npm test` passes
- [ ] No console errors on any dashboard page
- [ ] Login page shows BpLogo and matches overall surface color
- [ ] Every interactive element still works (clicks route correctly, forms submit, data loads)
- [ ] Four clean phased commits on current branch

---

## 11. Visual Language (concrete spec)

### Typography
- Font: **Inter** (already loaded). Weights used: 400, 500, 600, 700, 800.
- Scale:
  - Page title (PageHeader h1): `text-[26px] lg:text-[30px] font-bold tracking-tight` color `var(--color-${p}-ink)`
  - Page subtitle: `text-[14px] text-slate-500`
  - Section title: `text-[15px] font-semibold` ink
  - Card title: `text-[14px] font-semibold` ink
  - Stat tile label: `text-[11px] font-semibold uppercase tracking-wider text-slate-400`
  - Stat tile value: `text-[26px] font-bold` ink, tabular-nums for ₹
  - Stat tile delta: `text-[11px] font-semibold` (emerald-600 positive, rose-500 negative)
  - Body text: `text-[13px] text-slate-600 leading-relaxed`
  - Nav pill label: `text-[13px] font-semibold`
  - Bottom tab label: `text-[10px] font-semibold uppercase tracking-wide`
  - Greeting kicker: `text-[10px] font-semibold uppercase tracking-wider text-slate-400`

### Spacing & Layout
- Page container: `max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8`
- Page vertical padding: `py-6 lg:py-8`
- Section gap: `space-y-6 lg:space-y-8`
- Grid gap: `gap-4 lg:gap-6`
- Card inner padding: `p-5 lg:p-6`
- Stat tile padding: `p-5`
- Header-to-content gap: `mt-6 lg:mt-8`
- Right rail width (xl+): `xl:w-[340px] shrink-0`
- Main+rail layout: `flex flex-col xl:flex-row gap-6`

### Radius & Shadow
- Card radius: `rounded-2xl` (16px)
- Stat tile radius: `rounded-2xl`
- Tile icon circle: `w-11 h-11 rounded-full` (44px)
- Avatar: `w-10 h-10 rounded-full`
- Button radius: `rounded-full` (pills) or `rounded-xl` (rectangular CTAs)
- Nav pill track: `rounded-full`
- Shadow (card): `shadow-[0_1px_3px_rgba(15,23,42,0.04),0_1px_2px_rgba(15,23,42,0.03)]`
- Shadow (elevated hover): `hover:shadow-[0_4px_12px_rgba(15,23,42,0.06)]`
- Shadow (stat tile): subtle — same as card
- Border: `border` width `1px` color `var(--color-${p}-border)`

### Icon sizes
- Nav pill icon: 16 (active strokeWidth 2.5, inactive 2)
- Bottom tab icon: 19 inactive / 21 active
- Stat tile icon: 20 inside 44px circle
- ListRow leading icon: 18
- Header action icon: 16
- All icons: **lucide-react**

### States
- Hover on card: border color → `var(--color-${p}-primary)` at 30% opacity, shadow elevate
- Hover on list row: `hover:bg-[var(--color-${p}-border-soft)]`
- Focus ring: `focus-visible:ring-2 focus-visible:ring-[var(--color-${p}-primary)] focus-visible:ring-offset-2`
- Active nav pill: solid `active-bg` background, `active-fg` text, `shadow-md`
- Disabled: `opacity-50 cursor-not-allowed`
- Loading (dashboard fetches): skeleton cards `animate-pulse bg-slate-100 rounded-2xl h-28`

### Motion
- Nav pill transition: `transition-all duration-200`
- Card hover: `transition-all duration-200`
- Mobile menu: `animate-slide-down` (existing keyframe in globals.css)
- No heavy parallax, no page-load animations beyond skeletons

---

## 12. Component Anatomy (JSX-level spec)

### StatTile
```
<div class="rounded-2xl border p-5 bg-white" style={{borderColor: var(--color-${p}-border)}}>
  <div class="flex items-start justify-between">
    <div class="w-11 h-11 rounded-full flex items-center justify-center"
         style={{background: tile-N-bg, color: tile-N-fg}}>
      <Icon size={20} strokeWidth={2.2}/>
    </div>
    {delta && <span class="text-[11px] font-semibold {emerald|rose}">↑ 12%</span>}
  </div>
  <div class="mt-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</div>
  <div class="mt-1 text-[26px] font-bold tabular-nums" style={{color: var(--color-${p}-ink)}}>{value}</div>
</div>
```
Grid: `grid grid-cols-2 lg:grid-cols-4 gap-4`.

### DashCard (generic wrapper)
```
<div class="rounded-2xl border bg-white p-5 lg:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)]"
     style={{borderColor: var(--color-${p}-border)}}>
  {children}
</div>
```

### PageHeader
```
<div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
  <div>
    <div class="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{kicker}</div>
    <h1 class="mt-1 text-[26px] lg:text-[30px] font-bold tracking-tight" style={{color: ink}}>{title}</h1>
    <p class="mt-1 text-[14px] text-slate-500">{subtitle}</p>
  </div>
  {action && <button class="rounded-full px-5 py-2.5 text-[13px] font-semibold text-white shadow-md"
                     style={{background: primary}}>{action.label}</button>}
</div>
```

### SectionCard
```
<DashCard>
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-[15px] font-semibold" style={{color: ink}}>{title}</h2>
    {action && <Link class="text-[12px] font-semibold" style={{color: primary}}>{action.label} →</Link>}
  </div>
  <div>{children}</div>
</DashCard>
```

### ListRow
```
<div class="flex items-center gap-3 py-3 border-b last:border-0" style={{borderColor: border-soft}}>
  <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
       style={{background: tile-bg, color: tile-fg}}>
    <Icon size={18}/>
  </div>
  <div class="flex-1 min-w-0">
    <div class="text-[13px] font-semibold truncate" style={{color: ink}}>{primary}</div>
    <div class="text-[12px] text-slate-500 truncate">{secondary}</div>
  </div>
  {right && <div class="text-[12px] font-semibold shrink-0">{right}</div>}
</div>
```

### EmptyState
```
<div class="text-center py-10">
  <div class="w-14 h-14 rounded-full mx-auto flex items-center justify-center"
       style={{background: border-soft, color: muted}}>
    <Icon size={22}/>
  </div>
  <div class="mt-3 text-[14px] font-semibold" style={{color: ink}}>{title}</div>
  <div class="mt-1 text-[12px] text-slate-500 max-w-xs mx-auto">{description}</div>
  {cta && <button class="mt-4 rounded-full px-4 py-2 text-[12px] font-semibold">{cta}</button>}
</div>
```

---

## 13. Dashboard Home — detailed section spec

### Patient Dashboard
**Grid**: `flex flex-col xl:flex-row gap-6`
- Main column (flex-1):
  - PageHeader — kicker "YOUR HEALTH", title "Hi, {first}", subtitle "Here's your care at a glance"
  - Stat row (4 tiles):
    1. Upcoming visits — tone 1 (mint) — Calendar icon
    2. Care team — tone 2 (sky) — Users icon
    3. Last visit — tone 3 (peach) — Activity icon — value = relative date
    4. Unread messages — tone 4 (pink) — MessageSquare icon
  - SectionCard "Recent visits" action → /patient/records — up to 5 ListRows, EmptyState if none ("No visits yet", "Book your first session", CTA → /search)
  - SectionCard "Your care plan" — free text/progress bars (use existing records data)
- Right rail (xl:w-[340px]):
  - SectionCard "Next appointment" — big date block + doctor name + "Join" or "Reschedule" buttons (EmptyState if none)
  - SectionCard "Quick actions" — 3 ListRow-style buttons: Book a visit, Message care team, Update profile

### Provider Dashboard
**Grid**: same flex pattern
- Main:
  - PageHeader — kicker "TODAY", title "Good morning, Dr. {last}", subtitle = today's date formatted "Tuesday, 7 April 2026"
  - Stat row:
    1. Today's visits — tone 1 (periwinkle) — Calendar
    2. Active patients — tone 4 (sage) — Users
    3. This week — tone 3 (peach) — TrendingUp — value "₹{n}"
    4. Pending notes — tone 2 (rose) — FileText
  - SectionCard "Today's schedule" action → /provider/calendar — time-grouped ListRows (time chip on right), EmptyState "No visits today — enjoy your day"
  - SectionCard "Recent patients" action → /provider/patients — top 5 ListRows
- Right rail:
  - SectionCard "Quick actions" — New bill, Block slot, Add patient (3 buttons)
  - SectionCard "This month" — earnings summary mini (value + small delta)

### Admin Dashboard
**Grid**: same
- Main:
  - PageHeader — kicker "PLATFORM", title "Overview", subtitle = today's date
  - Stat row:
    1. Active providers — tone 1 — Users
    2. Pending approvals — **tone 4 (warm sand, only warning tile)** — ShieldCheck
    3. Total patients — tone 5 — User
    4. GMV this month — tone 3 — IndianRupee — value "₹{n}"
  - SectionCard "Verification queue" action → /admin/listings — ListRows with Approve/Review right slot, EmptyState "Queue clear"
  - SectionCard "Recent signups" — last 5 users (mixed roles)
- Right rail:
  - SectionCard "Admin actions" — Manage users, View analytics, Platform settings
  - SectionCard "System status" — simple key/value list

---

## 14. Copy Bank (use exactly these strings)

### Greetings (hour-based, already in TopPillNav)
- 00–11 → "Good morning"
- 12–16 → "Good afternoon"
- 17–23 → "Good evening"

### Empty states
- Patient / No visits: **"No visits yet"** / "Your past and upcoming appointments will appear here." / CTA "Book a visit"
- Patient / No messages: **"Inbox is empty"** / "Messages from your care team will appear here."
- Provider / No schedule today: **"No visits today"** / "Enjoy your day — or block time for admin work." / CTA "Block slot"
- Provider / No patients: **"No patients yet"** / "Your patient roster will grow as bookings come in."
- Admin / Queue clear: **"Queue clear"** / "All provider applications reviewed."

### Loading (skeleton labels, optional)
Use skeleton blocks, no loading text.

### Errors
- Fetch failure: **"Couldn't load {thing}"** / "Try again in a moment." / CTA "Retry"

---

## 15. Palette → Tile Index Assignment (fixed)

To keep visual rhythm consistent across pages, stat tiles on **every** page use this order:

| Position | Patient | Provider | Admin |
|---|---|---|---|
| 1 | tile-1 mint | tile-1 periwinkle | tile-1 gray |
| 2 | tile-2 sky | tile-4 sage | tile-2 gray |
| 3 | tile-3 peach | tile-3 peach | tile-3 gray |
| 4 | tile-4 pink | tile-2 rose | **tile-4 warm sand** (warning only) |

Admin position 4 is reserved for warning/action-required metrics only. All other admin tiles use positions 1/2/3/5/6 (grayscale).

---

## 16. Responsive breakpoints (Tailwind defaults)

| bp | width | behavior |
|---|---|---|
| default | <640 | 1-col stats (grid-cols-2), stacked sections, bottom tab bar, hamburger in header |
| sm | ≥640 | stats 2-col, notification+messages buttons appear |
| md | ≥768 | greeting visible in header |
| lg | ≥1024 | stats 4-col, bottom tab bar hidden, hamburger still visible |
| xl | ≥1280 | pill nav visible, hamburger hidden, two-column main+rail layout |
| 2xl | ≥1536 | same as xl with more breathing room |

Never exceed `max-w-[1600px]`.

---

## 17. Accessibility

- Nav landmarks: `<nav aria-label="patient navigation">` etc.
- Active pill: no `aria-current` needed but add it for screen readers → `aria-current={active ? 'page' : undefined}`
- All icon-only buttons: `aria-label` required (Notifications, Messages, Open menu, Close menu, Sign out)
- Focus ring on every interactive element (via `focus-visible`)
- Color contrast: ink on white ≥ 12:1, body ≥ 7:1, muted ≥ 4.5:1 — verified by palette choices
- Tab order: logo → nav → notifications → messages → profile → menu toggle → main content

---

## 18. Build & Verify checklist per phase

```bash
rtk npm run build          # zero TS errors
rtk npm run lint           # zero warnings
rtk npm test               # all green
rtk playwright test        # critical journeys pass
```

Manual smoke (every phase):
- [ ] Load each page in the phase at 375px, 768px, 1280px
- [ ] Click every nav item — routes correctly
- [ ] Sign out works
- [ ] No console errors
- [ ] Active nav pill matches current route
- [ ] Mobile bottom tab bar shows first 5 items
- [ ] Login page still renders with BpLogo

---

## 19. Rollback plan

Each phase is a single commit. If a phase breaks prod:
1. `rtk git revert <commit-sha>`
2. Investigate in new branch
3. Re-apply phase with fix

Do **not** amend phase commits once pushed.

---

## 20. Public Pages — Phase E (NEW)

### Hard rule
**Do NOT touch the public top navigation.** The existing public nav on `src/app/page.tsx`, `src/app/search/page.tsx`, `src/app/how-it-works/page.tsx`, etc. stays **exactly as is**. No changes to its markup, styles, logo slot, menu items, or mobile drawer.

Only the **page body content below the nav** gets the redesign sweep.

### Palette for public pages
Public pages are role-agnostic. Use a neutral **"Public Bloom"** theme built from existing bp pastel tokens (no new CSS vars needed):
- Surface: `#FAFAFA` (or existing `--color-bg`)
- Card: `#FFFFFF`
- Ink: `#1A1C29`
- Body: `#55586B`
- Primary: keep existing bp teal `#00766C`
- Accent (CTA only): `#FF6B35`
- Stat/feature tile backgrounds: reuse Pastel Bloom tokens already in globals.css (periwinkle/mint/coral/peach/sage/lavender/rose)

### Pages in scope (Phase E)
1. `src/app/page.tsx` — **homepage** (currently "still good" per user — verify only, polish spacing/typography, do **not** replace hero or nav)
2. `src/app/search/page.tsx` — search results page
3. `src/app/how-it-works/page.tsx` — how it works
4. `src/app/about/page.tsx`
5. `src/app/faq/page.tsx`
6. `src/app/privacy/page.tsx`
7. `src/app/terms/page.tsx`
8. `src/app/doctor/[id]/page.tsx` — doctor profile
9. `src/app/book/[id]/page.tsx` — booking flow
10. `src/app/city/[slug]/page.tsx` — city landing pages
11. `src/app/specialty/[slug]/page.tsx` — specialty landing
12. `src/app/specialties/[slug]/page.tsx` and 6 sub-pages (sports, neuro, ortho, paediatric, womens-health, geriatric)
13. Hindi mirrors under `src/app/hi/*` (same sweep, keep Hindi copy)

### What to change on public pages
- **Keep**: nav, logo, hero section (if any), core layout, routing, data fetching
- **Sweep**:
  - Card components → `rounded-2xl` + subtle shadow to match dashboard DashCard
  - Section spacing → use `py-12 lg:py-16` for page sections, `space-y-8` inside
  - Typography → align with §11 scale (page titles 30px/36px, section titles 24px)
  - Buttons → `rounded-full` primary CTAs with bp teal background
  - Feature tile icons → use Pastel Bloom tile colors (same circular badge pattern as StatTile)
  - Stat/metric blocks → same StatTile component from `dashboard/primitives.tsx` (it's role-agnostic — accepts any tokens)
  - Empty states → same EmptyState component and copy bank
  - Forms (search filters, booking form) → consistent input styling: `rounded-xl border bg-white px-4 py-3 text-[14px] focus-visible:ring-2 focus-visible:ring-[#00766C]`
  - Remove any legacy dark-mode classes or old slate/blue hard-coded palettes
- **Homepage specifically**: user says "still good" → verify only. Run visual check, fix any spacing/radius/typography drift, do not rewrite sections.

### Footer
- Public footer stays as-is unless it has broken styling. Only sweep if colors clash with new pastel card backgrounds.

### Phase E checklist
- [ ] Audit each public page — screenshot before/after at 375/768/1280
- [ ] Verify nav untouched (diff the nav component file — should be unchanged)
- [ ] Apply card/typography/button sweep
- [x] Build check
- [x] Commit: `feat: phase E public pages polish`

---

## 21. Remaining coverage — things easy to miss

### Modals & dialogs
- `src/components/clinical/AddPatientModal.tsx` and any other modal: card radius `rounded-2xl`, overlay `bg-slate-900/50 backdrop-blur-sm`, close button top-right, title `text-[18px] font-bold`, body `text-[14px] text-slate-600`.

### Forms
- Input: `rounded-xl border border-slate-200 bg-white px-4 py-3 text-[14px] placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[var(--color-${p}-primary)] focus-visible:border-transparent`
- Label: `text-[12px] font-semibold text-slate-700 mb-1.5 block`
- Error: `text-[12px] text-rose-600 mt-1.5`
- Textarea: same as input
- Select: same as input + chevron-down lucide icon
- Checkbox/Radio: custom styled with role primary color
- Submit button: full-width on mobile `rounded-full py-3 text-[14px] font-semibold text-white` with `background: var(--color-${p}-primary)`

### Toasts / Notifications (if using sonner or similar)
- Position: bottom-right desktop, top mobile
- Radius: `rounded-xl`
- Success: emerald accent, Error: rose, Info: role primary

### PDF / Print components
- `src/components/bills/BillPdfDocument.tsx` — leave as-is (PDF rendering has its own style system, don't touch)

### Tables (if any in admin listings/users/analytics)
- Header row: `bg-[var(--color-ad-track-bg)] text-[11px] font-semibold uppercase tracking-wider text-slate-500`
- Row: `border-b border-[var(--color-ad-border-soft)] py-3 text-[13px]`
- Hover: `hover:bg-[var(--color-ad-border-soft)]`
- No striping
- Actions column: right-aligned with icon buttons

### Charts (earnings, analytics)
- Use existing chart library — just swap stroke/fill colors to role primary
- Gridlines: `var(--color-${p}-border-soft)`
- Axis labels: `text-[11px] text-slate-400`

### Badges / Pills (status indicators)
- `rounded-full px-2.5 py-0.5 text-[11px] font-semibold`
- Success: `bg-emerald-50 text-emerald-700`
- Warning: `bg-amber-50 text-amber-700`
- Error: `bg-rose-50 text-rose-700`
- Info: `bg-[var(--color-${p}-border-soft)] text-[var(--color-${p}-ink)]`
- Neutral: `bg-slate-100 text-slate-700`

### Notification bell red dot
- `absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white`
- Only show when unread count > 0

### Avatar fallback
- Initials from `full_name` first 2 words, uppercase
- Fallback "?" if no name
- Gradient background per role (see TopPillNav.tsx `avatarClass`)

---

## 22. Files explicitly OUT of scope

Do NOT edit during any redesign phase:
- `src/app/api/**` — API routes (backend owned)
- `src/app/layout.tsx` — root layout (unless a specific bug)
- Any file under `src/lib/` except style utilities
- Any migration or SQL file
- `src/components/shared/*` — owned by bp-ui-public agent
- `next.config.js`, `tailwind.config.*`, `tsconfig.json`
- Any `*.test.tsx` file unless a test breaks due to refactor
- `src/components/bills/BillPdfDocument.tsx` — PDF rendering
- Public top navigation component (whichever file renders it on `src/app/page.tsx`)

---

## 23. Phase summary (updated)

| Phase | Scope | Pages | Palette | Status |
|---|---|---|---|---|
| A | Foundation: tokens, TopPillNav, primitives, 3 layouts, 3 dashboard homes, auth verify | 3 layouts + 3 homes + login | all 3 | in progress |
| B | Patient secondary | 6 | Mint Breeze | pending |
| C | Provider secondary | 10 | Periwinkle Bloom | pending |
| D | Admin secondary | 3 | Monochrome Noir | pending |
| E | Public pages sweep (keep nav) | ~13 + Hindi mirrors | Public Bloom | pending |

Total pages redesigned: ~35+ (English) + Hindi mirrors.

---

## 24. Structural Adoption (NOT a color sweep)

**This redesign is a full structural adoption of the Apointa-style concept, not a palette swap.** Every dashboard page must be rebuilt around the new layout primitives, not just re-colored in place. If a page still has its old section structure after "sweeping," the work is incomplete.

### What "adoption" means concretely

For **every** dashboard page (homes AND secondary), the final page must exhibit ALL of the following structural traits:

1. **Top pill nav chrome** — TopPillNav wrapper, no sidebars, no custom per-page headers
2. **PageHeader block** at the top — kicker + title + subtitle + optional primary action button (no more inline `<h1>` soup)
3. **Stat tile row** where metrics exist — 2–4 StatTiles in a grid with colored circular icon badges (not flat numbers in a table)
4. **Two-column main+rail layout** on xl+ where it makes sense — main content flex-1, right rail 340px with supporting cards
5. **SectionCard wrappers** around every content block — no naked divs with borders
6. **ListRow pattern** for every list (schedule, patients, messages, notifications, visits, approvals) — avatar/icon circle + primary + secondary + right slot
7. **EmptyState component** wherever data might be empty — no "No data" plaintext strings
8. **Consistent spacing rhythm** — `space-y-6 lg:space-y-8` between sections, `gap-4 lg:gap-6` in grids
9. **Rounded-2xl cards** with the prescribed shadow — no sharp corners, no heavy borders
10. **Role palette tokens everywhere** — zero hard-coded slate/blue/amber/violet classes

### Per-page adoption plan (secondary pages — structural rebuild, NOT color swap)

#### Patient — Phase B
- **appointments** → PageHeader "Your appointments" + tab pills (Upcoming/Past) + SectionCard list of ListRows (doctor avatar, type, date, status pill, Join/Reschedule right slot) + EmptyState
- **records** → PageHeader + StatTile row (Total visits, Last visit, Active plans) + SectionCard "Visit history" ListRows + SectionCard "Care plans"
- **messages** → PageHeader + two-column: left conversation list as ListRows, right active thread
- **payments** → PageHeader + StatTile row (Total paid, This month, Pending) + SectionCard "Payment history" ListRows with amount right slot
- **profile** → PageHeader + SectionCards grouped (Personal, Contact, Medical) with form inputs per §21
- **notifications** → PageHeader + SectionCard ListRows grouped by time, mark-all-read action

#### Provider — Phase C
- **calendar** → PageHeader + view toggle pills (Day/Week/Month) + SectionCard containing calendar grid
- **appointments** → PageHeader + filter pills + SectionCard list (patient avatar, time chip right slot, status pill)
- **patients** → PageHeader + search input + StatTile row + SectionCard ListRows + EmptyState
- **patients/[id]** → PageHeader (patient name) + StatTile row (Visits, Last seen, Outstanding) + two-col: main = SectionCard "Visit history" + "SOAP notes", rail = "Profile" + "Quick actions"
- **earnings** → PageHeader + StatTile row (This month, Last month, YTD, Pending) + SectionCard chart + SectionCard "Recent payouts" ListRows
- **availability** → PageHeader + SectionCard "Weekly hours" editor + SectionCard "Time off"
- **messages** → same pattern as patient messages
- **profile** → PageHeader + SectionCards (Professional info, Clinic, Credentials, Payout)
- **notifications** → same pattern as patient notifications
- **bills/new** → PageHeader "Generate bill" + SectionCard form + SectionCard "Preview"

#### Admin — Phase D
- **listings** → PageHeader "Approval queue" + StatTile row (Pending, Approved today, Rejected) + SectionCard ListRows (provider avatar, name, ICP, submitted, Approve/Review right slot)
- **users** → PageHeader + search + tabs (All/Patients/Providers/Admins) + SectionCard table (§21 spec)
- **analytics** → PageHeader + StatTile row (GMV, Bookings, Active users, Conversion) + SectionCard chart grid + SectionCard "Top cities" + SectionCard "Top specialties"

### Anti-patterns — if you see these, the work is wrong

- ❌ Replacing `bg-slate-50` with `bg-[var(--color-pt-surface)]` and calling it done
- ❌ Keeping the old page layout and just swapping button colors
- ❌ Leaving inline `<h1 class="text-2xl">` instead of PageHeader
- ❌ Rendering metrics as a flat row of numbers instead of StatTiles
- ❌ Bare `<ul>` lists without ListRow styling
- ❌ "No data" plaintext instead of EmptyState
- ❌ Sharp-cornered cards or heavy 2px borders
- ❌ Any leftover old sidebar, old dark theme, or old amber/slate/violet palette

### Success criteria — eyeball test

If you screenshot any page vs the Apointa reference concept:
- **Same** information density, visual rhythm (header → stats → main+rail → cards → lists), card/tile/circle vocabulary, calm editorial feel
- **Different** in colors (bp, not Apointa), content (physio, not generic medical), copy (bp voice)

**If only colors changed, the work is wrong.** The structure IS the redesign.

### Per-page done definition

Before ticking a page off, verify all 10 structural traits above are present AND the page still functions (data loads, routes work, forms submit, no console errors).

---

## 25. Final gap-fill — everything else sitewide

### Error & edge pages
- `src/app/not-found.tsx` (404) — if missing, create one. Layout: centered, BpLogo, 404 kicker, title "Page not found", body text, CTA "Back to home" (role-agnostic, uses Public Bloom palette)
- `src/app/error.tsx` (500 boundary) — same pattern, title "Something went wrong", CTA "Try again" + "Go home"
- `src/app/loading.tsx` — centered skeleton, no spinner, no brand animation
- Per-route `error.tsx` / `loading.tsx` in dashboard sections → use role palette, skeleton cards matching StatTile/SectionCard shapes

### Dark mode
- **Not supported.** This redesign is light-only. Do not add `dark:` variants. If any exist in swept files, remove them.

### Reduced motion
- Respect `prefers-reduced-motion` — wrap the `animate-slide-down` keyframe in a media query (already standard in Tailwind). No autoplay animations. No parallax.

### Icons
- **Lucide only.** No emoji, no heroicons, no custom SVGs except BpLogo. If a page currently uses a different icon lib, swap to lucide during its phase.

### Images & avatars
- Avatars: Next `<Image>` with fallback to initials (existing `TopPillNav` pattern)
- Doctor photos in public pages: `rounded-2xl` with `aspect-[4/5]` or `aspect-square`
- All remote images must go through Next Image with proper `sizes` prop
- Placeholder: `bg-[var(--color-${p}-border-soft)]`

### Focus & keyboard
- Every interactive element has visible `focus-visible:ring-2`
- Escape closes modals and mobile nav drawer
- Tab order matches visual order
- Skip-to-content link at top of every layout: `sr-only focus:not-sr-only` anchor to `<main>`

### Loading choreography
- Dashboard pages: show skeleton StatTiles + skeleton SectionCards immediately on mount, swap to real data when query resolves
- No layout shift (skeletons match final heights)
- Use `animate-pulse` on skeleton blocks

### Toasts (sonner or existing)
- Single toaster mounted at root layout
- Radius `rounded-xl`, shadow matching cards
- Auto-dismiss 4s default, 6s for errors
- Copy: action-oriented ("Saved", "Copied", "Couldn't save — try again")

### Cookie / consent banner
- If present, restyle to match card vocabulary (rounded-2xl, role-agnostic palette, non-intrusive bottom-left)
- If absent, do not add one in this redesign

### Email templates (Resend)
- **Out of scope.** Email HTML stays as-is.

### PDF bills
- **Out of scope.** `BillPdfDocument.tsx` untouched.

### Meta tags / OG images
- **Out of scope for visual redesign.** SEO/OG handled separately.

### Brand voice (microcopy)
- Warm, clear, no jargon, no exclamation marks in UI copy
- Physiotherapy-specific: "visit" not "appointment" in patient-facing copy where it fits, "session" interchangeably
- Provider-facing: "patient," "schedule," "notes"
- Admin-facing: "platform," "queue," "users," "providers"
- Currency: always `₹` with integer rupees, tabular-nums
- Dates: "7 Apr 2026" short form, "Tuesday, 7 April 2026" long form
- Times: 12-hour with lowercase am/pm: "9:30 am"

### Shadcn components to restyle (if used)
If the project uses shadcn, these need a pass to match new radius/shadow/border:
- Button, Input, Textarea, Select, Checkbox, Radio, Switch
- Dialog (modals), Popover, Tooltip, DropdownMenu
- Tabs, Accordion, Card, Badge, Avatar
- Toast (sonner)
- Calendar (if used in availability/calendar pages)

Update their variants in `src/components/ui/*` to use role CSS vars or sensible defaults. Do this **once** in Phase A foundation so every later phase inherits.

### Component inventory freeze
After Phase A, the following components are the **only** building blocks permitted for dashboard pages:
- `TopPillNav` (chrome)
- `StatTile`, `DashCard`, `PageHeader`, `SectionCard`, `ListRow`, `EmptyState` (primitives)
- Shadcn `Button`, `Input`, `Textarea`, `Select`, `Dialog`, `Tabs`, `Badge`, `Avatar`, `Tooltip`
- `BpLogo`
- Lucide icons

If a page needs something not on this list, flag it — don't invent a new one-off.

### Analytics / tracking
- **Out of scope.** Do not add new tracking events. Do not remove existing ones.

### Performance budget
- No new heavy dependencies for the redesign (no new chart lib, no new animation lib, no new icon lib)
- Primitives file should be <400 lines
- TopPillNav is <400 lines (already ~280)
- Dashboard home pages target <350 lines each after rewrite

### Testing expectations
- Unit tests for primitives (StatTile renders tone, PageHeader renders action, EmptyState renders CTA)
- Existing e2e tests must still pass — update selectors if they rely on removed classes/IDs
- Do not rewrite tests just for aesthetic reasons; only fix what breaks

### Documentation follow-up (after all phases)
- Update `docs/CODEMAPS/OVERVIEW.md` palette section (currently stale)
- Update `docs/CODEMAPS/components.md` with TopPillNav + primitives
- Add Storybook-style examples to `docs/research/components/` if that directory is still used
- Close out `docs/planning/ACTIVE.md` entries
- Tick Phase 13 (or new Phase 15) in `docs/planning/EXECUTION-PLAN.md`

---

## 26. What is explicitly NOT covered (and why)

Intentionally out of scope — do not expand this doc to cover them:
- **Backend/API changes** — this is visual only
- **Schema/migrations** — untouched
- **Auth flow logic** — only chrome/styling of auth pages
- **Payment integration** — Razorpay logic untouched, only bill page UI
- **Email/SMS templates** — separate track
- **PDF rendering** — has its own style system
- **SEO/meta/sitemap** — separate track
- **Analytics events** — separate track
- **i18n strings** — Hindi mirrors get same structural sweep but no new translations
- **Dark mode** — not supported, not added
- **New features** — Medical Tests, Prescriptions, etc. explicitly deferred

---

## 27. References

- `docs/CODEMAPS/OVERVIEW.md` — file map (note: palette section is STALE, use this doc instead)
- `docs/planning/ACTIVE.md` — current task queue
- `docs/planning/EXECUTION-PLAN.md` — phase status
- `src/app/globals.css` — source of truth for design tokens
- `src/components/dashboard/TopPillNav.tsx` — shared chrome implementation
- `src/components/dashboard/primitives.tsx` — StatTile, DashCard, PageHeader, SectionCard, ListRow, EmptyState (to be created in Phase A)
