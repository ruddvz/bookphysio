# Slices 16.21 – 16.27 — Simplified Implementation Spec

> **Read this before touching any file.** Every slice follows the same pattern as 16.16–16.20.
> Do not deviate from the pattern. Do not add features not listed. Do not modify v1 code.

---

## The Pattern (copy it for every slice)

Every slice = one new `*V2.tsx` component + one `*-v2.test.tsx` file + a two-line edit to the existing `page.tsx`.

**New component skeleton:**
```tsx
'use client'
import { useUiV2 } from '@/hooks/useUiV2'
// ... other imports

export function MyPageV2(props: Props) {
  const v2 = useUiV2()
  if (!v2) return null          // ← always first guard
  // render v2 UI
}
```

**page.tsx edit (2 lines):**
```tsx
// 1. Import the new component at top
import { MyPageV2 } from './MyPageV2'

// 2. Render it before the v1 JSX (v2 returns null when flag is off)
<MyPageV2 {...requiredProps} />
{/* existing v1 JSX unchanged below */}
```

**CSS tokens to use:**
- Patient role: `var(--color-pt-primary)`, `var(--color-pt-ink)`, `var(--color-pt-muted)`, `var(--color-pt-border)`, `var(--color-pt-border-soft)`, `var(--color-pt-tile-1-bg)`, `var(--color-pt-tile-2-bg/fg)`, `var(--sq-lg)`, `var(--sq-sm)`
- Provider role: `var(--color-pv-primary)`, `var(--color-pv-ink)`, `var(--color-pv-muted)`, `var(--color-pv-border)`, `var(--color-pv-border-soft)`, `var(--color-pv-tile-1-bg)`, `var(--color-pv-tile-2-bg/fg)`, `var(--sq-lg)`, `var(--sq-sm)`

**Shared primitives (always import from these exact paths):**
- `import { Badge } from '@/components/dashboard/primitives/Badge'`
- `import { Sparkline } from '@/components/dashboard/primitives/Sparkline'`
- `import { TrendDelta } from '@/components/dashboard/primitives/TrendDelta'`

**Rules:**
- Currency: `₹` integer rupees only, formatted with `.toLocaleString('en-IN')`
- Dates: `en-IN` locale, IST-aware (`+5:30` offset = `5.5 * 60 * 60 * 1000` ms)
- No hardcoded colours — CSS vars only
- Pure utility functions extracted to a `*-utils.ts` file so they are unit-testable
- ≥ 6 unit tests per slice, using Vitest + `@testing-library/react`
- `data-testid` on every interactive/meaningful element
- `data-ui-version="v2"` on the root element
- `aria-label` on lists, regions, and badges

---

## Slice 16.21 — `/patient/pai` + `/patient/motio`

**Goal:** Wrap the existing PAI and Motio AI chat pages with a v2 chrome header that shows a role=patient pulse status badge and a brief context strip above the `BookPhysioAIChat` component.

**Files to create:**
- `src/app/patient/pai/PaiV2Shell.tsx`
- `src/app/patient/motio/MotioV2Shell.tsx`
- `src/app/patient/pai/pai-v2.test.tsx`

**Files to edit:**
- `src/app/patient/pai/page.tsx` — import + render `<PaiV2Shell />` before `<BookPhysioAIChat>`
- `src/app/patient/motio/page.tsx` — import + render `<MotioV2Shell />` before `<BookPhysioAIChat>`

**`PaiV2Shell` spec:**
```
Self-gates via useUiV2(). Returns null in v1.

Renders above the existing BookPhysioAIChat:
  - Kicker: "PHYSIOTHERAPY AI" (uppercase, teal)
  - Title: "PAI — Clinical AI"
  - Subtitle: "Evidence-based musculoskeletal guidance for Indian clinical practice"
  - Right-side Badge (role="patient", variant="soft", tone=2): "Specialist AI"
  - A single-line info strip: Bot icon + "Powered by BookPhysio AI · For educational use only"

data-testid="pai-v2-shell"
```

**`MotioV2Shell` spec:**
```
Self-gates via useUiV2(). Returns null in v1.

Renders above the existing BookPhysioAIChat:
  - Kicker: "RECOVERY ASSISTANT" (uppercase, teal)
  - Title: "Motio"
  - Subtitle: "Tell me what hurts — I'll help you find the right next step"
  - Right-side Badge (role="patient", variant="soft", tone=1): "Patient AI"
  - A single-line info strip: Zap icon + "Instant guidance · Always free · Not a substitute for a physio"

data-testid="motio-v2-shell"
```

**Tests (≥ 6 total across both files):**
- `PaiV2Shell` renders null when `useUiV2` returns false
- `PaiV2Shell` renders `data-testid="pai-v2-shell"` when v2 is on
- `PaiV2Shell` shows the "Specialist AI" Badge text
- `MotioV2Shell` renders null when v2 is off
- `MotioV2Shell` renders `data-testid="motio-v2-shell"` when v2 is on
- `MotioV2Shell` shows the "Patient AI" Badge text

---

## Slice 16.22 — `/patient/search`

**Goal:** Wrap the existing patient search page with a v2 filter rail at the top — specialty chips, visit-type toggle, and a pincode input — all purely visual (no API wiring needed beyond what's already there).

**Files to create:**
- `src/app/patient/search/PatientSearchV2Rail.tsx`
- `src/app/patient/search/search-v2.test.tsx`

**Files to edit:**
- `src/app/patient/search/page.tsx` — import + render `<PatientSearchV2Rail />` at the top of the content area

**`PatientSearchV2Rail` spec:**
```
Self-gates via useUiV2(). Returns null in v1.

Props:
  selectedSpecialty?: string
  onSpecialtyChange?: (slug: string | null) => void
  selectedMode?: 'clinic' | 'home_visit' | 'video' | null
  onModeChange?: (mode: 'clinic' | 'home_visit' | 'video' | null) => void
  pincode?: string
  onPincodeChange?: (v: string) => void

Renders:
  1. Page header row:
     - Kicker: "FIND A PHYSIO"
     - Title: "Search Physiotherapists"
     - Active-filter count Badge: only shown when at least 1 filter is set

  2. Filter rail (horizontal scroll on mobile):
     - Specialty chips (7 common ones: Back Pain, Neck Pain, Knee Pain, Sports Injury,
       Post-Surgery, Neurological, Paediatric). Each is a toggle button, active state
       = solid teal bg. Use Badge primitive with variant="solid" when active,
       variant="outline" when inactive, role="patient".
     - Vertical divider
     - Visit mode chips: "Clinic", "Home visit", "Video" — same toggle logic
     - Vertical divider
     - Pincode input: 6-digit, placeholder "Pincode", maxLength=6, pattern /^[1-9][0-9]{5}$/

data-testid="patient-search-v2-rail"
Each specialty chip: data-testid="specialty-chip-{slug}"
Each mode chip: data-testid="mode-chip-{mode}"
Pincode input: data-testid="pincode-input"
Active filter badge: data-testid="active-filter-count"
```

**Tests (≥ 6):**
- Renders null when v2 is off
- Renders `data-testid="patient-search-v2-rail"` when v2 is on
- Active-filter count badge hidden when no filters selected
- Active-filter count badge shows "1 filter" when one specialty selected
- Clicking a specialty chip calls `onSpecialtyChange` with that slug
- Clicking an already-active specialty chip calls `onSpecialtyChange(null)` (deselect)
- Pincode input has maxLength=6 and correct aria-label

---

## Slice 16.24 — `/provider/appointments` + `/provider/appointments/[id]`

**Goal:** Add v2 chrome to the provider appointments list and detail pages using provider pulse tokens. Mirrors what slice 16.16 did for patients.

**Files to create:**
- `src/app/provider/appointments/ProviderAppointmentsTimelineV2.tsx`
- `src/app/provider/appointments/provider-appointments-v2-utils.ts`
- `src/app/provider/appointments/appointments-v2.test.tsx`
- `src/app/provider/appointments/[id]/ProviderAppointmentDetailV2.tsx`

**Files to edit:**
- `src/app/provider/appointments/page.tsx` — import + render `<ProviderAppointmentsTimelineV2 />` before v1 JSX
- `src/app/provider/appointments/[id]/page.tsx` — import + render `<ProviderAppointmentDetailV2 />` before v1 JSX

**`ProviderAppointmentsTimelineV2` spec:**
```
Props: { appointments: AppointmentRow[]; tab: 'upcoming' | 'completed' | 'cancelled' }
Self-gates via useUiV2(). Returns null in v1.

Uses role="provider" tokens throughout (--color-pv-* CSS vars).
Renders appointments grouped by day (same algorithm as PatientAppointmentsTimeline
but with patient name instead of provider name).
Each row shows:
  - Patient initials avatar (2-char circle, pv-tile-2-bg)
  - Patient full_name (bold)
  - Visit type label + appointment date + time
  - Fee: ₹{fee_inr} (integer, en-IN locale)
  - Status Badge (role="provider"):
      confirmed → success
      pending   → warning
      completed → soft tone=1
      cancelled / no_show → danger
  - "View →" Link to /provider/appointments/{id}
  - Quick-action chips for upcoming appointments:
      "Complete" button (data-testid="action-complete")
      "No-show" button (data-testid="action-no-show")
      (These are UI-only; onClick handlers are no-ops in v1; real wiring is out of scope)

Day header format: "Today", "Tomorrow", "Yesterday", or "EEE d MMM" (e.g. "Mon 21 Apr")
data-testid="provider-appointments-timeline-v2"
```

**`provider-appointments-v2-utils.ts`** — pure functions:
```ts
groupApptsByDay(appointments, tab, nowMs): DayGroup[]
providerStatusBadgeVariant(status: string): BadgeVariant
formatProviderApptDate(iso: string): string
patientDisplayName(appt: { patient: { full_name: string } | null }): string
```

**`ProviderAppointmentDetailV2` spec:**
```
Props: { appointment: AppointmentDetailRow }
Self-gates via useUiV2(). Returns null in v1.

v2 chrome additions on top of v1 detail:
  - Status Badge at the top (same variant mapping as timeline)
  - Provider token colours for action buttons
  - "Mark Complete" + "Mark No-show" buttons (UI-only, disabled for past-only)
  - Clinical notes textarea preserved from v1

data-testid="provider-appt-detail-v2"
```

**Tests (≥ 6):**
- `ProviderAppointmentsTimelineV2` renders null when v2 is off
- Renders with correct `data-testid` when v2 is on
- Day header shows "Today" for appointments with today's date
- Confirmed appointment shows `variant="success"` Badge
- Cancelled appointment shows `variant="danger"` Badge
- `patientDisplayName` returns "Patient" when patient is null
- `groupApptsByDay` returns empty array when input is empty

---

## Slice 16.25 — `/provider/calendar` + `/provider/availability`

**Goal:** Add v2 chrome to the calendar grid and availability settings page.

**Files to create:**
- `src/app/provider/calendar/CalendarV2Header.tsx`
- `src/app/provider/availability/AvailabilityV2StatusBar.tsx`
- `src/app/provider/calendar/calendar-v2.test.tsx`

**Files to edit:**
- `src/app/provider/calendar/page.tsx` — render `<CalendarV2Header />` at the top
- `src/app/provider/availability/page.tsx` — render `<AvailabilityV2StatusBar />` at the top

**`CalendarV2Header` spec:**
```
No props needed (reads nothing from API — purely chrome).
Self-gates via useUiV2(). Returns null in v1.

Renders:
  - Kicker: "SCHEDULE"
  - Title: "Clinical Calendar"
  - Subtitle: "Weekly view of your sessions and open slots"
  - Right rail with 3 micro-stat chips (static, hardcoded for now):
      Badge (variant="soft" tone=1 role="provider"): "7-day view"
      Badge (variant="outline" role="provider"): "IST"
      Badge (variant="success" role="provider"): "Live"
  - A legend row: coloured dots + labels for "Booked", "Available", "Blocked"

data-testid="calendar-v2-header"
```

**`AvailabilityV2StatusBar` spec:**
```
No props needed.
Self-gates via useUiV2(). Returns null in v1.

Renders:
  - Kicker: "AVAILABILITY"
  - Title: "Working Hours"
  - Subtitle: "Set your weekly schedule and slot duration"
  - An info chip: Shield icon + "Changes apply from the next booking window"

data-testid="availability-v2-status-bar"
```

**Tests (≥ 6):**
- `CalendarV2Header` renders null when v2 is off
- Renders `data-testid="calendar-v2-header"` when v2 is on
- Shows "Clinical Calendar" heading text
- Shows "IST" badge
- `AvailabilityV2StatusBar` renders null when v2 is off
- Renders `data-testid="availability-v2-status-bar"` when v2 is on

---

## Slice 16.26 — `/provider/earnings`

**Goal:** Add v2 chrome — a `Sparkline` earnings trend + `TrendDelta` tiles — above the existing v1 ledger table.

**Files to create:**
- `src/app/provider/earnings/ProviderEarningsV2.tsx`
- `src/app/provider/earnings/earnings-v2-utils.ts`
- `src/app/provider/earnings/earnings-v2.test.tsx`

**Files to edit:**
- `src/app/provider/earnings/page.tsx` — import + render `<ProviderEarningsV2 transactions={transactions} />` before v1 JSX

**`ProviderEarningsV2` spec:**
```
Props:
  transactions: Array<{
    id: string
    date: string         // "DD MMM YYYY"
    patient: string
    amount: number       // integer ₹
    gst: number          // integer ₹
    net: number          // integer ₹
    status: 'paid' | 'pending'
  }>

Self-gates via useUiV2(). Returns null in v1.

Renders:
  1. Page header:
     - Kicker: "FINANCIALS"
     - Title: "Earnings Overview"
     - Right side: current month name Badge (variant="soft" tone=1 role="provider")

  2. KPI strip (3 tiles in a row):
     - "Gross Revenue": sum of amount for paid items, formatted ₹ en-IN
       TrendDelta: show % change vs previous month (computed from transactions)
     - "GST Collected": sum of gst for paid items + Badge(variant="soft" role="provider"): "18%"
     - "Net Payout": sum of net for paid items, with Sparkline of last 6 monthly net values

  3. Month-grouped ledger (same grouping logic as PatientPaymentsLedger but for provider):
     Each row: patient name + date + amount + net + status Badge

data-testid="provider-earnings-v2"
All KPI tiles: data-testid="kpi-{gross|gst|net}"
```

**`earnings-v2-utils.ts`** — pure functions:
```ts
groupEarningsByMonth(transactions): MonthGroup[]
buildEarningsSparkline(transactions, nowMs?: number): number[]  // 6-month net values
pctChange(current: number, previous: number): number | null    // null if no previous data
formatInrPv(amount: number): string                            // ₹ en-IN integer
```

**Tests (≥ 6):**
- `ProviderEarningsV2` renders null when v2 is off
- Renders `data-testid="provider-earnings-v2"` when v2 is on
- Shows ₹0 gross when transactions is empty
- `formatInrPv(1234)` returns "₹1,234"
- `pctChange(120, 100)` returns 20
- `pctChange(100, 0)` returns null
- `buildEarningsSparkline` returns array of length 6

---

## Slice 16.27 — `/provider/patients` + `/provider/patients/[id]`

**Goal:** Add v2 chrome to the patient roster list and patient detail page, with visit-history Sparkline and vitals chips per patient card.

**Files to create:**
- `src/app/provider/patients/ProviderPatientRosterV2.tsx`
- `src/app/provider/patients/roster-v2-utils.ts`
- `src/app/provider/patients/roster-v2.test.tsx`
- `src/app/provider/patients/[id]/ProviderPatientDetailV2.tsx`

**Files to edit:**
- `src/app/provider/patients/page.tsx` — import + render `<ProviderPatientRosterV2 patients={data?.patients ?? []} />` before v1 JSX
- `src/app/provider/patients/[id]/page.tsx` — import + render `<ProviderPatientDetailV2 patient={...} />` before v1 JSX

**`ProviderPatientRosterV2` spec:**
```
Props: { patients: PatientRosterRow[] }
  PatientRosterRow is already defined in src/lib/clinical/types.ts — import from there.

Self-gates via useUiV2(). Returns null in v1.

Renders:
  1. Page header:
     - Kicker: "PATIENT REGISTRY"
     - Title: "Your Patients"
     - Total count Badge (role="provider", variant="soft", tone=1): "{n} patients"

  2. Patient card list (one card per patient):
     - Initials avatar (2 chars, pv-tile-2-bg circle)
     - Patient full_name (bold)
     - Phone in "+91 XXXXX XXXXX" format (see formatPhone in the existing page.tsx)
     - Last-visit date chip (CalendarDays icon + formatted date, or "No visits yet")
     - Visit count Badge (role="provider", variant="soft"): "{n} visits"
     - Sparkline (role="provider", 6 data points = monthly visit counts, width=64 height=24)
     - "View profile →" Link to /provider/patients/{patient.id}

data-testid="provider-patient-roster-v2"
Each card: data-testid="patient-card-{patient.id}"
```

**`roster-v2-utils.ts`** — pure functions:
```ts
buildPatientVisitSparkline(patient: PatientRosterRow, nowMs?: number): number[]
// Returns array of 6 monthly visit counts, oldest → newest
// Uses patient.records array (array of {visit_date: string})
// IST-aware month bucketing

formatPhonePv(phone: string | null): string
// "+91 XXXXX XXXXX" format or "—"

patientInitials(fullName: string): string
// First char of first word + first char of last word, uppercase
```

**`ProviderPatientDetailV2` spec:**
```
Props: { patient: PatientRosterRow }
Self-gates via useUiV2(). Returns null in v1.

Renders above existing v1 detail:
  - Large avatar + name header with role Badge: "Patient"
  - Phone pill (read-only, same as PatientProfileV2 ReadOnlyPill pattern)
  - Visit frequency Sparkline card (same as PatientRecordsSummaryV2's sparkline card)
  - "Quick note" textarea: label="Add clinical note", placeholder="Record observations..."
    (UI-only — onClick/onChange are wired but no API call required)

data-testid="provider-patient-detail-v2"
```

**Tests (≥ 6):**
- `ProviderPatientRosterV2` renders null when v2 is off
- Renders `data-testid="provider-patient-roster-v2"` when v2 is on
- Shows patient count Badge with correct number
- `patientInitials("Raj Kumar")` returns "RK"
- `patientInitials("Priya")` returns "P"
- `formatPhonePv(null)` returns "—"
- `formatPhonePv("9198765432100")` handles E.164 format gracefully
- `buildPatientVisitSparkline` returns array of length 6

---

## Execution Order

Do these slices in this order — each is independent but the provider slices (16.24–16.27) share the same CSS token namespace so do them in sequence:

1. **16.21** (pai + motio) — simplest, pure chrome, no data needed
2. **16.22** (patient search) — pure UI filter rail, no API changes
3. **16.24** (provider appointments) — mirrors 16.16, reference that for the day-grouping logic
4. **16.25** (calendar + availability) — pure chrome headers, no data
5. **16.26** (provider earnings) — mirrors 16.17, reference that for grouping + Sparkline
6. **16.27** (provider patients) — mirrors 16.18 (records), reference that for Sparkline pattern

## After Each Slice

1. Run `npm run build` — must be zero TypeScript errors
2. Run `npm test -- --reporter=verbose src/app/[path]/` to confirm tests pass
3. Commit: `git commit -m "feat(ui-v2): slice 16.XX — [short title]"`
4. Update CHANGELOG.md with the standard entry block

## Reference Files (read these before writing each slice)

| Slice | Reference component to read first |
|-------|----------------------------------|
| 16.21 | `src/app/patient/pai/page.tsx`, `src/app/patient/motio/page.tsx` |
| 16.22 | `src/app/patient/search/page.tsx` |
| 16.24 | `src/app/patient/appointments/PatientAppointmentsTimeline.tsx`, `src/app/patient/appointments/appointments-utils.ts` |
| 16.25 | `src/app/provider/calendar/page.tsx`, `src/app/provider/availability/page.tsx` |
| 16.26 | `src/app/patient/payments/PatientPaymentsLedger.tsx`, `src/app/patient/payments/payments-utils.ts` |
| 16.27 | `src/app/patient/records/PatientRecordsSummaryV2.tsx`, `src/app/patient/records/records-utils.ts`, `src/lib/clinical/types.ts` |
