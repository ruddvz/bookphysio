DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'providers'
      AND column_name = 'icp_registration_no'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'providers'
      AND column_name = 'iap_registration_no'
  ) THEN
    ALTER TABLE public.providers
      RENAME COLUMN icp_registration_no TO iap_registration_no;
  END IF;
END $$;
