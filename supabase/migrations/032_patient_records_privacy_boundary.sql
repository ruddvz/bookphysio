DROP POLICY IF EXISTS "clinical_notes_patient_read" ON clinical_notes;
DROP POLICY IF EXISTS "patient_visits_patient_read" ON patient_visits;
DROP POLICY IF EXISTS "clinical_profiles_patient_read" ON patient_clinical_profiles;

CREATE OR REPLACE FUNCTION public.get_patient_facing_records()
RETURNS TABLE (
  visit_id uuid,
  visit_number int,
  visit_date date,
  provider_name text,
  plan text,
  patient_summary text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    visits.id AS visit_id,
    visits.visit_number,
    visits.visit_date,
    COALESCE(NULLIF(BTRIM(users.full_name), ''), 'Provider') AS provider_name,
    notes.plan,
    notes.patient_summary
  FROM patient_clinical_profiles profiles
  INNER JOIN patient_visits visits
    ON visits.profile_id = profiles.id
  LEFT JOIN clinical_notes notes
    ON notes.visit_id = visits.id
  LEFT JOIN users
    ON users.id = visits.provider_id
  WHERE profiles.patient_user_id = auth.uid()
  ORDER BY visits.visit_date DESC, visits.visit_number DESC, visits.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.get_patient_facing_records() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_patient_facing_records() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_patient_facing_records() TO service_role;