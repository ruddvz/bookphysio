# bookphysio.in — Features & Acceptance Criteria

> Single source of truth for acceptance criteria. Each entry maps to an EXECUTION-PLAN.md phase step.
> **Status:** `[ ]` pending · `[>]` in progress · `[x]` done
> **Tests:** `[ ]` pending · `[x]` passing
> FEATURES.md Tests field is authoritative. ACTIVE.md `tests:` line is a convenience mirror.

---

## Phase 8 — UI Polish

---

## 8.7 Patient Dashboard Polish

**Route / Component:** `app/(patient)/dashboard`
**Phase:** 8.7
**Status:** [x] done
**Tests:** [x] passing

### Acceptance Criteria
- [x] Upcoming appointment card is visible at top of dashboard with doctor name, date, time, and visit type
- [x] Quick actions section shows at minimum: Book New Appointment, View All Appointments
- [x] Past appointments section shows the most recent 3 past appointments
- [x] All dates formatted as `DD MMM YYYY` (e.g. 15 Apr 2026) — no ISO strings visible to user
- [x] Currency displayed as `₹X` (INR, integer, no paise)
- [x] Page renders without errors when appointment list is empty (empty state shown)
- [x] Page renders without errors when API is slow (loading skeleton shown)

### Edge Cases
- Empty state: "You have no upcoming appointments" prompt with Book CTA
- Error state: "Could not load appointments" with Retry button
- Loading state: skeleton cards shown while fetching

### Dependencies
- Requires: mock data shape compatible with `/api/appointments` contract (`src/app/api/contracts/`)

---

## 8.8 Patient Appointments Polish

**Route / Component:** `app/(patient)/appointments`, `app/(patient)/appointments/[id]`
**Phase:** 8.8
**Status:** [x] done
**Tests:** [x] passing

### Acceptance Criteria
- [x] Appointments page has two tabs: "Upcoming" and "Past"
- [x] Active tab is highlighted with teal underline
- [x] Switching tabs filters the list without page reload
- [x] Each appointment card shows: doctor name, specialty, date/time, visit type badge, status badge
- [x] Clicking a card navigates to the appointment detail page
- [x] Detail page shows: full doctor info, appointment slot, visit address (if in-clinic), join link placeholder (if online), cancellation option

### Edge Cases
- Empty Upcoming tab: "No upcoming appointments" + Book CTA
- Empty Past tab: "No past appointments"
- Cancelled appointment: status badge shows "Cancelled" in grey

### Dependencies
- Requires: `StatusBadge`, `VisitTypeBadge` shared components (already built)

---

## 8.9 Provider Dashboard Polish

**Route / Component:** `app/(provider)/dashboard`
**Phase:** 8.9
**Status:** [x] done
**Tests:** [x] passing

### Acceptance Criteria
- [x] Today's summary stats visible: appointments today (count), next appointment time, total patients this week
- [x] Schedule timeline shows today's appointments in chronological order
- [x] Each timeline slot shows: patient name, time, visit type badge
- [x] Stats display formatted values (not raw API numbers) — e.g. "3 appointments" not `3`

### Edge Cases
- No appointments today: "No appointments today" with empty timeline
- Loading: skeleton for stats + timeline

### Dependencies
- Requires: mock data shape compatible with `/api/appointments` contract

---

## 8.10 Provider Calendar Polish

**Route / Component:** `app/(provider)/calendar`
**Phase:** 8.10
**Status:** [ ] pending
**Tests:** [ ] pending

### Acceptance Criteria
- [ ] 7-day grid rendered with days as columns, time slots as rows
- [ ] Each slot visually distinguishes: booked (teal), available (white/light), blocked (grey)
- [ ] Booked slot shows patient name (truncated if needed)
- [ ] Current day column is highlighted
- [ ] Navigation to previous/next week works

### Edge Cases
- No slots: all slots show as available
- Fully booked day: all slots teal

### Dependencies
- Requires: mock availability + appointment data

---

## 8.11 Provider Availability Polish

**Route / Component:** `app/(provider)/availability`
**Phase:** 8.11
**Status:** [ ] pending
**Tests:** [ ] pending

### Acceptance Criteria
- [ ] Weekday toggles (Mon–Sun) enable/disable working days
- [ ] Working hours grid shows start/end time per enabled day
- [ ] Start time must be before end time — inline validation error shown if not
- [ ] Save button is disabled until a change is made
- [ ] Success toast shown on save

### Edge Cases
- All days disabled: valid state (provider takes a break)
- Start = End time: inline error "End time must be after start time"

### Dependencies
- None — UI-only in Phase 8; wired to API in Phase 9

---

## 8.12 Provider Earnings Polish

**Route / Component:** `app/(provider)/earnings`
**Phase:** 8.12
**Status:** [ ] pending
**Tests:** [ ] pending

### Acceptance Criteria
- [ ] Monthly summary shows: total earnings (₹), total sessions, average per session (₹)
- [ ] All amounts displayed as `₹X` (INR integer, no paise, no decimals)
- [ ] Transaction list shows individual bookings: patient, date, amount, status
- [ ] Chart placeholder visible (no real chart in Phase 8 — placeholder with "Coming soon" label is acceptable)

### Edge Cases
- No earnings: ₹0 summary + "No transactions yet"

### Dependencies
- Requires: mock earnings data

---

## 8.13 Admin Dashboard Polish

**Route / Component:** `app/(admin)`
**Phase:** 8.13
**Status:** [ ] pending
**Tests:** [ ] pending

### Acceptance Criteria
- [ ] Platform overview stats visible: total providers, total patients, total bookings, revenue (₹)
- [ ] All stats display formatted values — not raw numbers
- [ ] Stats cards have labels and icons

### Edge Cases
- Zero stats: all cards show `0` (not blank/undefined)

### Dependencies
- Requires: mock admin stats data

---

## 8.14 Specialty / City Landing Pages Polish

**Route / Component:** `app/specialty/[slug]`, `app/city/[slug]`
**Phase:** 8.14
**Status:** [ ] pending
**Tests:** [ ] pending

### Acceptance Criteria
- [ ] Hero section shows specialty/city name and a one-liner description
- [ ] Filtered doctor grid shows DoctorCards for that specialty or city
- [ ] `<title>` tag reflects the specialty/city (e.g. "Physiotherapists in Mumbai | bookphysio.in")
- [ ] Meta description set per page
- [ ] `generateMetadata()` returns correct `title` and `description` for any valid slug

### Edge Cases
- Invalid slug: 404 page rendered
- No doctors for that slug: "No providers found" with search CTA

### Dependencies
- Requires: `DoctorCard` shared component (already built); mock data for slug filtering

---

## 8.15 Static Pages Polish

**Routes:** `/about`, `/faq`, `/how-it-works`, `/privacy`, `/terms`
**Phase:** 8.15
**Status:** [ ] pending
**Tests:** [ ] pending

### Acceptance Criteria
- [ ] All five routes load without JS errors
- [ ] Each page has a visible heading and body content
- [ ] Footer and Navbar render correctly on all five pages
- [ ] Privacy and Terms pages are linked from the footer

### Edge Cases
- N/A — static content pages

### Dependencies
- None

---

## 8.16 Global Mobile Responsiveness Pass

**Scope:** All pages at 375px viewport
**Phase:** 8.16
**Status:** [ ] pending
**Tests:** [ ] pending

> **Dependency:** USER_FLOWS.md must be complete before test work for this step begins (tests reference flows 1, 2, 6).

### Acceptance Criteria
- [ ] Booking flow (Flow 1): all 3 wizard steps render without horizontal scroll at 375px
- [ ] OTP login (Flow 2): form inputs and OTP boxes are full-width and tappable at 375px
- [ ] Patient dashboard (Flow 6): cards stack vertically, no content clipped at 375px
- [ ] Navigation/Navbar collapses to mobile menu at 375px
- [ ] No fixed-width elements wider than viewport

### Edge Cases
- Landscape orientation at 375px: verify no breakage on key screens

### Dependencies
- Requires: USER_FLOWS.md complete (flows 1, 2, 6 reference)

---

## 8.17 Global Empty States and Loading Skeletons

**Scope:** All dashboard and list pages
**Phase:** 8.17
**Status:** [ ] pending
**Tests:** [ ] pending

### Acceptance Criteria
- [ ] Patient dashboard: skeleton shown while loading, empty state shown when no appointments
- [ ] Patient appointments list: skeleton while loading, empty state per tab
- [ ] Provider dashboard: skeleton while loading, empty state for no-appointments day
- [ ] Provider calendar: skeleton while loading
- [ ] Skeleton components render without any data prop passed
- [ ] Empty states have a descriptive message and a relevant CTA

### Edge Cases
- Slow API (>3s): skeleton persists until data arrives, no blank flash

### Dependencies
- None — UI-only

---

## Phase 9 — Real API Wiring

---

## 9.1 Auth — MSG91 OTP

**Route / Component:** `app/(auth)/verify-otp`, `app/api/auth/otp/send`, `app/api/auth/otp/verify`
**Phase:** 9.1
**Status:** [ ] pending
**Tests:** [ ] pending

### Acceptance Criteria
- [ ] OTP send API calls MSG91 (not a stub) with valid +91 E.164 number
- [ ] OTP verify API validates the code against MSG91 response
- [ ] On success: Supabase session created, user redirected to dashboard
- [ ] On failure (wrong code): inline error "Incorrect OTP. Try again."
- [ ] On expired code: inline error "OTP expired. Resend OTP."
- [ ] Rate limiting (Upstash) enforced on `/api/auth/otp/send` — max 3 sends per phone per 10 minutes
- [ ] Phone number validated as E.164 (+91XXXXXXXXXX) via Zod before API call

### Edge Cases
- MSG91 API unavailable: "OTP service unavailable. Please try again shortly."
- User enters OTP after session expiry: re-prompt login

### Dependencies
- Requires: MSG91 DLT template approved and sender ID registered

---

## 9.2 Search — Live Supabase Providers

**Route / Component:** `app/search`, `app/api/providers`
**Phase:** 9.2
**Status:** [ ] pending
**Tests:** [ ] pending

### Acceptance Criteria
- [ ] Search results fetched from `/api/providers` with Supabase query (not mock data)
- [ ] Filters (specialty, city, visit type, date) passed as query params and applied in Supabase query
- [ ] Results update when filters change (no full page reload)
- [ ] Zero results: "No providers found" empty state
- [ ] Supabase RLS enforced — only approved providers returned

### Edge Cases
- Supabase unavailable: "Search unavailable. Please try again."
- Very long result set (>100): pagination or "Load more" required

### Dependencies
- Requires: Supabase seed data with approved providers

---

## 9.3 Doctor Profile — Live Provider API

**Route / Component:** `app/doctor/[id]`, `app/api/providers/[id]`
**Phase:** 9.3
**Status:** [ ] pending
**Tests:** [ ] pending

### Acceptance Criteria
- [ ] Profile data fetched from `/api/providers/[id]` (not mock)
- [ ] Available slots fetched from `/api/providers/[id]/availability`
- [ ] Reviews fetched from `/api/providers/[id]/reviews`
- [ ] Invalid `id`: 404 page shown
- [ ] Unapproved provider `id`: 404 page shown (RLS enforced)

### Edge Cases
- Provider with no reviews: "No reviews yet"
- Provider with no available slots: "No slots available — contact provider"

### Dependencies
- Requires: 9.2 (providers API live)

---

## 9.4 Booking Wizard — Appointments API + Razorpay

**Route / Component:** `app/book/[id]`, `app/api/appointments`, `app/api/payments/create-order`, `app/api/payments/webhook`
**Phase:** 9.4
**Status:** [ ] pending
**Tests:** [ ] pending

### Acceptance Criteria
- [ ] Step 1 (Confirm): appointment created via `POST /api/appointments` on confirm
- [ ] Step 2 (Payment): Razorpay order created via `POST /api/payments/create-order`; Razorpay checkout opened with real order ID
- [ ] On payment success: Razorpay webhook received at `/api/payments/webhook`; appointment status updated to `confirmed`
- [ ] On payment failure: error shown "Payment failed. Try again."; appointment status remains `pending`
- [ ] Slot race condition (Flow 4): if slot taken between confirm and pay, show "This slot was just booked. Please select another." and return user to slot picker
- [ ] GST (18%) computed server-side only — never client-side; stored in `payments.gst_amount_inr`
- [ ] UPI ID validated before Pay button enabled (already done in 8.6 — verify still works with real flow)

### Edge Cases
- Razorpay API unavailable: "Payment service unavailable. Your booking is saved — complete payment from your dashboard."
- Webhook duplicate delivery: idempotent handler (no double-confirm)

### Dependencies
- Requires: Razorpay live mode keys in `.env`; 9.3 (doctor profile live)

---

## 9.5 Patient Dashboard — Real Session + Appointments

**Route / Component:** `app/(patient)/dashboard`, `app/(patient)/appointments`
**Phase:** 9.5
**Status:** [ ] pending
**Tests:** [ ] pending

### Acceptance Criteria
- [ ] Dashboard and appointments fetched for the authenticated patient session (not mock)
- [ ] Unauthenticated access redirects to `/login`
- [ ] Appointment cancellation calls `DELETE /api/appointments/[id]` and removes the item from the list

### Edge Cases
- Session expired mid-visit: redirect to `/login` with "Session expired" message

### Dependencies
- Requires: 9.4 (appointments created via real API)

---

## 9.6 Provider Portal — Real Session + Appointments

**Route / Component:** `app/(provider)/dashboard`, `app/(provider)/appointments`, `app/(provider)/calendar`
**Phase:** 9.6
**Status:** [ ] pending
**Tests:** [ ] pending

### Acceptance Criteria
- [ ] Provider dashboard, appointments, and calendar fetched for authenticated provider session
- [ ] Unauthenticated access redirects to `/login`
- [ ] Availability settings saved via `PUT /api/providers/[id]/availability`

### Edge Cases
- Provider tries to access another provider's data: 403 Forbidden (RLS enforced)

### Dependencies
- Requires: 9.5 (session wiring pattern established)

---

## 9.7 Admin Panel — Real Admin API

**Route / Component:** `app/(admin)`, `app/api/admin/users`, `app/api/admin/listings`
**Phase:** 9.7
**Status:** [ ] pending
**Tests:** [ ] pending

### Acceptance Criteria
- [ ] Admin dashboard stats fetched from real Supabase queries
- [ ] Provider approval queue populated from `/api/admin/listings`
- [ ] Approve/Reject action updates provider status in Supabase
- [ ] User management list populated from `/api/admin/users`
- [ ] Non-admin users accessing `/admin/*` routes: redirect to home (middleware enforced)

### Edge Cases
- Admin approves already-approved provider: idempotent (no error, no change)

### Dependencies
- Requires: Supabase admin role configured; service role key server-side only
