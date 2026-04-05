-- Migration: Block admin role escalation via signup metadata
-- A user signing up with role='admin' in raw_user_meta_data would previously
-- receive admin privileges. Only 'patient' and 'provider' are allowed from signup.
-- Admins must be promoted via the admin console directly in the DB.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role text;
BEGIN
  -- Whitelist allowed signup roles; anything else (including 'admin') defaults to 'patient'
  v_role := CASE
    WHEN NEW.raw_user_meta_data->>'role' = 'provider' THEN 'provider'
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
