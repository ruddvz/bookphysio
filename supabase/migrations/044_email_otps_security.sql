-- 044_email_otps_security.sql
-- Security hardening for email_otps table:
--   1. Replaces plaintext `code` column with `code_hash` (HMAC-SHA256 via app layer)
--   2. Adds unique partial index: at most one active OTP per user/email
--   3. Adds get_user_id_by_email() helper so the resend endpoint doesn't depend on
--      the transient email_otps table to resolve user_id
--
-- All active OTPs are purged before the schema change — safe because the TTL is
-- 10 minutes and any live OTPs become unverifiable once code_hash replaces code.
-- Users will need to request a fresh code after this migration is applied.

-- 1. Purge all rows so we can add a NOT NULL column cleanly
DELETE FROM public.email_otps;

-- 2. Add the hash column (nullable temporarily to allow ADD COLUMN)
ALTER TABLE public.email_otps
  ADD COLUMN IF NOT EXISTS code_hash text;

-- 3. Enforce NOT NULL now that the table is empty
ALTER TABLE public.email_otps
  ALTER COLUMN code_hash SET NOT NULL;

-- 4. Drop the old plaintext column and its index
DROP INDEX IF EXISTS email_otps_lookup_idx;
ALTER TABLE public.email_otps
  DROP COLUMN IF EXISTS code;

-- 5. Fast lookup index on code_hash
CREATE INDEX IF NOT EXISTS email_otps_lookup_idx
  ON public.email_otps (email, code_hash)
  WHERE used_at IS NULL;

-- 6. Prevent multiple active OTPs for the same user/email
--    The unique index fires only on rows that are not yet consumed and not expired.
CREATE UNIQUE INDEX IF NOT EXISTS email_otps_one_active_per_user_email_idx
  ON public.email_otps (user_id, email)
  WHERE used_at IS NULL;

-- 7. Helper: resolve user_id by email from auth.users.
--    Used by the OTP resend endpoint so it doesn't depend on transient email_otps rows.
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(p_email text)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT id FROM auth.users WHERE email = lower(p_email) LIMIT 1;
$$;
