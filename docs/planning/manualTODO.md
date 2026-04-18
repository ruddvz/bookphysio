# bookphysio.in — Manual Release Checklist

Updated: 2026-04-12

Only the tasks that require external dashboard access are listed here.

If you want the shortest path, do only the `Required Now` section first.

---

## Already Done

- [x] Supabase migrations `025` → `029` applied on production
- [x] Google Search Console property verified and sitemap submitted
- [x] Bing Webmaster Tools site added and sitemap submitted

---

## Required Now

### 1. Rotate the OTP cookie secret

Reason: `OTP_PENDING_COOKIE_SECRET` was pasted into chat, so it should be treated as exposed.

How to do it:
1. Generate a fresh secret:
   ```bash
   openssl rand -base64 32
   ```
2. In Vercel → **Project Settings** → **Environment Variables**, replace the current `OTP_PENDING_COOKIE_SECRET`.
3. Save it for **Production** at minimum, and usually **Preview** + **Development** too.
4. Do not reuse the previously pasted value anywhere else.

### 2. Confirm the Vercel OTP/auth env vars

Reason: `OTP_PENDING_COOKIE_SECRET` alone is not enough for production OTP.

Required for production OTP:

- `OTP_PENDING_COOKIE_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SITE_URL`

Optional, depending on enabled features:

- `DEMO_COOKIE_SECRET` — required anywhere demo mode is enabled
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `ENABLE_PUBLIC_PREVIEW_GATE`
- `PREVIEW_TOKEN_SECRET`
- `PREVIEW_PASSWORD`

How to do it:
1. Open Vercel → **Project Settings** → **Environment Variables**.
2. Confirm each required variable exists with the correct value.
3. Confirm each variable is assigned to the right environments:
   - **Production** required
   - **Preview** recommended
   - **Development** recommended
4. Confirm the Supabase URL, anon key, and service-role key all belong to the same Supabase project.
5. Confirm `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_SITE_URL` both match the live production origin.

### 3. Configure Supabase phone auth with MSG91

Reason: the repo sends OTPs through Supabase Auth (`supabase.auth.signInWithOtp()`). The Next.js app does **not** talk to MSG91 directly — Supabase handles SMS delivery through a **Send SMS Hook** wired to the repo's Supabase Edge Function.

**Step-by-step MSG91 setup in Supabase:**

1. Open Supabase → **Authentication** → **Providers** → **Phone**
2. Toggle **Enable Phone provider** to ON
3. Save the Phone provider settings
4. Deploy the repo's `send-sms` Supabase Edge Function and set its `MSG91_AUTH_KEY`, `MSG91_TEMPLATE_ID`, and `MSG91_SENDER_ID` secrets
5. Open Supabase → **Authentication** → **Hooks**
6. Configure the **Send SMS** hook to call the deployed Edge Function
7. Click **Send test OTP** — enter a real `+91` number and confirm the SMS arrives
8. Open **Authentication** → **URL Configuration**:
    - **Site URL**: `https://bookphysio.in`
    - **Redirect URLs**: add `https://bookphysio.in/**`

> **DLT compliance (India):** All SMS templates must be pre-registered with TRAI via your telecom operator's DLT portal. Ensure the MSG91 template configured in the Edge Function secrets is DLT-approved and matches the OTP payload used by the hook.

> **Important:** Do **not** configure MSG91 through a Supabase Auth SMS provider dropdown for this repo. If OTP SMS is not arriving in production, check the Supabase **Send SMS Hook**, the deployed Edge Function, and the MSG91 secrets used by that function.

### 4. Deploy the latest verified repo state

Reason: the local repo now contains the latest preview hardening, OTP phone-privacy changes, and the next deploy fix for the empty-state demo-session `204` response. Those are verified locally but are not live until the latest commit is pushed.

Before pushing, confirm these Vercel environment settings:

- `OTP_PENDING_COOKIE_SECRET` is set
- `NEXT_PUBLIC_SUPABASE_URL` is set
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set
- `SUPABASE_SERVICE_ROLE_KEY` is set
- `NEXT_PUBLIC_APP_URL` is set
- `NEXT_PUBLIC_SITE_URL` is set
- `DEMO_COOKIE_SECRET` is set if demo mode is enabled
- `ENABLE_PUBLIC_PREVIEW_GATE` is left unset unless you intentionally want `/preview` reachable on production
- `PREVIEW_TOKEN_SECRET` is only required if you intentionally enable public preview access

Current local verification status:

- `rtk npm run type-check` ✅
- `rtk npm run lint -- . --ext .ts,.tsx,.js,.jsx` ✅
- Focused auth/privacy regressions ✅
- `rtk npm run build` ✅

How to do it:
1. Review the current local changes.
2. Commit them.
3. Push the branch that should trigger production deploy.
4. Watch the Vercel production deployment until it finishes successfully.
5. Trigger a fresh production redeploy after any Vercel env change so the running deployment picks up the new values.
6. Confirm the live apex site reflects the new auth/privacy behavior.

If the deploy fails:

- Stop.
- Copy the exact Vercel error.
- Bring it back here and I can help you fix it.

### 5. Add real production provider data

Reason: the site is technically live, but it is not functionally useful if `/api/providers` still returns zero real providers.

Do this only with reviewed real provider records.

Options:

- Supabase Dashboard → `Table Editor` → `providers`
- A reviewed production-safe import process

Minimum outcome needed before launch:

- `/api/providers` returns real results
- `/search` shows real providers
- At least one provider profile and booking flow can be tested end-to-end

Do not run the current `supabase/seed.sql` on production unless you explicitly want mock/demo-like records there.

### 6. Run a production smoke pass

Reason: after the deploy and provider data update, you need one short live validation pass on the apex domain.

Check these exact flows:

1. Homepage loads on `https://bookphysio.in`
2. `/search` shows real providers
3. One provider profile opens
4. One booking flow completes to the success state
5. OTP login or signup works on a real test number
6. Patient dashboard loads after auth
7. Provider dashboard loads for a real provider account
8. `/preview` stays blocked unless you intentionally enabled it

If the OTP flow fails, classify it before changing anything:

- `503` immediately on send or verify → missing env/config, stale deploy, or missing OTP cookie secret
- OTP request succeeds but no SMS arrives → Supabase phone-provider or SMS setup issue
- SMS arrives but verify fails → cookie/session/domain mismatch, or wrong Supabase project keys
- Works locally but not on production → Vercel env scope or redeploy issue

If any of those fail:

- Stop at the first failing step.
- Copy the exact error or URL.
- Bring it back here and I can help you triage it.

---

## Optional But Recommended After Release

### 7. Enable notification cleanup cron

Migration `027` is already applied, so this can be done any time after launch.

```sql
SELECT cron.schedule('cleanup-notifications', '0 3 * * *', 'SELECT cleanup_expired_notifications()');
```

If `pg_cron` is not enabled yet:
1. Go to `Database` → `Extensions`
2. Enable `pg_cron`
3. Re-run the SQL above

### 8. Add a JWT role custom claim hook

Reason: removes one DB round-trip on authenticated requests.

In Supabase Dashboard:
1. Go to `Authentication` → `Hooks`
2. Add a custom access token hook
3. Inject the user `role` claim into the JWT payload

This is a performance improvement, not a release blocker.

---

## External Follow-Up

### 9. Add the `www` DNS record

At your domain registrar, add:

```text
A  www.bookphysio.in  -> 76.76.21.21
```

Or move DNS fully to Vercel nameservers if you want Vercel to manage this.

---

## Fastest Real-World Order

1. Confirm the required Vercel env vars for the new auth/privacy deploy.
2. Confirm Supabase phone auth (MSG91) is live and tested in the dashboard.
3. Deploy the latest verified repo state.
4. Add real production provider data.
5. Run the production smoke pass.
6. Do notification cleanup cron, JWT role claims, and `www` DNS later.

---

## Appendix A: How to Generate Cookie Secrets

All three cookie secrets use the same generation command but serve different purposes. **Each must be unique — never reuse the same value for multiple secrets.**

### OTP Pending Cookie Secret (`OTP_PENDING_COOKIE_SECRET`)

**Purpose:** Encrypts the phone number in a server-side cookie during OTP verification flows, keeping raw mobile numbers out of client-side storage.

**How the code uses it:** `src/lib/auth/pending-otp-cookie.ts` derives an AES-256-GCM key from this secret and encrypts/decrypts the pending OTP payload (phone, flow, flowId, name, returnTo).

**Generate:**
```bash
openssl rand -base64 32
```

**Set in Vercel:**
1. Go to **Vercel → Project Settings → Environment Variables**
2. Name: `OTP_PENDING_COOKIE_SECRET`
3. Value: paste the output of the command above
4. Environments: ✅ Production, ✅ Preview, ✅ Development
5. Click **Save**

**Fallback behavior:** If unset, the code falls back to `DEMO_COOKIE_SECRET`. If both are unset in production, OTP send returns `503 "OTP configuration is unavailable"`.

---

### Demo Cookie Secret (`DEMO_COOKIE_SECRET`)

**Purpose:** Signs demo session cookies with HMAC-SHA256. Required whenever demo mode (`NEXT_PUBLIC_ENABLE_DEMO=true`) is active.

**How the code uses it:** `src/lib/demo/session.ts` uses this as the HMAC signing key for the `bp-demo-session` cookie. The cookie contains role/userId/session metadata signed to prevent tampering.

**Generate:**
```bash
openssl rand -base64 32
```

**Set in Vercel:**
1. Go to **Vercel → Project Settings → Environment Variables**
2. Name: `DEMO_COOKIE_SECRET`
3. Value: paste the output of the command above
4. Environments: ✅ Production, ✅ Preview, ✅ Development
5. Click **Save**

**Fallback behavior:** If unset, demo cookie signing fails gracefully — demo sessions will not work but the app continues to function for real auth.

---

### Preview Token Secret (`PREVIEW_TOKEN_SECRET`)

**Purpose:** Signs the preview access token cookie with HMAC-SHA256. Only needed if you enable the public preview gate (`ENABLE_PUBLIC_PREVIEW_GATE=true`).

**How the code uses it:** `src/lib/preview/token.ts` signs a timestamp-based preview token. The signed cookie (`preview_token`) grants access to preview-gated routes for 30 days.

**Generate:**
```bash
openssl rand -base64 32
```

**Set in Vercel:**
1. Go to **Vercel → Project Settings → Environment Variables**
2. Name: `PREVIEW_TOKEN_SECRET`
3. Value: paste the output of the command above
4. Environments: ✅ Production, ✅ Preview, ✅ Development
5. Click **Save**

**Fallback behavior:** Falls back to `DEMO_COOKIE_SECRET` if set. If neither is available, preview token validation always returns false and preview access is denied.

**Related env var:** You also need `PREVIEW_PASSWORD` (the shared password testers enter on the `/preview` page) and `ENABLE_PUBLIC_PREVIEW_GATE=true` to activate the gate.

---

### Quick Reference: All Cookie Secrets at a Glance

```bash
# Generate all three in one go (run each line, copy each output separately):
echo "OTP_PENDING_COOKIE_SECRET=$(openssl rand -base64 32)"
echo "DEMO_COOKIE_SECRET=$(openssl rand -base64 32)"
echo "PREVIEW_TOKEN_SECRET=$(openssl rand -base64 32)"
```

| Variable | Required | Purpose | Fallback |
|----------|----------|---------|----------|
| `OTP_PENDING_COOKIE_SECRET` | ✅ Always | Encrypts phone number in OTP flow cookie | `DEMO_COOKIE_SECRET` → `local-otp-cookie-secret` (dev only) |
| `DEMO_COOKIE_SECRET` | Only if demo mode is on | Signs demo session cookies | None — demo fails gracefully |
| `PREVIEW_TOKEN_SECRET` | Only if preview gate is on | Signs preview access tokens | `DEMO_COOKIE_SECRET` |
| `PREVIEW_PASSWORD` | Only if preview gate is on | Shared password for `/preview` page | None |

> **Security:** Never reuse the same value for different secrets. Never commit secrets to the repo. If a secret was ever pasted in chat or a public place, rotate it immediately using the generation commands above.
