-- Migration 040: Ensure provider_pending role and schema correctness
-- Root-cause fix for the physio signup 500 error.
--
-- What was broken:
--   admin.createUser() passes role='provider_pending' in user_metadata.
--   The handle_new_user trigger (migration 001) blindly copies this value into
--   users.role. The original CHECK constraint only allows 'patient', 'provider',
--   'admin', so inserting 'provider_pending' raises a constraint violation.
--   Supabase rolls back the auth.users INSERT and returns HTTP 500.
--
-- This migration is fully idempotent — safe to apply even if 036_provider_pending_role
-- was already applied or partially applied on a non-production environment.

-- ── 1. Expand users.role CHECK to include provider_pending ────────────────────
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users
  ADD CONSTRAINT users_role_check
    CHECK (role IN ('patient', 'provider', 'provider_pending', 'admin'));

-- ── 2. Replace handle_new_user trigger function ────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role text;
BEGIN
  v_role := CASE
    WHEN NEW.raw_user_meta_data->>'role' = 'provider'         THEN 'provider'
    WHEN NEW.raw_user_meta_data->>'role' = 'provider_pending' THEN 'provider_pending'
    ELSE 'patient'
  END;

  INSERT INTO public.users (id, role, full_name, phone, avatar_url)
  VALUES (
    NEW.id,
    v_role,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.phone,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 3. Relax locations.pincode so home-visit providers (no physical clinic) ──
--       can have a NULL pincode instead of an empty-string CHECK violation.
ALTER TABLE public.locations
  ALTER COLUMN pincode DROP NOT NULL,
  ALTER COLUMN pincode TYPE text USING pincode::text;

ALTER TABLE public.locations
  DROP CONSTRAINT IF EXISTS locations_pincode_check;

ALTER TABLE public.locations
  ADD CONSTRAINT locations_pincode_check
    CHECK (pincode IS NULL OR pincode = '' OR pincode ~ '^[1-9][0-9]{5}$');

-- ── 4. Ensure providers.certifications column exists ──────────────────────────
--       (idempotent backfill in case migrations 038/039 weren't applied yet)
ALTER TABLE public.providers
  ADD COLUMN IF NOT EXISTS certifications text[] NOT NULL DEFAULT '{}';

-- ── 5. Ensure locations.modalities column exists ─────────────────────────────
ALTER TABLE public.locations
  ADD COLUMN IF NOT EXISTS modalities text[] NOT NULL DEFAULT '{}';
