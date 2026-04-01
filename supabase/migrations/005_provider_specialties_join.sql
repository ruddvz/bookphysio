-- Migration: Add provider_specialties join table and migrate data from providers.specialty_ids
-- This enables proper many-to-many joins in PostgREST

-- 1. Create the join table
CREATE TABLE IF NOT EXISTS provider_specialties (
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  specialty_id uuid NOT NULL REFERENCES specialties(id) ON DELETE CASCADE,
  PRIMARY KEY (provider_id, specialty_id)
);

-- 2. Migrate existing data if any (from specialty_ids array to the new table)
INSERT INTO provider_specialties (provider_id, specialty_id)
SELECT id, unnest(specialty_ids)
FROM providers
ON CONFLICT DO NOTHING;

-- 3. Enable RLS on the new table
ALTER TABLE provider_specialties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view provider specialties"
  ON provider_specialties FOR SELECT
  USING (true);

-- 4. Create an index for performance
CREATE INDEX IF NOT EXISTS idx_provider_specialties_specialty_id ON provider_specialties(specialty_id);
