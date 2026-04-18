# Plan — Fix Auth Emails, Doctor OTP, Admin Dashboard, Google OAuth, Provider Approval

> Branch: `claude/fix-email-password-reset-gDI5Z`

---

## Context

Multiple auth/admin flows are broken in production:

1. **Password reset** emails ship from Supabase's default `noreply@supabase.co`; clicking the link returns "invalid token". We already have Resend wired for transactional mail but it's never used for auth.
2. **Doctor signup final step** sends a Supabase magic-link (wrong sender, broken link). The user wants an instant 6-digit OTP input in Step 5 instead.
3. **Admin dashboard shows fake numbers** (128 providers, 12 pending, ₹12.4L GMV) even when the real admin is signed in — caused by a stale demo-session cookie taking precedence over empty real data.
4. **Google sign-in** creates the account but then asks for email OTP again.
5. **Provider approval** queue visibility / approve / decline does not end-to-end work; decline leaves the record in pending state forever.
6. **Resend** is installed (`RESEND_API_KEY`, `RESEND_FROM_EMAIL` present in env) but only used for booking/reminder/review emails — zero auth templates.

The user has every API key/token in env except Razorpay + MSG91 (out of scope). All fixes must be code-side; user will handle the Supabase dashboard side separately.

**Goal:** All auth emails branded via Resend, OTP-based doctor verification, admin dashboard showing real DB data, Google sign-in working without OTP re-prompt, provider approval flow working end-to-end with correct state machine.

---

## Files Touched (Critical Path)

### New files
- `src/lib/auth/email-otp.ts` — generate/hash/verify 6-digit codes
- `src/app/api/auth/password-reset/route.ts` — POST: generate recovery link via admin API, send via Resend
- `src/app/api/auth/email-otp/send/route.ts` — POST: issue 6-digit email OTP via Resend
- `src/app/api/auth/email-otp/verify/route.ts` — POST: verify + mark `email_confirmed_at`
- `supabase/migrations/041_email_otps.sql` — `email_otps` table (+ RLS server-only)
- `supabase/migrations/042_provider_approval_state.sql` — add `approval_status enum('pending','approved','rejected')` to `providers`

### Modified files
- `src/lib/resend.ts` — add `sendPasswordResetEmail()`, `sendEmailOtp()`
- `src/app/(auth)/forgot-password/page.tsx:50` — replace `supabase.auth.resetPasswordForEmail()` with fetch to new endpoint
- `src/app/(auth)/doctor-signup/page.tsx:1435-1479,1486-1600` — replace Step 5 magic-link with OTP input; swap `useResendConfirmation` → `useEmailOtp`
- `src/app/api/providers/onboard-signup/route.ts:260-310` — trigger email-OTP send on Step 4 completion instead of relying on Step 5 client resend
- `src/app/api/admin/stats/route.ts:25-26` + `src/app/api/admin/analytics/route.ts:13-14` — gate demo fallback behind explicit `DEMO_ADMIN_FALLBACK_ENABLED` flag so stale demo cookies don't override real admin data
- `src/app/api/admin/listings/route.ts:54,73-118` — filter by `approval_status='pending'`; set `approval_status='rejected'` on decline (keep row visible under a "Rejected" tab)
- `src/app/admin/listings/page.tsx` — add tabs: Pending / Approved / Rejected; show rejected list
- `src/app/auth/callback/route.ts:23-43` + `src/app/api/auth/callback/route.ts` — clear `DEMO_SESSION_COOKIE` on successful OAuth/code exchange; ensure `resolvePostAuthRedirect` doesn't re-push to `/verify-otp` for OAuth users with `app_metadata.provider === 'google'`
- `src/app/api/auth/login/route.ts` — clear demo cookie on successful login
- `src/app/api/auth/otp/verify/route.ts` — clear demo cookie on successful verify
- `supabase/migrations/*handle_new_user*` — backfill migration (043) so OAuth signups set `role='patient'` and don't trigger phone-OTP re-prompt

---

## Implementation Phases

### Phase 1 — Password reset via Resend (highest-impact, smallest change)

1. Add `sendPasswordResetEmail({ to, resetUrl, userName })` to `src/lib/resend.ts` using existing `escapeHtml` / `sanitizeSubject` helpers. Reuse the branded `#00766C` / `#FF6B35` palette from existing templates (`sendReviewPrompt`).
2. Create `POST /api/auth/password-reset`:
   - Zod-validate `{ email }` (use existing `src/lib/validations/auth.ts`).
   - Rate-limit via existing `otpRatelimit` (`src/lib/upstash.ts`).
   - Call `supabaseAdmin.auth.admin.generateLink` with `type: 'recovery'`, `email`, and `redirectTo: APP_URL + '/auth/callback?next=/update-password'`.
   - Extract `data.properties.action_link` and forward it via `sendPasswordResetEmail()`.
   - Always return `200 { ok: true }` to prevent enumeration.
3. Swap `src/app/(auth)/forgot-password/page.tsx:50` from `supabase.auth.resetPasswordForEmail(...)` → `fetch('/api/auth/password-reset', { method: 'POST', body: { email } })`.
4. `sanitizeReturnPath` already whitelists `/update-password` (`src/lib/demo/session.ts:212`) → callback redirect works as-is.

### Phase 2 — Doctor signup: email OTP in Step 5

1. Migration `041_email_otps.sql`:
   ```sql
   CREATE TABLE email_otps (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
     email text NOT NULL,
     code_hash text NOT NULL,
     expires_at timestamptz NOT NULL,
     consumed_at timestamptz,
     attempts int NOT NULL DEFAULT 0,
     created_at timestamptz NOT NULL DEFAULT now()
   );
   -- RLS: server-only (no anon policies)
   ```
2. `src/lib/auth/email-otp.ts`:
   - `generateCode(): string` — 6-digit crypto-random.
   - `hashCode(code): string` — SHA-256 HMAC with `EMAIL_OTP_SECRET`.
   - `verifyAndConsume(userId, code): Promise<boolean>` — atomic check against `code_hash`, `expires_at`, `attempts < 5`.
3. `POST /api/auth/email-otp/send`:
   - Accept `{ user_id, email }` (requires a cookie tying user to signup flow, or a short-lived signed token from onboard-signup).
   - Insert row with 10-min expiry; send via `sendEmailOtp()`.
   - Rate-limit: 1/min per email, 5/10min per IP.
4. `POST /api/auth/email-otp/verify`:
   - Accept `{ user_id, code }`.
   - On success: `supabaseAdmin.auth.admin.updateUserById(user_id, { email_confirm: true })`.
   - Return `{ ok: true, redirectTo: '/provider/pending' }`.
5. `src/app/api/providers/onboard-signup/route.ts`: after `admin.createUser` succeeds (line 277), call email-OTP send inline so the code is waiting by the time Step 5 mounts.
6. `src/app/(auth)/doctor-signup/page.tsx`:
   - Replace `useResendConfirmation` hook with `useEmailOtp(email, userId)` — returns `{ status, error, countdown, submitCode, resend }`.
   - Replace Step 5 body: render 6-box OTP input (reuse styling from `src/app/(auth)/verify-otp/page.tsx`).
   - On verify success → `router.push('/provider/pending')`.
   - Keep "awaiting admin approval" copy after OTP verified.

### Phase 3 — Admin dashboard: real data only

Root cause: `src/app/api/admin/stats/route.ts:25` falls back to `getDemoAdminStats()` when `!user && demoSession?.role === 'admin'`. If the user was previously browsing via demo cookie, that cookie persists and the stats endpoint keeps serving 128/12/1840/₹12.4L.

1. Gate the demo fallback in `admin/stats` and `admin/analytics` behind an explicit env flag `DEMO_ADMIN_FALLBACK_ENABLED` (default `false` in production).
2. Clear `DEMO_SESSION_COOKIE` + `DEMO_SESSION_SUPPRESSION_COOKIE` on every successful real auth:
   - `src/app/api/auth/login/route.ts` (email/password)
   - `src/app/api/auth/otp/verify/route.ts` (phone OTP)
   - `src/app/auth/callback/route.ts:32-36` + `src/app/api/auth/callback/route.ts:34` (OAuth + email link)
3. Add a defensive banner in `src/app/admin/layout.tsx` if demo cookie present but no real user — instructs to sign in.

### Phase 4 — Google OAuth: no OTP re-prompt

1. Audit `resolvePostAuthRedirect` (`src/lib/demo/session.ts:232`) — it returns `/provider/pending` for `provider_pending`, else role dashboard. No forced `/verify-otp`. So the OTP prompt must be coming from elsewhere — most likely the `handle_new_user` trigger gives OAuth users `role='provider_pending'` when their `user_metadata.role` is blank. Fix in migration `025_fix_handle_new_user_role.sql` is probably incomplete; add migration `043_oauth_role_default.sql` to default `role='patient'` when `provider` in `app_metadata` is present.
2. In `/api/auth/callback` and `/auth/callback`, if `data.user.app_metadata.provider === 'google'` and no existing row in `public.users`, explicitly insert/update `role='patient'`, `phone_confirmed_at=now()` to prevent any downstream "unverified phone" gating.
3. Clear demo cookie in callback (see Phase 3).

### Phase 5 — Provider approval state machine

1. Migration `042_provider_approval_state.sql`:
   ```sql
   CREATE TYPE provider_approval_status AS ENUM ('pending','approved','rejected');
   ALTER TABLE providers ADD COLUMN approval_status provider_approval_status NOT NULL DEFAULT 'pending';
   UPDATE providers SET approval_status = CASE WHEN verified THEN 'approved' ELSE 'pending' END;
   CREATE INDEX providers_approval_status_idx ON providers(approval_status);
   ```
2. `src/app/api/admin/listings/route.ts`:
   - `GET`: default filter `approval_status='pending'`; accept `?status=approved|rejected` for tabs.
   - `PATCH`: on `approved=true` set `approval_status='approved', verified=true, active=true`; on `approved=false` set `approval_status='rejected', verified=false, active=false`. Also revert `users.role` to `patient` on rejection.
3. `src/app/admin/listings/page.tsx`: add Pending / Approved / Rejected tabs. Show each list. Allow re-approval of a previously rejected provider.
4. Send admin notification (reuse `src/lib/resend.ts` → new `sendAdminNewProviderAlert()`) on Step 4 completion of onboard-signup → `ADMIN_NOTIFICATION_EMAIL` env var.

### Phase 6 — Shared: email infrastructure consolidation

- In `src/lib/resend.ts`, introduce `renderAuthEmail({ title, preheader, bodyHtml, cta })` helper so `sendPasswordResetEmail` / `sendEmailOtp` / `sendAdminNewProviderAlert` share the same BookPhysio chrome and the user sees consistent branding.
- Update codemaps (`docs/CODEMAPS/api.md`, `lib.md`) to document new auth email endpoints and helpers.
- Update `docs/planning/EXECUTION-PLAN.md` — tick off completed phases, mark Phase 6 done.
- Update `docs/planning/ACTIVE.md` — close this task, surface next open items.

---

## Environment / Manual Tasks (User Side — NOT this plan)

Out of scope but document in `.env.example`:
- `EMAIL_OTP_SECRET` — 32-byte hex, HMAC secret for OTP hashing
- `ADMIN_NOTIFICATION_EMAIL` — where new-provider alerts go
- `DEMO_ADMIN_FALLBACK_ENABLED=false` in production (default off)

User must run two new migrations in Supabase (`041_email_otps.sql`, `042_provider_approval_state.sql`, `043_oauth_role_default.sql`).

Razorpay / MSG91 remain untouched per user instruction.

---

## Reused Utilities (do not rebuild)

- `escapeHtml`, `sanitizeSubject` in `src/lib/resend.ts:10-22`
- `otpRatelimit`, `apiRatelimit` in `src/lib/upstash.ts`
- `sanitizeReturnPath`, `resolvePostAuthRedirect` in `src/lib/demo/session.ts:186,232`
- `getDemoSessionFromCookies` + `DEMO_SESSION_COOKIE` (for cookie-clear)
- `supabaseAdmin` from `src/lib/supabase/admin.ts`
- OTP rate-limit helpers in `src/lib/auth/otp-rate-limit.ts` — generalize to cover email flow
- Existing verify-otp UI styling from `src/app/(auth)/verify-otp/page.tsx` (6-box input)
- `requireAdmin` pattern in `src/app/api/admin/listings/route.ts:12-17`

---

## Verification Plan

**Unit / integration**
- `rtk npm test` — add tests in `src/lib/auth/__tests__/email-otp.test.ts`, `src/app/api/admin/__tests__/listings.test.ts` (approval state transitions), `src/app/api/auth/__tests__/password-reset.test.ts`.

**Build**
- `rtk npm run build` — zero TS errors, zero lint warnings.

**Manual (user side)**
1. Forgot password → enter email → receive mail from `RESEND_FROM_EMAIL` (not supabase.co) → click → land on `/update-password` → set new password → login works.
2. Doctor signup → Step 5 → receive 6-digit email from `RESEND_FROM_EMAIL` → type code → see "awaiting admin approval" → admin gets notification email.
3. Sign in as real admin (after clearing demo cookie via logout) → `/admin` shows real DB numbers (not 128/12/1840/12.4L). Sign up a test provider → appears at `/admin/listings` under "Pending" tab → click Approve → provider promoted to `role='provider'`, moves to Approved tab → can log into provider dashboard.
4. Decline a test provider → moves to Rejected tab, stays visible, can be re-approved.
5. Google sign-in → single click → lands directly on `/patient/dashboard` (no OTP prompt).

**E2E (Playwright)**
- Add `e2e/password-reset.spec.ts`, `e2e/doctor-signup-email-otp.spec.ts`, `e2e/admin-provider-approval.spec.ts`.
- `rtk playwright test` — all green.

---

## Review Gates

- `code-reviewer` + `security-reviewer` in parallel after Phase 2 and Phase 5 (auth + admin surfaces are high blast radius).
- `database-reviewer` on migrations 041 / 042 / 043.
- Run `rtk npm run build` after each phase (fast fail).

---

## User-Confirmed Decisions

- **All auth emails ship from Resend (`RESEND_FROM_EMAIL`). Zero Supabase-SMTP emails.** Password reset, doctor-signup email OTP, admin new-provider alert — every single piece of transactional mail is composed and sent by our `src/lib/resend.ts` helpers. Supabase's built-in email sending is fully bypassed:
  - Password reset: we call `supabaseAdmin.auth.admin.generateLink({ type: 'recovery' })` **only** to get a valid action link; we never rely on its built-in email dispatch. The link is then emailed via `sendPasswordResetEmail()` from `RESEND_FROM_EMAIL`.
  - Doctor signup: user is created with `admin.createUser({ email_confirm: false })` which does not send anything; our custom 6-digit email OTP goes out via `sendEmailOtp()` from `RESEND_FROM_EMAIL`.
  - Phone OTP (SMS) is out of scope — MSG91 wiring stays as-is.
  - In Supabase Dashboard, user will turn off "Confirm email" auto-send templates so Supabase never fires competing emails. This is the one manual config step.
- **Decline behavior:** Demote to `users.role='patient'`, set `providers.approval_status='rejected'`, keep auth user intact. Rejected users can still use the platform as patients and be re-approved later.
- **Google OAuth new accounts:** Always default `role='patient'`. Providers must use `/doctor-signup` (email+password). OAuth callback will `upsert` `public.users` with `role='patient'` for brand-new signups.

---

## Risks / Known Tradeoffs

- **`admin.generateLink` returns a Supabase-hosted verify URL** (`<project>.supabase.co/auth/v1/verify?...`). The URL **is not an email**; it's just the verification token. We embed it in our own Resend-sent email. The user-visible sender is `RESEND_FROM_EMAIL` (e.g. `no-reply@bookphysio.in`). When they click, they hit Supabase's verify endpoint, which redirects instantly to our `/auth/callback?next=/update-password`. Token security stays with Supabase; email branding stays with us.
- **Supabase auth email templates must be disabled in the dashboard** (user task). If left on, Supabase will double-send from its default sender whenever `resetPasswordForEmail` or `signInWithOtp({ email })` fires. We're removing all those call sites in code but the dashboard toggle is the belt-and-braces guarantee.
- **Email OTP is custom, not Supabase-managed.** We own hashing, expiry, rate limiting. Must be carefully reviewed for timing attacks + enumeration (done in `security-reviewer` gate).
- **Approval state migration** (042) is a forward-only schema change. Backfill logic in migration maps `verified=true → 'approved'`. No data loss.
- Email OTP delivery depends on Resend uptime. For now we accept that; MSG91 + SMS backup is out of scope.
