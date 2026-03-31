# Razorpay Payment Integration Fixes

**Date:** 2026-03-31
**Status:** Approved
**Scope:** Fix 6 bugs/gaps preventing Razorpay from working in production

---

## Problem

The Razorpay integration is fully coded (API routes, client library, checkout UI) but has 6 issues that would cause failures in production:

1. **RLS blocks payment writes** — `create-order` and `verify` routes use the authenticated Supabase client to INSERT/UPDATE `payments`, but only a SELECT policy exists. All writes will silently fail.
2. **Missing `updated_at` column** — `verify` route writes `updated_at` to `payments` but the column doesn't exist. Silently dropped.
3. **No index on `payments.appointment_id`** — queried in all 4 payment routes; will cause full table scans.
4. **GST hidden from user** — API charges base fee + 18% GST, but the UI only shows the base fee. User sees ₹800, gets charged ₹944.
5. **Unused type contract** — `RazorpayCheckoutConfig` defined in contracts but StepPayment uses `Record<string, unknown>`.
6. **Receipt download stub** — "Digital Receipt" button in StepSuccess has no click handler.

---

## Approach: Option A — `supabaseAdmin` for server-side payment writes

The `create-order` and `verify` routes are server-side, already auth-guarded (check `user` exists + verify appointment ownership). Using `supabaseAdmin` bypasses RLS for writes — same pattern the webhook route already uses. No new RLS policies needed.

---

## Fix Details

### Fix 1: RLS — Switch to `supabaseAdmin`

**Files:** `src/app/api/payments/create-order/route.ts`, `src/app/api/payments/verify/route.ts`

- Import `supabaseAdmin` from `@/lib/supabase/admin`
- Keep the authenticated `supabase` client for reading appointments (respects RLS ownership check)
- Use `supabaseAdmin` only for `payments` table INSERT/UPDATE operations
- The `verify` route also updates `appointments` and `availabilities` — switch those to `supabaseAdmin` too (the webhook already does this for the same operations)

### Fix 2: Migration — `updated_at` + index

**File:** `supabase/migrations/004_payments_updated_at_index.sql`

```sql
ALTER TABLE payments ADD COLUMN updated_at timestamptz;
CREATE INDEX idx_payments_appointment_id ON payments (appointment_id);
```

### Fix 3: GST display in UI

**Files:** `src/app/book/[id]/StepPayment.tsx`, `src/app/book/[id]/StepSuccess.tsx`

StepPayment:
- Calculate GST (18%) and total in the component
- Show breakdown: Base Fee ₹X + GST (18%) ₹Y = Total ₹Z
- Update the Pay button amount to show the total including GST
- Pass `totalPaid` as fee + GST to `onSuccess`

StepSuccess:
- Accept `gstAmount` prop (or derive from `totalPaid`)
- Show breakdown in the receipt: Consultation Fee, GST @ 18%, Total

### Fix 4: Type cleanup

**File:** `src/app/book/[id]/StepPayment.tsx`

- Import `RazorpayCheckoutConfig` from `@/app/api/contracts/payment`
- Use it to type the options object passed to `window.Razorpay`
- Update the `Window.Razorpay` declaration to use the proper type

### Fix 5: Receipt download

**File:** `src/app/book/[id]/StepSuccess.tsx`

- Generate a text-based receipt as a downloadable file (simple HTML → blob approach)
- Include: ref number, doctor name, date, time, visit type, payment method, base fee, GST, total
- Wire the "Digital Receipt" button's `onClick` to trigger the download

### Fix 6: Zod schema for verify endpoint

**Files:** `src/lib/validations/payment.ts`, `src/app/api/payments/verify/route.ts`

- Add `verifyPaymentSchema` to validations: `{ razorpay_order_id, razorpay_payment_id, razorpay_signature, appointment_id }` — all `z.string().min(1)`
- Use it in the verify route instead of manual presence checks

---

## Implementation Order

1. Fix 2 (migration) — foundation, no code depends on it yet
2. Fix 6 (Zod schema) — independent, small
3. Fix 1 (supabaseAdmin) — critical production fix
4. Fix 3 (GST display) — UI, depends on understanding the total flow
5. Fix 4 (type cleanup) — cleanup during GST work
6. Fix 5 (receipt download) — standalone UI feature

---

## Testing

- Build must pass (`rtk npm run build`)
- Verify routes compile with `supabaseAdmin` imports
- Manual: Razorpay test mode checkout should complete without RLS errors
