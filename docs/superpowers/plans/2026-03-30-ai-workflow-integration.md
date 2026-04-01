# AI Workflow Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create `docs/FEATURES.md` and `docs/USER_FLOWS.md`, update `ACTIVE.md` and `EXECUTION-PLAN.md` to embed a test-as-you-go discipline from Phase 8.7 onwards.

**Architecture:** Three markdown documents are created (FEATURES.md, USER_FLOWS.md) or updated (ACTIVE.md, EXECUTION-PLAN.md). No code changes. Tasks 1–3 are independent and can run in any order or in parallel. Tasks 4–5 depend on Tasks 1–3 being complete.

**Tech Stack:** Markdown, bookphysio.in (Next.js 15, Supabase, Razorpay, MSG91, Vitest, Playwright). Ref: `docs/planning/EXECUTION-PLAN.md`, `docs/superpowers/specs/2026-03-29-ai-workflow-integration-design.md`.

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Create | `docs/FEATURES.md` | Acceptance criteria for Phase 8.7–8.17 and Phase 9 steps |
| Create | `docs/USER_FLOWS.md` | 13 step-by-step user flows with error paths and edge cases |
| Modify | `docs/planning/ACTIVE.md` | Add `tests: [ ]` field to each remaining Phase 8 step |
| Modify | `docs/planning/EXECUTION-PLAN.md` | Update Phase 10 description; note incremental testing approach |

---

## Task 1: Write docs/FEATURES.md

**Files:**
- Create: `docs/FEATURES.md`

**Source:** Phase 8.7–8.17 steps from `docs/planning/EXECUTION-PLAN.md`. Phase 9 steps from the same file. Spec: `docs/superpowers/specs/2026-03-29-ai-workflow-integration-design.md` Section 1.

- [ ] **Step 1.1: Create docs/FEATURES.md with header and Phase 8 entries**

Create the file with the following content:

```markdown
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
**Status:** [ ] pending
**Tests:** [ ] pending

### Acceptance Criteria
- [ ] Upcoming appointment card is visible at top of dashboard with doctor name, date, time, and visit type
- [ ] Quick actions section shows at minimum: Book New Appointment, View All Appointments
- [ ] Past appointments section shows the most recent 3 past appointments
- [ ] All dates formatted as `DD MMM YYYY` (e.g. 15 Apr 2026) — no ISO strings visible to user
- [ ] Currency displayed as `₹X` (INR, integer, no paise)
- [ ] Page renders without errors when appointment list is empty (empty state shown)
- [ ] Page renders without errors when API is slow (loading skeleton shown)

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
**Status:** [ ] pending
**Tests:** [ ] pending

### Acceptance Criteria
- [ ] Appointments page has two tabs: "Upcoming" and "Past"
- [ ] Active tab is highlighted with teal underline
- [ ] Switching tabs filters the list without page reload
- [ ] Each appointment card shows: doctor name, specialty, date/time, visit type badge, status badge
- [ ] Clicking a card navigates to the appointment detail page
- [ ] Detail page shows: full doctor info, appointment slot, visit address (if in-clinic), join link placeholder (if online), cancellation option

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
**Status:** [ ] pending
**Tests:** [ ] pending

### Acceptance Criteria
- [ ] Today's summary stats visible: appointments today (count), next appointment time, total patients this week
- [ ] Schedule timeline shows today's appointments in chronological order
- [ ] Each timeline slot shows: patient name, time, visit type badge
- [ ] Stats display formatted values (not raw API numbers) — e.g. "3 appointments" not `3`

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
```

- [ ] **Step 1.2: Verify file looks correct**

```bash
wc -l docs/FEATURES.md
head -20 docs/FEATURES.md
```

Expected: file exists, starts with the header, ~300+ lines.

- [ ] **Step 1.3: Commit**

```bash
git add docs/FEATURES.md
git commit -m "docs: add FEATURES.md with acceptance criteria for Phase 8.7–8.17 and Phase 9"
```

---

## Task 2: Write docs/USER_FLOWS.md

**Files:**
- Create: `docs/USER_FLOWS.md`

**Source:** Spec Section 2. Existing high-level reference: `docs/research/PHYSIO_USER_JOURNEY.md`. Route reference: `docs/CODEMAPS/OVERVIEW.md`.

- [ ] **Step 2.1: Create docs/USER_FLOWS.md**

Create the file with the following content:

```markdown
# bookphysio.in — User Flows

> Step-by-step interaction flows for all critical paths. Primary reference for Phase 9 API wiring.
> Flows 1–6: Patient. Flows 7–11: Provider. Flows 12–13: Admin.
> Admin/provider E2E Playwright test coverage deferred to Phase 10.
> Phase 8.16 mobile tests reference flows 1, 2, 6 — complete this doc before starting 8.16 tests.

---

## Flow 1: Search → Book → Pay → Confirmation (Patient)

**Entry point:** Homepage (`app/page.tsx`) search bar or `/search`

**Happy path:**
1. Patient types condition/specialty + city in search bar → navigates to `/search?q=...&city=...`
2. `/search` renders DoctorCards with available slots → patient applies filters (visit type, date)
3. Patient clicks a time slot on a DoctorCard → navigates to `/doctor/[id]` with slot pre-selected
4. Patient reviews doctor profile → clicks "Book" on BookingCard → navigates to `/book/[id]`
5. Step 1 (Confirm): patient reviews appointment details (doctor, slot, visit type, price + GST) → clicks "Confirm"
6. Step 2 (Payment): patient enters UPI ID → UPI ID validated inline → "Pay ₹X" button enabled → patient clicks Pay
7. Razorpay checkout opens → patient completes payment
8. `/api/payments/webhook` receives success → appointment status → `confirmed`
9. Step 3 (Success): confirmation screen shown with appointment details + Add to Calendar button

**Error paths:**
- If zero search results: "No providers found for your search" + "Try different filters" CTA
- If slot taken between confirm and pay (race condition): "This slot was just booked. Please select another." → return to slot picker on doctor profile
- If Razorpay payment fails: "Payment failed. Your booking is saved — try again from your dashboard." → navigate to `/patient/appointments`
- If Razorpay API unavailable: "Payment service temporarily unavailable. Your booking is saved — complete payment from your dashboard."

**Edge cases:**
- Patient not logged in when clicking Book → redirect to `/login?redirect=/book/[id]` → after login, resume booking
- Very long doctor name: truncate in BookingCard, full name on confirmation screen
- Slot in past (clock drift): prevent booking, show "This slot is no longer available"

---

## Flow 2: OTP Login — New User

**Entry point:** `/login`

**Happy path:**
1. Patient enters mobile number (10 digits, +91 auto-prepended) → clicks "Send OTP"
2. `POST /api/auth/otp/send` called → MSG91 sends OTP SMS to number
3. OTP input screen shown (6 digits, auto-advance between boxes)
4. Patient enters OTP → `POST /api/auth/otp/verify` called
5. On success: Supabase session created → patient redirected to `/patient/dashboard` (or original redirect target)

**Error paths:**
- Wrong OTP: "Incorrect OTP. Please try again." (input cleared, focus on first box)
- Expired OTP (>10 min): "OTP expired. Tap 'Resend OTP'." → resend triggers new MSG91 send
- Rate limit hit (>3 sends in 10 min): "Too many OTP requests. Please wait 10 minutes."
- MSG91 unavailable: "OTP service unavailable. Please try again shortly."
- Invalid phone number (not 10 digits): inline Zod error before API call

**Edge cases:**
- Returning user with existing Supabase account: same flow — Supabase upserts session
- User pastes 6-digit OTP from SMS: auto-submit triggered (already implemented in 8.4)
- User navigates away mid-OTP: returns to `/login`, must re-request OTP

---

## Flow 3: OTP Login — Returning User

**Entry point:** `/login`

**Happy path:** Identical to Flow 2. Supabase recognises existing account, creates new session, redirects to dashboard.

**Error paths:** Same as Flow 2.

**Edge cases:**
- Returning user with expired session: full re-login via OTP (no password, no magic link — OTP only)

---

## Flow 4: Booking Failure Paths

**Entry point:** `/book/[id]` Step 2 (Payment)

**Slot race condition:**
1. Patient is on Step 2 (Payment) — slot was available when Step 1 confirmed
2. Another patient books the same slot while Step 2 is open
3. Patient clicks Pay → `POST /api/payments/create-order` checks slot availability before creating Razorpay order
4. If slot taken: return `409 Conflict` → UI shows "This slot was just booked. Please select another." → redirect to doctor profile slot picker

**Payment declined:**
1. Patient completes Razorpay checkout → card/UPI declined
2. Razorpay returns failure event → booking wizard stays on Step 2 → "Payment failed. Please try again or use a different payment method."
3. Retry: patient can attempt payment again without re-confirming Step 1

**Razorpay API unavailable:**
1. `POST /api/payments/create-order` fails with 5xx
2. UI shows "Payment service temporarily unavailable. Your slot is held for 10 minutes — complete payment from your dashboard."
3. Appointment remains in `pending` status; patient can retry from `/patient/appointments/[id]`

---

## Flow 5: Appointment Cancellation (Patient)

**Entry point:** `/patient/appointments/[id]`

**Happy path:**
1. Patient views appointment detail → clicks "Cancel Appointment"
2. Confirmation modal: "Are you sure you want to cancel? Cancellation policy: [policy text]"
3. Patient confirms → `DELETE /api/appointments/[id]` called
4. On success: appointment removed from list → "Appointment cancelled" toast
5. Patient redirected to `/patient/appointments` (Upcoming tab, now empty or updated)

**Error paths:**
- Appointment already started (< 1 hour before slot): "Cannot cancel within 1 hour of appointment time."
- API error: "Could not cancel. Please try again or contact support."

**Edge cases:**
- Patient cancels then re-books same slot: slot becomes available again after cancellation (Supabase trigger or API side effect)

---

## Flow 6: Patient Dashboard — View Appointments

**Entry point:** `/patient/dashboard`

**Happy path:**
1. Patient logs in → redirected to `/patient/dashboard`
2. Dashboard loads: upcoming appointment card (nearest slot), quick actions, past appointments (last 3)
3. Patient clicks "View All Appointments" → `/patient/appointments` (Upcoming tab)
4. Patient clicks appointment card → `/patient/appointments/[id]` (detail page)
5. Detail page shows: doctor info, slot, visit type, address/join link, cancellation option

**Error paths:**
- Session expired: redirect to `/login`
- API unavailable: "Could not load appointments" + Retry button

**Edge cases:**
- No upcoming appointments: empty state with "Book your first appointment" CTA
- No past appointments: past section hidden or shows empty state

---

## Flow 7: Doctor Signup — 5-Step Onboarding (Provider)

**Entry point:** `/doctor-signup`

**Happy path:**
1. Step 1 (Account): email + password → Supabase account created
2. Step 2 (Email confirm): confirmation email sent via Resend → provider clicks link
3. Step 3 (Identity): provider logs in with new credentials
4. Step 4 (Goals): 4-card interactive selection (New Patients / Insurance+Forms / Online Booking / Virtual Care) — multi-select
5. Step 5 (Profile): ICP registration number (required, Zod validated), name, specialty, city → profile saved
6. Provider redirected to `/provider/dashboard` (pending admin approval)

**Error paths:**
- ICP number missing on Step 5: inline error "ICP registration number is required"
- ICP number invalid format: inline error "Enter a valid ICP registration number"
- Email already registered: "An account with this email already exists. Log in instead."
- Resend email API unavailable: "Could not send confirmation email. Please check your email or contact support."

**Edge cases:**
- Provider refreshes mid-flow: progress lost (no persistent state between steps in Phase 8 — acceptable for MVP)
- Provider submits without selecting any goals (Step 4): allowed — goals are optional preference signals

---

## Flow 8: Provider Login

**Entry point:** `/login`

**Happy path:**
1. Provider enters email + password → Supabase authenticates
2. Supabase session created with `provider` role
3. Provider redirected to `/provider/dashboard`

**Error paths:**
- Wrong credentials: "Incorrect email or password."
- Account not confirmed: "Please confirm your email before logging in."
- Account pending admin approval: "Your account is under review. You'll be notified when approved."

**Edge cases:**
- Provider tries to access `/patient/` routes: middleware redirects to `/provider/dashboard`

---

## Flow 9: Provider Availability Setup

**Entry point:** `/provider/availability`

**Happy path:**
1. Provider views availability settings — weekday toggles + working hours grid
2. Provider enables Mon–Fri, sets hours 09:00–18:00 each day
3. Provider clicks Save → `PUT /api/providers/[id]/availability` called
4. Success toast: "Availability saved"
5. Calendar (`/provider/calendar`) now reflects the set hours as available slots

**Error paths:**
- End time before start time: inline error "End time must be after start time" (Save disabled)
- API error: "Could not save availability. Please try again."

**Edge cases:**
- Provider disables all days: valid state (on leave), all slots become blocked

---

## Flow 10: Provider Appointment Accept / Reject

**Entry point:** `/provider/appointments` or `/provider/dashboard` schedule timeline

**Happy path:**
1. New appointment appears in provider's queue (status: `pending`)
2. Provider clicks appointment → detail view with Accept / Reject buttons
3. Accept: `PATCH /api/appointments/[id]` → status `confirmed` → patient notified via Resend/MSG91
4. Reject: `PATCH /api/appointments/[id]` → status `cancelled` → patient notified

**Error paths:**
- Appointment already accepted by another session: "This appointment was already confirmed."
- API error: "Could not update appointment. Please try again."

**Edge cases:**
- Provider rejects and patient re-books: slot freed on reject, available for re-booking

---

## Flow 11: Provider Appointment Review (Provider)

**Entry point:** `/provider/appointments/[id]` (appointment with visit_type = `in_clinic` or `home_visit`)

**Happy path:**
1. Provider opens appointment detail for an `in_clinic` or `home_visit` appointment
2. Appointment summary, patient notes, and booking details are visible
3. Provider confirms arrival or readiness for the visit
4. Provider marks the appointment complete after the consultation
5. Follow-up notes are saved to the appointment record

**Error paths:**
- Appointment lookup fails: show retry state
- Provider not authorized: block access with a permission error
- Appointment already closed: show read-only state

**Edge cases:**
- Patient cancels before arrival: provider sees cancellation banner
- Provider marks no-show: appointment status updates accordingly

---

## Flow 12: Admin Login

**Entry point:** `/login`

**Happy path:**
1. Admin enters email + password → Supabase authenticates
2. Supabase session created with `admin` role
3. Admin redirected to `/admin`

**Error paths:**
- Non-admin user attempting `/admin/*`: middleware redirects to home (`/`)
- Wrong credentials: "Incorrect email or password."

**Edge cases:**
- Admin session expires: redirect to `/login`, resume at `/admin` after re-login

---

## Flow 13: Provider Approval / Rejection (Admin)

**Entry point:** `/admin/listings`

**Happy path:**
1. Admin views provider approval queue — list of pending provider accounts
2. Admin clicks a provider entry → reviews ICP number, specialty, profile completeness
3. Admin clicks "Approve" → `PATCH /api/admin/listings/[id]` → provider status → `approved`
4. Provider notified via Resend email: "Your bookphysio.in account is approved"
5. Provider can now receive bookings (appears in search results)

**Error paths:**
- Provider already approved: "This provider is already approved." (idempotent)
- API error: "Could not update provider status. Please try again."

**Reject path:**
1. Admin clicks "Reject" → optional rejection reason modal
2. `PATCH /api/admin/listings/[id]` → provider status → `rejected`
3. Provider notified via Resend: "Your application was not approved" + reason

**Edge cases:**
- Admin rejects then re-approves: status transitions `pending → rejected → approved` — all valid
```

- [ ] **Step 2.2: Verify file**

```bash
wc -l docs/USER_FLOWS.md
grep "^## Flow" docs/USER_FLOWS.md
```

Expected: 13 flow headings listed.

- [ ] **Step 2.3: Commit**

```bash
git add docs/USER_FLOWS.md
git commit -m "docs: add USER_FLOWS.md with 13 patient/provider/admin flows"
```

---

## Task 3: Update ACTIVE.md with tests field

**Files:**
- Modify: `docs/planning/ACTIVE.md`

- [ ] **Step 3.1: Add tests field to each remaining Phase 8 step in ACTIVE.md**

Open `docs/planning/ACTIVE.md`. Replace the "Next up" section and add a Phase 8 remaining steps block:

Find this existing content:
```markdown
### Next up: Step 8.7 — Patient Dashboard Polish
```

Replace with:
```markdown
### Next up: Step 8.7 — Patient Dashboard Polish

### Remaining Phase 8 Steps (with test gate)

> Each step is done only when Status = [x] AND Tests = [x].
> FEATURES.md Tests field is authoritative. This list is a convenience mirror.

- [ ] **8.7** Patient Dashboard Polish
  - tests: [ ] Vitest: date formatting, mock data shape | Playwright: patient sees upcoming appointment
- [ ] **8.8** Patient Appointments Polish
  - tests: [ ] Vitest: tab state, filter logic | Playwright: patient views list and detail
- [ ] **8.9** Provider Dashboard Polish
  - tests: [ ] Vitest: stats display formatting | Playwright: provider sees today's appointments
- [ ] **8.10** Provider Calendar Polish
  - tests: [ ] Vitest: slot render logic | Playwright: provider views 7-day calendar
- [ ] **8.11** Provider Availability Polish
  - tests: [ ] Vitest: toggle logic, hours validation | Playwright: provider saves availability
- [ ] **8.12** Provider Earnings Polish
  - tests: [ ] Vitest: INR amount formatting | Playwright: provider views earnings summary
- [ ] **8.13** Admin Dashboard Polish
  - tests: [ ] Vitest: stats display formatting | Playwright: admin accesses dashboard
- [ ] **8.14** Specialty/City Landing Pages
  - tests: [ ] Vitest: generateMetadata() slug → title/description | Playwright: landing page <title> correct
- [ ] **8.15** Static Pages Polish
  - tests: [ ] (none) | Playwright: /about /faq /how-it-works /privacy /terms load without errors
- [ ] **8.16** Mobile Responsiveness Pass *(begin tests only after USER_FLOWS.md complete)*
  - tests: [ ] (none) | Playwright: flows 1, 2, 6 at 375px viewport
- [ ] **8.17** Empty States and Loading Skeletons
  - tests: [ ] Vitest: skeleton renders without data prop | Playwright: empty state shown when no appointments
```

- [ ] **Step 3.2: Commit**

```bash
git add docs/planning/ACTIVE.md
git commit -m "docs: add test gate fields to Phase 8 steps in ACTIVE.md"
```

---

## Task 4: Update EXECUTION-PLAN.md Phase 10

**Files:**
- Modify: `docs/planning/EXECUTION-PLAN.md`

**Dependency:** Tasks 1–3 complete.

- [ ] **Step 4.1: Prepend incremental testing note to Phase 10**

Open `docs/planning/EXECUTION-PLAN.md`. Find:

```markdown
## PHASE 10 — Testing & Launch
- [ ] Unit tests (80%+ coverage with Vitest)
- [ ] E2E tests (critical flows with Playwright)
```

Replace with:

```markdown
## PHASE 10 — Testing & Launch

> **Note (updated 2026-03-30):** Unit and E2E tests for Phases 8.7–8.17 are written incrementally alongside each step (see `docs/FEATURES.md` and `docs/superpowers/plans/2026-03-30-ai-workflow-integration.md`). By the time Phase 10 begins, a passing test suite already exists.
> Phase 10 scope: run the full suite, fix any failures, and configure CI/CD only. "Write all tests from scratch" is NOT Phase 10 work.

- [ ] Full test suite passes (Vitest + Playwright) — fix any failures found
- [ ] GitHub Actions CI/CD pipeline — run suite on every PR and push to main
```

Keep all remaining Phase 10 items as-is:
```markdown
- [ ] Supabase production environment setup
- [ ] Domain + deployment (Vercel)
- [ ] Smoke test all flows end-to-end
```

- [ ] **Step 4.2: Commit**

```bash
git add docs/planning/EXECUTION-PLAN.md
git commit -m "docs: update EXECUTION-PLAN Phase 10 to reflect incremental testing approach"
```

---

## Task 5: Verify Everything Is Wired Correctly

**Dependency:** Tasks 1–4 complete.

- [ ] **Step 5.1: Confirm all four files exist and are non-empty**

```bash
ls -la docs/FEATURES.md docs/USER_FLOWS.md docs/planning/ACTIVE.md docs/planning/EXECUTION-PLAN.md
```

Expected: all four files listed with non-zero sizes.

- [ ] **Step 5.2: Confirm FEATURES.md has all 17 Phase 8 entries and 7 Phase 9 entries**

```bash
grep "^## " docs/FEATURES.md
```

Expected: headings for 8.7 through 8.17 (11 entries) and 9.1 through 9.7 (7 entries).

- [ ] **Step 5.3: Confirm USER_FLOWS.md has all 13 flows**

```bash
grep "^## Flow" docs/USER_FLOWS.md
```

Expected: 13 lines (Flow 1 through Flow 13).

- [ ] **Step 5.4: Confirm ACTIVE.md has the tests gate section**

```bash
grep "tests:" docs/planning/ACTIVE.md | wc -l
```

Expected: 11 lines (one per Phase 8 step 8.7–8.17).

- [ ] **Step 5.5: Confirm EXECUTION-PLAN.md Phase 10 has the updated note**

```bash
grep "incremental" docs/planning/EXECUTION-PLAN.md
```

Expected: at least one match.

- [ ] **Step 5.6: Final commit if any loose files remain unstaged**

```bash
git status
```

If clean: done. If any modified files: stage and commit with `docs: finalize AI workflow integration`.
