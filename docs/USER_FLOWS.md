# bookphysio.in — User Flows

> Step-by-step interaction flows for all critical paths. Primary reference for Phase 9 API wiring.
> Flows 1–6: Patient. Flows 7–10: Provider. Flows 11–12: Admin.
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
2. `POST /api/auth/otp/send` called → Supabase Auth `signInWithOtp` → SMS delivered via Supabase's MSG91 phone provider
3. OTP input screen shown (6 digits, auto-advance between boxes)
4. Patient enters OTP → `POST /api/auth/otp/verify` called
5. On success: Supabase session created → patient redirected to `/patient/dashboard` (or original redirect target)

**Error paths:**
- Wrong OTP: "Incorrect OTP. Please try again." (input cleared, focus on first box)
- Expired OTP (>10 min): "OTP expired. Tap 'Resend OTP'." → resend triggers a fresh Supabase OTP request
- Rate limit hit (>3 sends in 10 min): "Too many OTP requests. Please wait 10 minutes."
- SMS provider unavailable (Supabase phone provider error): "OTP service unavailable. Please try again shortly."
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
4. Step 4 (Goals): 4-card interactive selection (New Patients / Intake+Forms / In-person Booking / Home Visits) — multi-select
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
3. Accept: `PATCH /api/appointments/[id]` → status `confirmed` → patient notified via Resend (email) and Supabase phone-provider SMS
4. Reject: `PATCH /api/appointments/[id]` → status `cancelled` → patient notified

**Error paths:**
- Appointment already accepted by another session: "This appointment was already confirmed."
- API error: "Could not update appointment. Please try again."

**Edge cases:**
- Provider rejects and patient re-books: slot freed on reject, available for re-booking

---

## Flow 11: Admin Login

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

## Flow 12: Provider Approval / Rejection (Admin)

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
