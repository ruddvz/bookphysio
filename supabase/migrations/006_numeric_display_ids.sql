-- Migration: Implement professional 8/9-digit display IDs
-- Doctors: 8 digits starting from 10000000
-- Patients: 9 digits starting from 900000000

-- 1. Create sequences
CREATE SEQUENCE IF NOT EXISTS provider_display_id_seq START WITH 10000000;
CREATE SEQUENCE IF NOT EXISTS patient_display_id_seq START WITH 900000000;

-- 2. Add display_id column to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_id bigint UNIQUE;

-- 3. Update existing users (if any)
-- This logic assumes we can assign them in any order for now
DO $$
DECLARE
    r record;
BEGIN
    FOR r IN SELECT id, role FROM users WHERE display_id IS NULL LOOP
        IF r.role = 'provider' THEN
            UPDATE users SET display_id = nextval('provider_display_id_seq') WHERE id = r.id;
        ELSIF r.role = 'patient' THEN
            UPDATE users SET display_id = nextval('patient_display_id_seq') WHERE id = r.id;
        END IF;
    END LOOP;
END;
$$;

-- 4. Update the trigger function to auto-assign display_id
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    target_role text;
    new_display_id bigint;
BEGIN
  target_role := COALESCE(NEW.raw_user_meta_data->>'role', 'patient');
  
  -- Assign sequential ID based on role
  IF target_role = 'provider' THEN
    new_display_id := nextval('provider_display_id_seq');
  ELSIF target_role = 'patient' THEN
    new_display_id := nextval('patient_display_id_seq');
  ELSE
    new_display_id := null; -- Admins or others can stay null or have another seq
  END IF;

  INSERT INTO users (id, role, full_name, phone, avatar_url, display_id)
  VALUES (
    NEW.id,
    target_role,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.phone,
    NEW.raw_user_meta_data->>'avatar_url',
    new_display_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
