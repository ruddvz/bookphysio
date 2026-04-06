# bookphysio.in — Manual Release Checklist

Only the tasks that require external dashboard access are listed here.

If you want the shortest path, do only the `Required Now` section first.

---

## Required Now

### 1. Apply Supabase migrations 025–029

Reason: these include security fixes and the public availability privacy fix. The app code is already green locally, but production is not fully safe until these DB changes are applied.

Important:
- The `supabase/migrations/` folder is the full history of the database, not a checklist of things to rerun on every deploy.
- If you are creating a brand-new database, you apply all migrations from the beginning.
- If you are updating the existing production database, you apply only the migrations that have not already been run there.
- For this project, the production database is already in use, so the pending forward migrations are `025` through `029`, not `001` through `029` again.

Project:
- Supabase project ref: `wcihggtkdflyjkbqajvg`
- Dashboard URL pattern: `https://supabase.com/dashboard/project/wcihggtkdflyjkbqajvg`

Optional verification first:
Run this in Supabase SQL Editor if you want to see which migrations are already recorded on production:

```sql
select version, name
from supabase_migrations.schema_migrations
order by version;
```

How to do it:
1. Open the Supabase dashboard for the production project.
2. Go to `SQL Editor`.
3. Click `New query`.
4. In VS Code, open each file below, copy its full contents, paste into the SQL editor, and click `Run`.
5. Wait for success before moving to the next file.
6. Run them in this exact order:

Required migration files:
- `supabase/migrations/025_fix_handle_new_user_role.sql`
- `supabase/migrations/026_incremental_rating_trigger.sql`
- `supabase/migrations/027_notifications_ttl.sql`
- `supabase/migrations/028_payments_gateway_column.sql`
- `supabase/migrations/029_restrict_public_availability_read.sql`

What they do:
- `025`: blocks admin-role escalation during signup.
- `026`: switches provider ratings to an incremental update model.
- `027`: adds notification expiry and cleanup support.
- `028`: adds the `payments.gateway` column.
- `029`: restricts public availability reads to unbooked slots for verified active providers.

If any migration fails:
- Stop.
- Copy the exact SQL error.
- Bring it back here and I can help you fix it.

### 2. Deploy the verified code

After the migrations succeed, deploy the repo state.

If you want to do it yourself:
```bash
git push
```

Vercel auto-deploys on push.

If you prefer, tell me once step 1 is done and I can handle the deploy-side work from here.

---

## Optional But Recommended After Release

### 3. Enable notification cleanup cron

Only after migration `027` is applied.

In Supabase Dashboard → `SQL Editor`, run:

```sql
SELECT cron.schedule('cleanup-notifications', '0 3 * * *', 'SELECT cleanup_expired_notifications()');
```

If `pg_cron` is not enabled yet:
1. Go to `Database` → `Extensions`
2. Enable `pg_cron`
3. Re-run the SQL above

### 4. Add a JWT role custom claim hook

Reason: removes one DB round-trip on authenticated requests.

In Supabase Dashboard:
1. Go to `Authentication` → `Hooks`
2. Add a custom access token hook
3. Inject the user `role` claim into the JWT payload

This is a performance improvement, not a release blocker.

---

## External Follow-Up

### 5. Add the `www` DNS record

At your domain registrar, add:

```text
A  www.bookphysio.in  -> 76.76.21.21
```

Or move DNS fully to Vercel nameservers if you want Vercel to manage this.

### 6. Submit the site to Google Search Console

1. Go to `https://search.google.com/search-console`
2. Add property: `bookphysio.in`
3. Verify ownership
4. Submit sitemap: `https://bookphysio.in/sitemap.xml`

### 7. Submit the site to Bing Webmaster Tools

1. Go to `https://www.bing.com/webmasters`
2. Add site: `bookphysio.in`
3. Submit sitemap: `https://bookphysio.in/sitemap.xml`

### 8. Add real production provider data

Production currently returns zero search results because there are no real providers in the live DB.

Do this only when you have real provider records ready.

Options:
- Supabase Dashboard → `Table Editor` → `providers`
- Apply a reviewed production-safe seed/import process

Do not run the current `supabase/seed.sql` on production unless you explicitly want mock/demo-like records there.

---

## Fastest Real-World Order

1. Apply migrations `025` → `029` in Supabase SQL Editor.
2. Tell me they succeeded, or paste the first error if one fails.
3. Then deploy the verified code.
4. Do SEO/DNS/provider-data follow-up later.
