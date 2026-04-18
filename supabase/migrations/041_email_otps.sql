-- Email OTPs for doctor signup verification
-- Supabase's built-in email mailer is disabled for this project (all email via Resend).
-- This table stores short-lived 6-digit codes used to confirm provider email addresses.

CREATE TABLE email_otps (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email      text        NOT NULL,
  code       text        NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at    timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Fast lookup during verification
CREATE INDEX email_otps_lookup_idx ON email_otps (email, code) WHERE used_at IS NULL;
-- For finding user_id on resend
CREATE INDEX email_otps_user_email_idx ON email_otps (email, created_at DESC);

ALTER TABLE email_otps ENABLE ROW LEVEL SECURITY;
-- No public policies — all access goes through the service-role key (server-side only).
