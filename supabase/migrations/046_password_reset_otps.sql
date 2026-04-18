-- 6-digit password reset codes (Resend) — replaces Supabase recovery-link email flow.
-- Server-only access via service role; no RLS policies (same pattern as email_otps).

CREATE TABLE password_reset_otps (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email      text        NOT NULL,
  code       text        NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at    timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX password_reset_otps_lookup_idx
  ON password_reset_otps (email, code)
  WHERE used_at IS NULL;

CREATE INDEX password_reset_otps_email_created_idx
  ON password_reset_otps (email, created_at DESC);

ALTER TABLE password_reset_otps ENABLE ROW LEVEL SECURITY;
