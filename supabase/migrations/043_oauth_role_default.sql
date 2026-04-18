-- 043_oauth_role_default.sql
-- Ensures Google OAuth users always get role='patient'.
--
-- Problem: if an older trigger version ran before migration 040, a Google user
-- might have been inserted with role='provider_pending' (because user_metadata.role
-- was blank and the old trigger defaulted to 'provider_pending').
--
-- Fix 1: Backfill existing OAuth users with the wrong role.
-- Fix 2: Re-create handle_new_user to explicitly check app_metadata.provider
--        and add ON CONFLICT DO NOTHING to handle trigger race conditions.

-- Backfill: correct any Google OAuth users who were incorrectly set to provider_pending
UPDATE public.users u
SET role = 'patient'
FROM auth.users au
WHERE u.id = au.id
  AND au.raw_app_meta_data->>'provider' = 'google'
  AND u.role = 'provider_pending';

-- Re-create handle_new_user with OAuth-aware role logic
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role text;
BEGIN
  v_role := CASE
    -- OAuth providers (Google, GitHub, etc.) always start as patients
    WHEN NEW.raw_app_meta_data->>'provider' IN ('google', 'github', 'apple') THEN 'patient'
    -- Explicit role from user_metadata (set by onboard-signup for providers)
    WHEN NEW.raw_user_meta_data->>'role' = 'provider'         THEN 'provider'
    WHEN NEW.raw_user_meta_data->>'role' = 'provider_pending' THEN 'provider_pending'
    -- Default: patient
    ELSE 'patient'
  END;

  INSERT INTO public.users (id, role, full_name, phone, avatar_url)
  VALUES (
    NEW.id,
    v_role,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.phone,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
