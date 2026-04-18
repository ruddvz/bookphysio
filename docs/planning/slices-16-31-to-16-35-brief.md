# Phase 16 Slices 16.31–16.35 — Execution Brief

> Hand this document to an AI agent (e.g. Composer) to implement all five slices.

---

## Repo context

- **Framework:** Next.js 16 App Router, TypeScript strict, Tailwind v4
- **Flag gate:** every slice is additive behind `useUiV2()` (`src/hooks/useUiV2.ts`). v1 JSX must stay byte-identical when the flag is off.
- **Primitives** (import from `@/components/dashboard/primitives`): `Badge`, `Sparkline`, `TrendDelta`, `Shimmer`, `Breadcrumbs`, `PageHeader`, `SectionCard`, `StatTile`, `ListRow`, `EmptyState`
- **`Badge` variants:** `solid | soft | outline | success | warning | danger`; accepts `role="admin"|"provider"|"patient"` and `tone={1..6}`
- **Design tokens:** admin → `--color-ad-*` · provider → `--color-pv-*` · patient → `--color-pt-*`
- **Currency:** integer `₹` only — never paise, never `$`
- **Phone:** `+91` prefix always shown
- **Tests:** ≥ 6 Vitest unit tests per slice in a co-located `*.test.tsx` file
- **Build gate:** `npm run build` must exit 0 with zero TypeScript errors before each commit

---

## 16.31 — `/provider/bills/new` — v2 invoice builder

**File to edit:** `src/app/provider/bills/new/page.tsx`

**Steps:**

1. Create `src/app/provider/bills/new/BillsV2.tsx` with two exported components:

   - `GstLineItemChips({ subtotal: number, includeGst: boolean })` — renders a flex row of `Badge` chips (all `role="provider"`):
     - Subtotal chip: `variant="soft" tone={1}` — label `Subtotal ₹{subtotal}`
     - When `includeGst` true: GST chip `variant="warning"` — label `GST 18% +₹{gst}` and Total chip `variant="success"` — label `Total ₹{total}`
     - When `includeGst` false: single chip `variant="soft" tone={3}` — label `GST waived`
     - Always: `variant="outline"` chip — label `GSTIN compliant`
     - All amounts are integer `₹` via `.toLocaleString('en-IN')`

   - `BillV2Sidebar({ invoiceNumber: string, patientName: string })` — context card (`data-testid="bill-v2-sidebar"`) containing:
     - Label: `Billing Trend · Last 7 sessions`
     - `<Sparkline role="provider" values={[400,550,620,480,700,820,760]} width={220} height={36} />`
     - Two key–value rows: Invoice number and Patient name

2. In `page.tsx`, import `useUiV2` and both components. Inside `NewBillForm`, when `uiV2` is true:
   - After the line-items `SectionCard`, render `<GstLineItemChips subtotal={totals.subtotal} includeGst={includeGst} />`
   - In the right column, render `<BillV2Sidebar invoiceNumber={invoiceNumber} patientName={patientName} />` above the "Additional Context" card

3. Create `src/app/provider/bills/new/bills-v2.test.tsx` with ≥ 6 tests:
   - GST chips render when `includeGst=true`
   - GST waived chip renders when `includeGst=false`
   - Subtotal chip shows correct `₹` amount
   - Total chip shows `subtotal + GST`
   - Sidebar renders invoice number
   - Sidebar renders patient name

**Commit:** `feat(ui-v2): slice 16.31 — /provider/bills/new v2 GST chips + billing sidebar`

---

## 16.32 — `/provider/pending` — v2 onboarding stepper

**File to edit:** `src/app/provider/pending/page.tsx`

**Steps:**

1. Create `src/app/provider/pending/PendingV2.tsx` exporting `PendingStepperV2`.

   Render a vertical stepper (4 steps), each row: left icon + title + description + right `Badge`. Steps are connected by a thin vertical line (`border-l-2` on a wrapper `div`).

   | Step | Title | Description | Badge variant | Badge label |
   |---|---|---|---|---|
   | 1 | Account created | Registration complete | `success` | Done |
   | 2 | Email confirmed | Identity verified | `success` | Done |
   | 3 | Credentials review | Under team review | `warning` | Pending |
   | 4 | Dashboard access | Available after approval | `soft tone={3}` | Locked |

   All badges: `role="provider"`.

2. In `page.tsx`, import `useUiV2` and `PendingStepperV2`. When `uiV2` is true, replace the existing step-list `<div className="space-y-3 ...">` block with `<PendingStepperV2 />`. The sign-out button must always render regardless of the flag.

3. Create `src/app/provider/pending/pending-v2.test.tsx` with ≥ 6 tests:
   - v2 renders `PendingStepperV2` when flag on
   - v1 does not render `PendingStepperV2` when flag off
   - "Done" badge present twice
   - "Pending" badge present
   - "Locked" badge present
   - Sign-out button always renders

**Commit:** `feat(ui-v2): slice 16.32 — /provider/pending v2 onboarding stepper with Badge states`

---

## 16.33 — `/admin/listings` — v2 approval queue

**File to edit:** `src/app/admin/listings/page.tsx`

**Steps:**

1. Create `src/app/admin/listings/ListingsV2.tsx` exporting:

   - `ApprovalStatusBadge({ status: 'pending' | 'approved' | 'rejected' })` — `Badge role="admin"`:
     - `pending` → `variant="warning"` label `Pending`
     - `approved` → `variant="success"` label `Approved`
     - `rejected` → `variant="danger"` label `Rejected`

   - `SlaSparkline({ values?: readonly number[] })` — wraps `<Sparkline role="admin" width={72} height={24}>` with label `Review SLA (days)`. Default values: `[5,4,6,3,4,2,3]`.

2. In `page.tsx`, import `useUiV2`. When `uiV2` is true:
   - Replace the inline `<span className="...">` approval status chip in the provider row with `<ApprovalStatusBadge status={provider.approval_status} />`
   - In the third `StatTile` slot (currently shows static "Listing"), add `<SlaSparkline />` below the tile label

3. Create `src/app/admin/listings/listings-v2.test.tsx` with ≥ 6 tests:
   - `pending` → warning Badge
   - `approved` → success Badge
   - `rejected` → danger Badge
   - `SlaSparkline` renders an `<svg>`
   - `SlaSparkline` uses default values when none passed
   - Flag-off: inline `<span>` still present (no `ApprovalStatusBadge`)

**Commit:** `feat(ui-v2): slice 16.33 — /admin/listings v2 ApprovalStatusBadge + SLA sparkline`

---

## 16.34 — `/admin/users` — v2 user directory

**File to edit:** `src/app/admin/users/page.tsx`

**Steps:**

1. Create `src/app/admin/users/UsersV2.tsx` exporting:

   - `RoleBadge({ role: 'Patient' | 'Provider' | 'Suspended' })` — `Badge role="admin"`:
     - `Patient` → `variant="soft" tone={1}`
     - `Provider` → `variant="success"`
     - `Suspended` → `variant="danger"`

   - `LastActiveDelta({ label: string })` — renders `<TrendDelta>` with a demo value derived from the label:
     - label contains `"min"` → `value={5}` (positive)
     - label contains `"hour"` → `value={2}` (positive)
     - label contains `"day"` → `value={-10}` (negative)
     - fallback → `value={0}`

2. In `page.tsx`, import `useUiV2`. When `uiV2` is true, in the `ListRow` `right` slot:
   - Add `<RoleBadge role={currentRow.role as 'Patient'|'Provider'|'Suspended'} />` beside the existing buttons
   - Add `<LastActiveDelta label={currentRow.lastActive} />` beside the last-active text

3. Create `src/app/admin/users/users-v2.test.tsx` with ≥ 6 tests:
   - `Patient` → soft Badge
   - `Provider` → success Badge
   - `Suspended` → danger Badge
   - `LastActiveDelta` positive for label containing "min"
   - `LastActiveDelta` negative for label containing "day"
   - Flag-off: no `RoleBadge` in DOM

**Commit:** `feat(ui-v2): slice 16.34 — /admin/users v2 RoleBadge + LastActiveDelta`

---

## 16.35 — `/admin/analytics` — v2 AdminPulseRail

**File to edit:** `src/app/admin/analytics/page.tsx`

> Do **not** install Recharts. Full chart integration is deferred to slice 16.38.
> This slice only wires the existing `AdminPulseRail` component.

**Steps:**

1. In `page.tsx`, add imports:
   ```ts
   import { useUiV2 } from '@/hooks/useUiV2'
   import { AdminPulseRail } from '@/components/admin/AdminPulseRail'
   ```

2. Inside `AdminAnalytics`, call `const uiV2 = useUiV2()`. When `uiV2` is true, render at the top of the returned JSX (above the header `<div>`):
   ```tsx
   <AdminPulseRail
     activeProviders={data?.kpis.totalProviders ?? 0}
     pendingApprovals={0}
     totalPatients={data?.kpis.activePatients ?? 0}
     gmvMtd={data?.kpis.totalGmv ?? 0}
     reviewHref="/admin/listings"
   />
   ```

3. Create `src/app/admin/analytics/analytics-v2.test.tsx` with ≥ 6 tests:
   - `AdminPulseRail` renders when flag on (`data-testid="admin-pulse-rail"` present)
   - `AdminPulseRail` absent when flag off
   - `activeProviders` receives `kpis.totalProviders`
   - `totalPatients` receives `kpis.activePatients`
   - `gmvMtd` receives `kpis.totalGmv`
   - `reviewHref` is `"/admin/listings"`

**Commit:** `feat(ui-v2): slice 16.35 — /admin/analytics v2 AdminPulseRail wired at top of page`

---

## Final verification (after all 5 commits)

```bash
npm run build   # must exit 0, zero TS errors
npm test        # full suite must be green
git push -u origin cursor/slices-16-31-to-16-35-c346
```
