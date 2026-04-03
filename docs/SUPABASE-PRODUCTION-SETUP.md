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

This inserts specialties and insurance plans needed for the app to function.

## 4. Configure Authentication

### Phone Auth (MSG91 OTP)
1. Go to **Authentication > Providers > Phone**
2. Enable Phone provider
3. Set **SMS Provider**: `Custom` (we handle OTP via MSG91 in our API routes)
4. Disable email confirmations if phone-first auth is preferred

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

## 6. Collect Keys for GitHub Secrets

From **Project Settings > API**:

| Key | GitHub Secret Name |
|-----|-------------------|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` public key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` secret key | `SUPABASE_SERVICE_ROLE_KEY` |

## 7. Set GitHub Repository Secrets

Go to **GitHub repo > Settings > Secrets and variables > Actions** and add:

### Required Secrets
| Secret | Value |
|--------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | From Supabase dashboard |
| `MSG91_AUTH_KEY` | From MSG91 dashboard |
| `MSG91_TEMPLATE_ID` | From MSG91 dashboard |
| `NEXT_PUBLIC_APP_URL` | `https://bookphysio.in` |

### Optional Secrets (can add later)
| Secret | Purpose |
|--------|---------|
| `RAZORPAY_KEY_ID` | Payment processing |
| `RAZORPAY_KEY_SECRET` | Payment processing |
| `RAZORPAY_WEBHOOK_SECRET` | Payment webhooks |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Map view on search |
| `RESEND_API_KEY` | Transactional email |
| `UPSTASH_REDIS_REST_URL` | Rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Rate limiting |

## 8. Create Admin User

After the first deploy, create an admin user:

1. Sign up through the app normally (phone OTP)
2. In Supabase SQL Editor, promote to admin:
   ```sql
   UPDATE users SET role = 'admin' WHERE phone = '+91XXXXXXXXXX';
   ```

## 9. DNS Configuration (bookphysio.in)

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
- [ ] Storage buckets created with policies
- [ ] Vercel project connected to GitHub repo
- [ ] Vercel environment variables configured
- [ ] DNS records pointed to Vercel
- [ ] Admin user created
- [ ] SSL certificate provisioned (automatic via Vercel)
