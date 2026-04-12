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

### 3. Confirm Supabase phone auth is configured

Reason: the repo sends OTPs through Supabase Auth. The Next.js app does not talk to MSG91 directly.

How to do it:
1. Open Supabase → **Authentication** → **Providers** → **Phone**.
2. Enable the Phone provider.
3. Configure the SMS provider there.
4. Use Supabase's test/send flow to confirm a real +91 number receives an OTP before retrying the app flow.
5. Confirm **Authentication** → **Settings** includes the live production domain.

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
2. Confirm Supabase phone auth is live and tested in the dashboard.
3. Deploy the latest verified repo state.
4. Add real production provider data.
5. Run the production smoke pass.
6. Do notification cleanup cron, JWT role claims, and `www` DNS later.
