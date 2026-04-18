-- Safe shortening: only adjusts sequence pointers for new users.
-- Existing display_ids (if any) are never rewritten.

DO $$
DECLARE
  existing_count integer;
BEGIN
  SELECT COUNT(*) INTO existing_count FROM users WHERE display_id IS NOT NULL;

  IF existing_count = 0 THEN
    ALTER SEQUENCE provider_display_id_seq RESTART WITH 100000;
    ALTER SEQUENCE patient_display_id_seq  RESTART WITH 1000000;
  ELSE
    IF (SELECT last_value FROM provider_display_id_seq) < 100000 THEN
      ALTER SEQUENCE provider_display_id_seq RESTART WITH 100000;
    END IF;
    IF (SELECT last_value FROM patient_display_id_seq) < 1000000 THEN
      ALTER SEQUENCE patient_display_id_seq RESTART WITH 1000000;
    END IF;
  END IF;
END $$;
