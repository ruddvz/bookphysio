# bookphysio.in — Manual Release Checklist

Updated: 2026-04-08

Only the tasks that require external dashboard access are listed here.

If you want the shortest path, do only the `Required Now` section first.

---

## Already Done

- [x] Supabase migrations `025` → `029` applied on production
- [x] Google Search Console property verified and sitemap submitted
- [x] Bing Webmaster Tools site added and sitemap submitted

---

## Required Now

### 1. Deploy the latest verified repo state

Reason: the local repo now contains the latest preview hardening, OTP phone-privacy changes, and the next deploy fix for the empty-state demo-session `204` response. Those are verified locally but are not live until the latest commit is pushed.

Before pushing, confirm these Vercel environment settings:

- `DEMO_COOKIE_SECRET` is set
- `OTP_PENDING_COOKIE_SECRET` is set
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
5. Confirm the live apex site reflects the new auth/privacy behavior.

If the deploy fails:

- Stop.
- Copy the exact Vercel error.
- Bring it back here and I can help you fix it.

### 2. Add real production provider data

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

### 3. Run a production smoke pass

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

If any of those fail:

- Stop at the first failing step.
- Copy the exact error or URL.
- Bring it back here and I can help you triage it.

---

## Optional But Recommended After Release

### 4. Enable notification cleanup cron

Migration `027` is already applied, so this can be done any time after launch.

```sql
SELECT cron.schedule('cleanup-notifications', '0 3 * * *', 'SELECT cleanup_expired_notifications()');
```

If `pg_cron` is not enabled yet:
1. Go to `Database` → `Extensions`
2. Enable `pg_cron`
3. Re-run the SQL above

### 5. Add a JWT role custom claim hook

Reason: removes one DB round-trip on authenticated requests.

In Supabase Dashboard:
1. Go to `Authentication` → `Hooks`
2. Add a custom access token hook
3. Inject the user `role` claim into the JWT payload

This is a performance improvement, not a release blocker.

---

## External Follow-Up

### 6. Add the `www` DNS record

At your domain registrar, add:

```text
A  www.bookphysio.in  -> 76.76.21.21
```

Or move DNS fully to Vercel nameservers if you want Vercel to manage this.

---

## Fastest Real-World Order

1. Confirm the required Vercel env vars for the new auth/privacy deploy.
2. Deploy the latest verified repo state.
3. Add real production provider data.
4. Run the production smoke pass.
5. Do notification cleanup cron, JWT role claims, and `www` DNS later.
