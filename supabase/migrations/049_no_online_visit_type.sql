-- Product has no online/telehealth appointments — only in_clinic and home_visit.
-- Reverts visit_type allowed values from 047 and strips `online` from location arrays.

-- Appointments: migrate legacy `online` rows, then tighten CHECK
UPDATE public.appointments
  SET visit_type = 'in_clinic'
  WHERE visit_type = 'online';

DO $$
DECLARE
  cname text;
BEGIN
  SELECT c.conname INTO cname
  FROM pg_constraint c
  WHERE c.conrelid = 'public.appointments'::regclass
    AND c.contype = 'c'
    AND pg_get_constraintdef(c.oid) ILIKE '%visit_type%'
  LIMIT 1;
  IF cname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.appointments DROP CONSTRAINT %I', cname);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.appointments'::regclass
      AND conname = 'appointments_visit_type_check'
  ) THEN
    ALTER TABLE public.appointments
      ADD CONSTRAINT appointments_visit_type_check
      CHECK (visit_type = ANY (ARRAY['in_clinic'::text, 'home_visit'::text]));
  END IF;
END $$;

-- Locations: remove `online` from visit_type arrays; ensure non-empty
UPDATE public.locations
  SET visit_type = array_remove(visit_type, 'online');

UPDATE public.locations
  SET visit_type = '{in_clinic}'::text[]
  WHERE visit_type IS NULL
     OR cardinality(visit_type) = 0
     OR visit_type = '{}';

-- Inline CHECK on `locations` from 001 may have an auto-generated name
DO $$
DECLARE
  cname text;
BEGIN
  SELECT c.conname INTO cname
  FROM pg_constraint c
  WHERE c.conrelid = 'public.locations'::regclass
    AND c.contype = 'c'
    AND pg_get_constraintdef(c.oid) ILIKE '%visit_type%'
  LIMIT 1;
  IF cname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.locations DROP CONSTRAINT %I', cname);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.locations'::regclass
      AND conname = 'locations_visit_type_check'
  ) THEN
    ALTER TABLE public.locations
      ADD CONSTRAINT locations_visit_type_check
      CHECK (visit_type <@ ARRAY['in_clinic'::text, 'home_visit'::text]);
  END IF;
END $$;
