# Scripts

One-shot Node scripts run from the repo root with `node scripts/<name>.mjs`.

## `seed-demo-data.mjs`

Seeds **demo** data (12 fictional providers, 3 patients, 1 admin) into a
Supabase project. Useful for staging, local dev, or a quick "looks alive"
pass on a fresh production database. All emails are `@demo.bookphysio.in`.

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<service-role-key> \
BOOKPHYSIO_DEMO_PASSWORD='<strong-12+-char-password>' \
BOOKPHYSIO_DEMO_SEED_CONFIRM=seed-demo-users \
node scripts/seed-demo-data.mjs
```

The script is idempotent on email — re-running skips users that already
exist. Demo providers are created with `verified=true, active=true`, so
they appear in `/search` immediately.

## `import-providers-csv.mjs`

Imports **real, vetted physiotherapists** from a CSV file. Use this for
production rollouts where you have a curated list of practitioners.

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<service-role-key> \
BOOKPHYSIO_IMPORT_PASSWORD='<strong-12+-char-temp-password>' \
BOOKPHYSIO_IMPORT_CONFIRM=import-providers \
node scripts/import-providers-csv.mjs --csv data/providers.csv
```

Flags:

| Flag | Effect |
|---|---|
| `--csv <path>` | **Required.** CSV file path (relative to cwd). |
| `--dry-run` | Parse + validate every row, print errors with row numbers, no DB writes. Skips the password / confirm env requirements. |
| `--auto-approve` | Set `verified=true, active=true` so providers appear in `/search` immediately. **Default is `false`** — providers wait for admin approval. |

CSV format and required columns are documented in the file header of
`scripts/import-providers-csv.mjs`. A sample is in
[`data/providers.sample.csv`](../data/providers.sample.csv).

**Recommended workflow:**

1. Validate locally with `--dry-run` against a stub Supabase URL.
2. Import to staging with the real staging keys, no `--auto-approve`.
3. Spot-check the admin panel.
4. Import to production with the same CSV.
5. Approve providers in batches from `/admin`.

The script is idempotent on email: re-running with the same CSV will
skip existing auth users and re-upsert their `providers` row. It does
**not** dedupe locations — rerunning will add a second `locations` row
for each provider, so clean up first if you need to reimport.

## `ping-indexnow.mjs`

Pings IndexNow with the canonical sitemap. Run after a deploy that
changes public URLs. See `scripts/ping-indexnow.test.ts` for behavior.

## `ui-audit.mjs`

Captures multi-breakpoint screenshots via Playwright. Used during
UI polish phases.

## `migrate-colors.mjs` / `replace_icp.js`

Historical one-shots from earlier refactors. Kept for reference.
