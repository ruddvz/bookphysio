# bookphysio.in — Manual TODO

Things that require access outside the codebase (Supabase Dashboard, DNS, Google Console, etc.)

---

## 1. Push to Vercel (run this now)

```bash
git push
```

Vercel auto-deploys on push. You currently have 2 commits ahead of origin.

---

## 2. Apply DB Migrations (Supabase Dashboard → SQL Editor)

Run these **in order**. Each file is in `supabase/migrations/`.

### 025 — Security: Block admin privilege escalation via signup (CRITICAL — do this first)
```
supabase/migrations/025_fix_handle_new_user_role.sql
```
Fixes a hole where any user could set `role: 'admin'` in signup metadata. After this, only `'provider'` is whitelisted from metadata; everything else defaults to `'patient'`.

### 026 — Performance: Incremental rating trigger
```
supabase/migrations/026_incremental_rating_trigger.sql
```
Replaces a full `SELECT AVG(rating)` table scan on every review insert with an O(1) running-total approach. Includes a one-time backfill of `rating_sum` from existing reviews — safe to run on live data.

### 027 — Maintenance: Notifications TTL + cleanup function
```
supabase/migrations/027_notifications_ttl.sql
```
Adds a 90-day expiry to notifications. Creates `cleanup_expired_notifications()` function.

### 028 — Feature: Payments gateway column
```
supabase/migrations/028_payments_gateway_column.sql
```
Adds `gateway` column to `payments` table (default `'razorpay'`). Needed for future multi-gateway support.

---

## 3. Enable Notification Cleanup Cron (optional — after applying 027)

In Supabase Dashboard → SQL Editor, run:

```sql
SELECT cron.schedule('cleanup-notifications', '0 3 * * *', 'SELECT cleanup_expired_notifications()');
```

Only works if the `pg_cron` extension is enabled (Database → Extensions → pg_cron → Enable).

---

## 4. JWT Custom Claim for Role (performance win — no code needed)

In Supabase Dashboard → **Authentication → Hooks**, add a custom access token hook that injects `role` into the JWT payload. This eliminates a DB round-trip on every authenticated request (RLS policies currently call `auth_role()` which queries the DB).

Supabase has a built-in hook editor for this — no migrations needed.

---

## 5. DNS: Add www subdomain

At your domain registrar, add:
```
A  www.bookphysio.in  →  76.76.21.21
```
Or point nameservers to Vercel's nameservers (preferred — lets Vercel manage SSL).

---

## 6. Google Search Console

1. Go to https://search.google.com/search-console
2. Add property: `bookphysio.in`
3. Verify via DNS TXT record or HTML file
4. Submit sitemap: `https://bookphysio.in/sitemap.xml`

---

## 7. Bing Webmaster Tools

1. Go to https://www.bing.com/webmasters
2. Add site: `bookphysio.in`
3. Submit sitemap: `https://bookphysio.in/sitemap.xml`

---

## 8. Seed Production Provider Data

The production DB currently returns zero results from `/api/providers`. Once you have real providers, they need to be inserted via:
- Supabase Dashboard → Table Editor → `providers`
- Or run `supabase/seed.sql` against production (review it first — it inserts mock data)

---

## Status

| # | Task | Priority |
|---|------|----------|
| 1 | `git push` | Do now |
| 2 | Apply migration 025 | Critical (security) |
| 2 | Apply migrations 026–028 | High (performance/feature) |
| 3 | pg_cron cleanup schedule | Low |
| 4 | JWT custom claim hook | Medium (performance) |
| 5 | www DNS | Medium |
| 6 | Google Search Console | Medium |
| 7 | Bing Webmaster | Low |
| 8 | Seed providers | When ready |
