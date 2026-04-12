# Supabase Production Setup Guide

> Step-by-step instructions to set up bookphysio.in production database.

## 1. Create Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Settings:
   - **Name**: `bookphysio-prod`
   - **Region**: `ap-south-1` (Mumbai) — lowest latency for India
   - **Database Password**: Generate a strong password, save it securely
4. Wait for project provisioning (~2 minutes)

## 2. Run Migrations

In the Supabase SQL Editor (`SQL Editor > New Query`), run each migration in order:

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_rls_policies.sql
supabase/migrations/003_indexes.sql
```

**Important**: Run them one at a time, in order. Each must succeed before the next.

## 3. Run Seed Data

After migrations, run the seed file:

```
supabase/seed.sql
```

This inserts specialties needed for the app to function.

## 4. Configure Authentication

### Phone Auth (MSG91 via Supabase Send SMS Hook)

MSG91 is **not** a built-in Supabase SMS provider dropdown. Instead, it requires a **Send SMS Hook** backed by a Supabase Edge Function. For the complete setup walkthrough, see [`docs/MSG91-SETUP-GUIDE.md`](./MSG91-SETUP-GUIDE.md).

**High-level steps:**
1. Go to **Authentication > Providers > Phone**
2. Enable Phone provider
3. Deploy the `send-sms` Supabase Edge Function (see MSG91 Setup Guide, Steps 7–8)
4. Configure the **Send SMS Hook** in **Authentication > Hooks** to point to the Edge Function
5. Set Edge Function secrets: `MSG91_AUTH_KEY`, `MSG91_TEMPLATE_ID`, `MSG91_SENDER_ID`
6. Test with a real +91 number to confirm SMS arrives before going live
7. Disable email confirmations if phone-first auth is preferred

> **Important:** the app does NOT include an MSG91 client. `app/api/auth/otp/send` calls `supabase.auth.signInWithOtp({ phone })` and `app/api/auth/otp/verify` calls `supabase.auth.verifyOtp(...)`. All SMS delivery happens server-side inside Supabase via the Send SMS Hook → Edge Function → MSG91 Flow API. If OTP SMS is not arriving in production, check the Edge Function logs and Hook configuration, not the repo code.

### Auth Settings
1. **Authentication > Settings**:
   - Site URL: `https://bookphysio.in`
   - Redirect URLs: add `https://bookphysio.in/**`
   - JWT expiry: `3600` (1 hour, default)

## 5. Storage Buckets

Create these buckets in **Storage**:

| Bucket | Public | Purpose |
|--------|--------|---------|
| `avatars` | Yes | User profile photos |
| `documents` | No | Provider credentials (ICP certs, degree scans) |
| `clinic-photos` | Yes | Clinic/location images |

### Storage Policies
For `avatars` bucket:
```sql
-- Anyone can read avatars
CREATE POLICY "Public avatar access" ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Users can upload their own avatar
CREATE POLICY "User avatar upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

For `documents` bucket:
```sql
-- Providers can upload their own documents
CREATE POLICY "Provider document upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Providers can read their own documents, admins can read all
CREATE POLICY "Document read access" ON storage.objects FOR SELECT
  USING (bucket_id = 'documents' AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  ));
```

## 6. Collect the values needed for Vercel env vars

From **Project Settings > API**:

| Value | Vercel Environment Variable |
|-------|-----------------------------|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` public key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` secret key | `SUPABASE_SERVICE_ROLE_KEY` |

## 7. Set Vercel Project Environment Variables

Go to **Vercel > Project Settings > Environment Variables** and add:

### Required Secrets
| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | From Supabase dashboard |
| `NEXT_PUBLIC_APP_URL` | `https://bookphysio.in` |
| `NEXT_PUBLIC_SITE_URL` | `https://bookphysio.in` |
| `OTP_PENDING_COOKIE_SECRET` | Generate with `openssl rand -base64 32` |

> MSG91 keys are configured as **Edge Function secrets** (via `supabase secrets set`), not as repo secrets or Supabase Auth provider fields. The Next.js app never sees them. See [`docs/MSG91-SETUP-GUIDE.md`](./MSG91-SETUP-GUIDE.md) for details.

### Optional Secrets (can add later)
| Variable | Purpose |
|----------|---------|
| `RAZORPAY_KEY_ID` | Payment processing |
| `RAZORPAY_KEY_SECRET` | Payment processing |
| `RAZORPAY_WEBHOOK_SECRET` | Payment webhooks |
| `RESEND_API_KEY` | Transactional email |
| `UPSTASH_REDIS_REST_URL` | Rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Rate limiting |
| `DEMO_COOKIE_SECRET` | Required if demo mode is enabled |
| `ENABLE_PUBLIC_PREVIEW_GATE` | Enable `/preview` access intentionally |
| `PREVIEW_TOKEN_SECRET` | Required if public preview gate is enabled |
| `PREVIEW_PASSWORD` | Shared password for public preview mode |

### Environment targeting

Assign the required variables to:

- **Production** — required
- **Preview** — recommended
- **Development** — recommended

If `OTP_PENDING_COOKIE_SECRET` was ever pasted into chat or another public place, rotate it before continuing.

## 8. Redeploy after env changes

Vercel does not retroactively inject new environment variables into an already-running deployment.

After adding or rotating env vars:

1. Trigger a fresh production deploy.
2. Wait for the deployment to finish successfully.
3. Re-test the live OTP flow on the deployed site.

## 9. Production smoke test

After the deploy, verify:

1. `https://bookphysio.in` loads
2. OTP send does not return `503`
3. A real phone receives the OTP SMS
4. OTP verify succeeds
5. The patient dashboard loads after auth
6. The provider dashboard still loads for a provider account
7. `/search` and a provider profile still work

If OTP fails:

- `503` immediately → missing Vercel env/config or a stale deployment
- no SMS delivered → Supabase phone-provider/SMS setup issue
- verify fails after SMS delivery → cookie/session/domain mismatch or wrong project keys
- local works, production fails → env targeting or redeploy issue

## 10. Create Admin User

After the first deploy, create an admin user:

1. Sign up through the app normally (phone OTP)
2. In Supabase SQL Editor, promote to admin:
   ```sql
   UPDATE users SET role = 'admin' WHERE phone = '+91XXXXXXXXXX';
   ```

## 11. DNS Configuration (bookphysio.in)

Use the Vercel project domain settings for the final values. The common setup is:

| Record Type | Name | Value |
|------------|------|-------|
| `A` | `@` | Vercel-provided apex record |
| `CNAME` | `www` | `cname.vercel-dns.com` |

> **Note**: This app should run on Vercel, not GitHub Pages. Vercel supports the Next.js API routes, middleware, and dynamic features used throughout the product.

## Checklist

- [ ] Supabase project created (ap-south-1 Mumbai region)
- [ ] All 3 migrations run successfully
- [ ] Seed data inserted
- [ ] Phone auth enabled
- [ ] Test OTP successfully sent from the Supabase dashboard
- [ ] Storage buckets created with policies
- [ ] Vercel project connected to GitHub repo
- [ ] Vercel environment variables configured
- [ ] Fresh production deploy completed after env setup
- [ ] Production OTP smoke test passed
- [ ] DNS records pointed to Vercel
- [ ] Admin user created
- [ ] SSL certificate provisioned (automatic via Vercel)
