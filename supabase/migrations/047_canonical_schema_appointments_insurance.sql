-- 047: Align with canonical public schema: insurance + telehealth, online visit type,
--      location modalities bridge, and booking_anomalies user FKs.
-- Idempotent where possible for environments that partially match already.

-- ── Insurances (dropped in 023 for legacy “coverage” — reintroduced as optional FK on appointments)
CREATE TABLE IF NOT EXISTS public.insurances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  logo_url text
);

ALTER TABLE public.insurances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "insurances_public_read" ON public.insurances;
CREATE POLICY "insurances_public_read" ON public.insurances FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.provider_insurances (
  provider_id uuid NOT NULL REFERENCES public.providers (id) ON DELETE CASCADE,
  insurance_id uuid NOT NULL REFERENCES public.insurances (id) ON DELETE CASCADE,
  PRIMARY KEY (provider_id, insurance_id)
);

ALTER TABLE public.provider_insurances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "provider_insurances_public_read" ON public.provider_insurances;
CREATE POLICY "provider_insurances_public_read" ON public.provider_insurances FOR SELECT USING (true);

-- ── Appointments: allow online + optional insurance and telehealth room
ALTER TABLE public.appointments
  DROP CONSTRAINT IF EXISTS appointments_visit_type_check;

ALTER TABLE public.appointments
  ADD CONSTRAINT appointments_visit_type_check
  CHECK (visit_type = ANY (ARRAY['in_clinic'::text, 'home_visit'::text, 'online'::text]));

ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS insurance_id uuid,
  ADD COLUMN IF NOT EXISTS telehealth_room_id text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.appointments'::regclass
      AND conname = 'appointments_insurance_id_fkey'
  ) THEN
    ALTER TABLE public.appointments
      ADD CONSTRAINT appointments_insurance_id_fkey
      FOREIGN KEY (insurance_id) REFERENCES public.insurances (id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_appointments_insurance_id ON public.appointments (insurance_id)
  WHERE insurance_id IS NOT NULL;

-- ── Location modalities (per-location list — complements locations.modalities array in 040)
CREATE TABLE IF NOT EXISTS public.location_modalities (
  location_id uuid NOT NULL REFERENCES public.locations (id) ON DELETE CASCADE,
  modality text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (location_id, modality)
);

CREATE INDEX IF NOT EXISTS idx_location_modalities_modality ON public.location_modalities (modality);

ALTER TABLE public.location_modalities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "location_modalities_public_read" ON public.location_modalities;
CREATE POLICY "location_modalities_public_read" ON public.location_modalities
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.locations l
      JOIN public.providers p ON p.id = l.provider_id
      WHERE l.id = location_id
        AND p.verified = true
        AND p.active = true
    )
    OR EXISTS (
      SELECT 1
      FROM public.locations l
      WHERE l.id = location_id
        AND (l.provider_id = auth.uid() OR public.auth_role() = 'admin')
    )
  );

-- ── booking_anomalies: enforce user FKs (matches ORM / integrity expectations)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.booking_anomalies'::regclass
      AND conname = 'booking_anomalies_patient_id_fkey'
  ) THEN
    ALTER TABLE public.booking_anomalies
      ADD CONSTRAINT booking_anomalies_patient_id_fkey
      FOREIGN KEY (patient_id) REFERENCES public.users (id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.booking_anomalies'::regclass
      AND conname = 'booking_anomalies_provider_id_fkey'
  ) THEN
    ALTER TABLE public.booking_anomalies
      ADD CONSTRAINT booking_anomalies_provider_id_fkey
      FOREIGN KEY (provider_id) REFERENCES public.providers (id);
  END IF;
END $$;
