# Fix provider sign-up OTP, forgot-password, and resume-onboarding

Branch: `claude/fix-signup-otp-password-bMZcQ`

## Context

Dr. sign-up has three compounding failures that strand the provider:

1. **Step 5 email OTP is shown but no email arrives.** `onboard-signup` creates the auth user + provider record + availability, then calls `createAndSendEmailOtp()` fire-and-forget. If Resend fails (missing `RESEND_API_KEY` / `RESEND_FROM_EMAIL`, unverified sender domain, transient API error), the response is still `201 { success: true }`. The UI advances to Step 5 and claims *"We sent a 6-digit code to …"* even when no email was actually dispatched. The user is stuck — no code ever arrives.
2. **No way to resume.** Re-signing up with the same email correctly returns 409 "account already exists". But logging in as that user (with email unconfirmed) either succeeds and lands on `/provider/pending` — which hard-codes *"Email confirmed"* (a lie) and offers no verify-email action — or is unreachable because the provider forgot the password they set in Step 1. Either way, Step 5 cannot be resumed.
3. **Forgot-password silently no-ops.** `/api/auth/password-reset` returns a masked "if an account exists…" response on every path, including silent Resend failures and Supabase `generateLink` errors. If env vars are missing the endpoint returns 500, but the UI treats all non-2xx as "email sent — check your inbox" or the error is only visible if the UI shows it.

**Intended outcome**: A provider who gets stuck at Step 5 can (a) always see a truthful state on screen about whether the email was actually sent, (b) resend the code on demand, (c) sign out → sign back in and be routed *back* to Step 5 with a fresh OTP, and (d) reliably reset their password if forgotten. No user ends up in a state with no recovery path.

## Root causes (confirmed by reading)

| # | Root cause | Evidence |
|---|------------|---------|
| R1 | `onboard-signup` swallows Resend errors, returns 201 regardless | `src/app/api/providers/onboard-signup/route.ts:423-426` — `createAndSendEmailOtp` result only `console.error`'d |
| R2 | Step 5 UI has no knowledge of whether the initial send succeeded | `src/app/(auth)/doctor-signup/page.tsx:1435-1440` — countdown just ticks; no `initialSendOk` prop |
| R3 | Login route never checks `email_confirmed_at`; `provider_pending` goes to `/provider/pending` unconditionally | `src/app/api/auth/login/route.ts:37-61` + `src/lib/demo/session.ts:232-235` |
| R4 | `/provider/pending/page.tsx` hard-codes "Email confirmed — Identity verified" with no data-binding | `src/app/provider/pending/page.tsx:63-69` |
| R5 | `doctor-signup` always starts at Step 1; no query-param deep-link to Step 5 | `src/app/(auth)/doctor-signup/page.tsx:1648` — `useState<StepNumber>(1)` |
| R6 | Resend client throws synchronously if `RESEND_API_KEY` missing; callers don't surface this as a user-visible error with recovery action | `src/lib/resend.ts:5-11` |
| R7 | Password-reset returns masked success even when Resend config is missing or `generateLink` errors; logs are the only signal | `src/app/api/auth/password-reset/route.ts:59-61, 68-71, 98-101` |

## Plan

### 1. Truthful Step-5 state (R1, R2)

- **File**: `src/app/api/providers/onboard-signup/route.ts`
  - Change the success payload from `{ success: true }` to `{ success: true, emailOtpStatus: 'sent' | 'failed', emailOtpError?: string }` based on `createAndSendEmailOtp()` result. Keep the 201 (user was created, so do not roll back).
  - Before calling `supabaseAdmin.auth.admin.createUser`, add a preflight env check for `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `NEXT_PUBLIC_APP_URL` (reuse existing `buildConfiguredAppUrl` pattern from `src/lib/server/runtime.ts:55-62`). If any are missing, return 503 `{ error: 'Email service is temporarily unavailable. Please try again in a few minutes.' }` *without* creating the user. This prevents the "user exists but can never verify" zombie state.

- **File**: `src/app/(auth)/doctor-signup/page.tsx`
  - Thread `emailOtpStatus` from the POST response into the Step 5 component as `initialSendOk: boolean` and `initialSendError?: string`.
  - In `Step5` (`page.tsx:1421-1641`):
    - If `initialSendOk === false`, render a red alert banner at the top: *"We couldn't send the verification email. Please click Resend code below."* with `initialSendError` as secondary text.
    - Start `countdown` at 0 (not 60) so the user can resend immediately.
    - Keep the existing resend button logic — it already calls `/api/auth/email-otp/send` and handles error display.

### 2. Resume onboarding via sign-in (R3, R4, R5)

- **File**: `src/app/api/auth/login/route.ts`
  - After `signInWithPassword` succeeds, check `data.user.email_confirmed_at`. If it is null AND `profile.role === 'provider_pending'`, return `{ role, redirectTo: '/doctor-signup?resume=1&email=' + encodeURIComponent(email) }`.
  - Do not reject the sign-in (user already holds a valid password + session cookie); just route them to Step 5.

- **File**: `src/app/(auth)/doctor-signup/page.tsx`
  - In `DoctorSignupPage` (`page.tsx:1645-`):
    - On mount, read `useSearchParams()` for `resume=1` and `email=<email>`.
    - If present, skip Steps 1-4 and set `currentStep = 5`. Pre-populate the email prop for `Step5`.
    - Also set a new `Step5` prop `requireFreshSend: true` so it triggers `/api/auth/email-otp/send` on mount once (guarded by a ref to prevent double-fire under Strict Mode).
  - Safety fallback: also allow entry without `resume=1` if the page detects (via a new `/api/auth/me/onboarding-status` GET route — see below) that the current user is signed in, `provider_pending`, has a `providers` row with `onboarding_step === 4`, and `email_confirmed_at` is null.

- **New file**: `src/app/api/auth/me/onboarding-status/route.ts`
  - GET route that returns `{ signedIn, role, emailConfirmed, providerExists, onboardingStep, email }` for the current cookie session. Used by `doctor-signup` page to decide where to land.

- **File**: `src/app/provider/pending/page.tsx`
  - Convert to a server component that fetches `supabase.auth.getUser()` and checks `user.email_confirmed_at`.
  - If email is NOT confirmed: render a different state — amber banner "Verify your email to continue" with a primary button linking to `/doctor-signup?resume=1&email=<masked>`. Do not render the "Email confirmed" tick.
  - If email IS confirmed: keep the existing "Application under review" content.
  - Alternative (less invasive): keep as client component, but fetch the flag via the new onboarding-status endpoint.

### 3. Forgot-password — replace Supabase recovery link with 6-digit OTP (R6, R7)

Current Supabase `generateLink({ type: 'recovery' })` flow has three fragile dependencies: Supabase SMTP config, the redirect-URL allowlist, and the code-exchange session handshake at `/auth/callback`. We'll replace it with the same pattern that already works for email verification: a 6-digit code via Resend.

**New DB migration**: `supabase/migrations/046_password_reset_otps.sql` (045 was already used for display-id sequencing)
- Table `password_reset_otps (id uuid pk, user_id uuid fk auth.users, email text, code text, expires_at timestamptz, used_at timestamptz null, created_at timestamptz default now())`.
- Index on `(email, created_at desc)`.
- No RLS — server-only access via `supabaseAdmin`.
- 15-minute expiry (slightly longer than signup OTP because user may be typing on a different device).

**New file**: `src/lib/auth/password-reset-otp.ts`
- `createAndSendPasswordResetOtp(email, userId): Promise<{ ok, error? }>` — mirrors `src/lib/auth/email-otp.ts`:
  - Preflight env check via shared `assertEmailServiceConfigured()`.
  - Generate 6-digit code via `randomInt`.
  - Insert row into `password_reset_otps`.
  - Send branded email via `getResendClient()` using `renderAuthEmail()` wrapper from `src/lib/resend.ts:109-136`.
  - On Resend failure, keep row so resend can succeed.
- `verifyPasswordResetOtp(email, code): Promise<{ ok, userId? | error }>` — checks row exists, not expired, not used; marks `used_at`; returns `userId`.

**Rewrite**: `src/app/api/auth/password-reset/route.ts` — becomes the "send code" endpoint.
- Zod-validate `{ email }`.
- Rate-limit by IP + email (reuse `otpRatelimit`).
- Look up user via `supabaseAdmin.auth.admin.listUsers()` (filter by email) — if not found, return **masked** success `{ message: 'If an account exists, a code has been sent.' }` (preserves no-enumeration).
- If found, call `createAndSendPasswordResetOtp`. On `ok`, return masked success. On `ok: false` from missing env, return 503 (operator error, not a user-enumeration concern). On Resend send failure after row insert, return 500 with error (so the UI shows "try again") — but still keep the row.

**New endpoint**: `src/app/api/auth/password-reset/verify/route.ts` — validates code + sets new password.
- Zod-validate `{ email, code, newPassword }` where `newPassword` must satisfy the same Zod rules as signup (`src/lib/validations/auth.ts`).
- Rate-limit per email + IP.
- Call `verifyPasswordResetOtp(email, code)`. On failure return 400 `{ error: 'Invalid or expired code' }`.
- On success, call `supabaseAdmin.auth.admin.updateUserById(userId, { password: newPassword, email_confirm: true })`. Setting `email_confirm: true` as a side-benefit — anyone who can receive a 6-digit code at that inbox has verified ownership, so we can mark the email verified and unblock provider onboarding without a second OTP round. (Document this in the route comment.)
- Return `{ success: true, email }`.

**Rewrite**: `src/app/(auth)/forgot-password/page.tsx` — two-step form.
- Step 1 (current): enter email, POST to `/api/auth/password-reset`. On success (200 masked or actual 200), advance to Step 2 even if the account didn't exist (to preserve enumeration-mask on client side too). Show "Check your inbox for the 6-digit code" and the Step 2 form.
- Step 2 (new): 6-digit code input (reuse the digit-group component pattern from `doctor-signup/page.tsx:1562-1589` — extract into `src/components/auth/OtpDigits.tsx` so both flows share it) + new-password field + confirm-password field. POST to `/api/auth/password-reset/verify`. On success, redirect to `/login?reset=1` and show a success toast "Password updated — sign in with your new password".
- Resend-code button + 60 s cooldown, same as signup Step 5.
- Keep phone-OTP path unchanged (`/api/auth/otp/send`) as a separate branch of the form — out of scope.

**Delete** (or gut): `src/app/(auth)/update-password/page.tsx` and `src/app/auth/callback/route.ts`'s recovery-link handling (the `?next=/update-password` branch).
- If `/update-password` is still linked from anywhere, replace those links with `/forgot-password`.
- Keep `/auth/callback` for Google OAuth (still needed) — only remove the `?next=/update-password` branch and any `exchangeCodeForSession` path that was exclusively for password recovery.

**Shared component**: `src/components/auth/OtpDigits.tsx`
- Extract the 6-digit input grid from `doctor-signup/page.tsx:1562-1589` so `forgot-password` Step 2 reuses the exact same UX (paste-6-at-once, auto-advance, backspace-back). Export as `<OtpDigits value={digits} onChange={setDigits} error={?} />`.

### 4. Env-var hygiene

- Add a single shared helper `src/lib/email/preflight.ts` with `assertEmailServiceConfigured(): { ok: true } | { ok: false, missing: string[] }`. Reuse it from `onboard-signup`, `password-reset`, and `email-otp/send`. Central place for the env contract.
- Update `.env.example` if needed to make `RESEND_API_KEY` and `RESEND_FROM_EMAIL` requirement explicit (they likely already are).
- **Operator action (not code)**: verify in Vercel Production env that `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `NEXT_PUBLIC_APP_URL` are all set and that the `RESEND_FROM_EMAIL` domain is verified in the Resend dashboard. Without this the code fix cannot deliver email.

## Critical files to modify

| File | Change |
|------|--------|
| `src/app/api/providers/onboard-signup/route.ts` | Preflight email-config check (503 before user creation); return `emailOtpStatus` in success payload |
| `src/app/(auth)/doctor-signup/page.tsx` | Resume-from-query-param (`?resume=1&email=`); propagate `emailOtpStatus` to Step 5; Step 5 shows failure banner + immediate resend |
| `src/app/api/auth/login/route.ts` | Route unconfirmed `provider_pending` to `/doctor-signup?resume=1&email=…` instead of `/provider/pending` |
| `src/app/api/auth/me/onboarding-status/route.ts` | **NEW** — returns current user's onboarding state (role, `emailConfirmed`, `onboardingStep`, `email`) |
| `src/app/provider/pending/page.tsx` | Fetch real `email_confirmed_at`; stop hardcoding "Email confirmed" (safety net for edge cases even if login now auto-resumes) |
| `src/app/api/auth/password-reset/route.ts` | Rewrite: send 6-digit OTP via Resend instead of Supabase recovery link |
| `src/app/api/auth/password-reset/verify/route.ts` | **NEW** — verify OTP + set new password + mark email confirmed |
| `src/app/(auth)/forgot-password/page.tsx` | Rewrite: two-step form (email → OTP + new password) with resend |
| `src/app/(auth)/update-password/page.tsx` | **DELETE** (replaced by forgot-password Step 2) |
| `src/app/auth/callback/route.ts` | Remove `?next=/update-password` recovery branch; keep OAuth path |
| `src/lib/auth/password-reset-otp.ts` | **NEW** — mirrors `email-otp.ts`: `createAndSend`, `verify` |
| `src/lib/email/preflight.ts` | **NEW** — shared `assertEmailServiceConfigured()` |
| `src/components/auth/OtpDigits.tsx` | **NEW** — extracted 6-digit input grid shared between doctor-signup Step 5 and forgot-password Step 2 |
| `supabase/migrations/046_password_reset_otps.sql` | **NEW** — `password_reset_otps` table |

## Existing utilities to reuse

- `createAndSendEmailOtp()` — `src/lib/auth/email-otp.ts:20-81` (template for `password-reset-otp.ts`; already idempotent, keeps record on send failure)
- `getResendClient()` — `src/lib/resend.ts:5-11` (lazy singleton)
- `renderAuthEmail()` — `src/lib/resend.ts:109-136` (branded email wrapper used for admin alerts; reuse for password-reset email body)
- `resolvePostAuthRedirect()` — `src/lib/demo/session.ts:232` (untouched — login route handles the new branch before calling this)
- `buildConfiguredAppUrl()` — `src/lib/server/runtime.ts:55-62`
- Rate-limit helper `otpRatelimit` — `src/lib/upstash.ts`
- Zod password rules — `src/lib/validations/auth.ts` (reuse for password-reset verify endpoint)
- Supabase admin updateUserById — already used in `src/app/api/auth/email-otp/verify/route.ts:70-72`

## Tests to add

Unit (vitest):
- `onboard-signup` returns `emailOtpStatus: 'failed'` when `createAndSendEmailOtp` returns `ok: false` (user is still created).
- `onboard-signup` returns 503 when `RESEND_API_KEY` or `RESEND_FROM_EMAIL` is unset, *without* creating the auth user (mock `process.env` + assert `createUser` not called).
- `/api/auth/login` returns `redirectTo: '/doctor-signup?resume=1&email=…'` when `email_confirmed_at` is null and role is `provider_pending`; returns `/provider/pending` when confirmed.
- `/api/auth/me/onboarding-status` returns correct shape for each user state (patient, provider_pending unconfirmed, provider_pending confirmed, signed-out).
- `password-reset-otp` lib: `createAndSend` inserts row, calls Resend; `verify` rejects expired/used/unknown codes; `verify` marks `used_at` on success.
- `/api/auth/password-reset` returns masked success for unknown email; 503 when env missing; persists row even on Resend send failure.
- `/api/auth/password-reset/verify` sets new password + `email_confirm: true` on success; rejects weak passwords via Zod.

E2E (Playwright, under `e2e/`):
- `provider-signup-otp.spec.ts` — Step 5 shows failure banner when Resend mocked to fail; Resend button re-triggers send.
- `provider-resume-onboarding.spec.ts` — sign up → close browser at Step 5 → log in with the password set in Step 1 → land on `/doctor-signup?resume=1&email=…` → fresh OTP auto-sent → enter code → land on `/provider/pending` with green "Email confirmed".
- `forgot-password-otp.spec.ts` — happy path: enter email → 6-digit code appears in mocked inbox → enter code + new password → redirected to `/login?reset=1` → sign in with new password succeeds.
- `forgot-password-enum-mask.spec.ts` — requesting reset for a non-existent email still advances to Step 2 (no enumeration leak).

## Verification (end-to-end)

1. **Env setup**: confirm `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (verified domain), `NEXT_PUBLIC_APP_URL` set locally in `.env` and in Vercel.
2. `rtk npm run build` — must pass with zero TS errors.
3. `rtk npm test` — all new unit tests green, existing suite passes.
4. `rtk playwright test e2e/provider-signup-otp.spec.ts e2e/provider-resume-onboarding.spec.ts e2e/forgot-password.spec.ts`.
5. Apply migration `supabase/migrations/046_password_reset_otps.sql` in the local Supabase.
6. Manual smoke against dev server (`rtk npm run dev`):
   - (a) Sign up a new provider with a real inbox; confirm the 6-digit OTP email arrives within 10 s; enter code; land on `/provider/pending` with correct "Email confirmed" tick.
   - (b) Sign up a second provider, intentionally unset `RESEND_FROM_EMAIL`; confirm the 503 shows *before* the user is created (check Supabase auth.users — no orphan row), and a clear UI error.
   - (c) Sign up a third provider, close tab at Step 5, log in with same email+password → land back on Step 5 (URL `?resume=1&email=…`), fresh OTP auto-sent, enter code, verify.
   - (d) Forgot password → enter email → receive 6-digit code → enter code + new password on same page → redirect to `/login?reset=1` → sign in with new password succeeds. Also verify that `auth.users.email_confirmed_at` is populated after this (side-benefit).
   - (e) Forgot password with unknown email → UI still advances to Step 2 (no enumeration); entering any code fails with "Invalid or expired code".
7. `rtk git add` + commit in logical slices + push to `claude/fix-signup-otp-password-bMZcQ`:
   - Slice 1: `OtpDigits` component extraction (refactor, no behaviour change).
   - Slice 2: `email/preflight` + onboard-signup 503 + Step 5 `emailOtpStatus` banner.
   - Slice 3: login route resume redirect + `onboarding-status` endpoint + doctor-signup `?resume=1` handling.
   - Slice 4: `/provider/pending` data-bound state.
   - Slice 5: migration 046 + `password-reset-otp` lib + new send/verify routes + rewritten forgot-password page + delete `/update-password` + gut recovery branch in `/auth/callback`.
8. Append CHANGELOG entry per session-handoff protocol (status: `done`, next up: follow-up if any).

## Out of scope

- Phone-OTP / SMS resend for sign-in (user did not ask; only email OTP is broken).
- Provider approval workflow (separate Phase 17 stream).
- Replacing Resend with Supabase SMTP (architectural decision, not needed to fix these bugs).
- Re-sending the Supabase built-in confirmation email (explicitly disabled per code comment at `onboard-signup:260-261`).
- Resuming earlier doctor-signup steps (1-3) — those aren't persisted until Step 4 submit, so there's nothing to resume. `?resume=1` only targets Step 5.
