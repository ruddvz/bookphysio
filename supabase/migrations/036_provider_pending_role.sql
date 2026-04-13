-- Migration: Allow 'provider_pending' as a valid user role
-- The provider onboarding flow sets role='provider_pending' so new providers
-- remain in a pending state until an admin approves the listing. The existing
-- CHECK constraint only permits 'patient', 'provider', and 'admin'.

-- 1. Expand the CHECK constraint on users.role
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('patient', 'provider', 'provider_pending', 'admin'));

-- 2. Update handle_new_user trigger to whitelist 'provider_pending'
-- so that signups with role='provider_pending' in user_metadata are accepted.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role text;
BEGIN
  v_role := CASE
    WHEN NEW.raw_user_meta_data->>'role' = 'provider' THEN 'provider'
    WHEN NEW.raw_user_meta_data->>'role' = 'provider_pending' THEN 'provider_pending'
    ELSE 'patient'
  END;

  INSERT INTO users (id, role, full_name, phone, avatar_url)
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
