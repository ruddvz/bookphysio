-- Clinical Records: SOAP notes, visits, and clinical profiles
-- Visit numbering is per (provider_id, patient_id) pair
-- Patient_id may reference an existing platform user OR be a provider-owned record (patient_user_id NULL)

CREATE TABLE patient_clinical_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  patient_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  patient_name text NOT NULL,
  patient_phone text,
  patient_age int CHECK (patient_age IS NULL OR (patient_age >= 0 AND patient_age <= 130)),
  patient_gender text CHECK (patient_gender IS NULL OR patient_gender IN ('male','female','other')),
  chief_complaint text,
  medical_history text,
  contraindications text,
  treatment_goals text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX patient_clinical_profiles_provider_user_unique
  ON patient_clinical_profiles(provider_id, patient_user_id)
  WHERE patient_user_id IS NOT NULL;

CREATE INDEX patient_clinical_profiles_provider_idx
  ON patient_clinical_profiles(provider_id);

CREATE TABLE patient_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES patient_clinical_profiles(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  visit_number int NOT NULL CHECK (visit_number > 0),
  visit_date date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(profile_id, visit_number)
);

CREATE INDEX patient_visits_profile_idx ON patient_visits(profile_id);
CREATE INDEX patient_visits_provider_date_idx ON patient_visits(provider_id, visit_date DESC);

CREATE TABLE clinical_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id uuid NOT NULL UNIQUE REFERENCES patient_visits(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES patient_clinical_profiles(id) ON DELETE CASCADE,
  subjective text,
  pain_scale int CHECK (pain_scale IS NULL OR (pain_scale >= 0 AND pain_scale <= 10)),
  range_of_motion text,
  functional_tests text,
  objective_notes text,
  assessment text,
  plan text,
  patient_summary text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX clinical_notes_provider_idx ON clinical_notes(provider_id);
CREATE INDEX clinical_notes_profile_idx ON clinical_notes(profile_id);

-- Trigger: keep updated_at fresh
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER patient_clinical_profiles_touch BEFORE UPDATE ON patient_clinical_profiles
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER clinical_notes_touch BEFORE UPDATE ON clinical_notes
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- RLS
ALTER TABLE patient_clinical_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_notes ENABLE ROW LEVEL SECURITY;

-- Providers full access on their own rows
CREATE POLICY "clinical_profiles_provider_all" ON patient_clinical_profiles
  FOR ALL USING (provider_id = auth.uid()) WITH CHECK (provider_id = auth.uid());

CREATE POLICY "patient_visits_provider_all" ON patient_visits
  FOR ALL USING (provider_id = auth.uid()) WITH CHECK (provider_id = auth.uid());

CREATE POLICY "clinical_notes_provider_all" ON clinical_notes
  FOR ALL USING (provider_id = auth.uid()) WITH CHECK (provider_id = auth.uid());

-- Patients can read their own clinical_notes (server API additionally filters fields)
CREATE POLICY "clinical_notes_patient_read" ON clinical_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patient_clinical_profiles p
      WHERE p.id = clinical_notes.profile_id
        AND p.patient_user_id = auth.uid()
    )
  );

CREATE POLICY "patient_visits_patient_read" ON patient_visits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patient_clinical_profiles p
      WHERE p.id = patient_visits.profile_id
        AND p.patient_user_id = auth.uid()
    )
  );

CREATE POLICY "clinical_profiles_patient_read" ON patient_clinical_profiles
  FOR SELECT USING (patient_user_id = auth.uid());

-- Helper: next visit number for a profile (atomic via SELECT FOR UPDATE in app code)
CREATE OR REPLACE FUNCTION next_visit_number(p_profile_id uuid)
RETURNS int LANGUAGE plpgsql AS $$
DECLARE
  next_num int;
BEGIN
  SELECT COALESCE(MAX(visit_number), 0) + 1 INTO next_num
  FROM patient_visits
  WHERE profile_id = p_profile_id;
  RETURN next_num;
END;
$$;
