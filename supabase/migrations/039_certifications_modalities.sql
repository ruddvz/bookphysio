-- Migration 039: Add certifications and modalities fields to provider tables
-- certifications: skill-based clinical certifications (MIAP, McKenzie, Mulligan, etc.)
-- modalities: equipment/technology available at the clinic

ALTER TABLE providers
  ADD COLUMN IF NOT EXISTS certifications text[] NOT NULL DEFAULT '{}';

ALTER TABLE provider_locations
  ADD COLUMN IF NOT EXISTS modalities text[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN providers.certifications IS 'Skill-based certifications: MIAP, McKenzie, Mulligan, Maitland, COMT, CDNT, CKTT';
COMMENT ON COLUMN provider_locations.modalities IS 'Clinic equipment: Laser Therapy, Shockwave, PEMF, Traction Unit, CPM, Hydrotherapy, etc.';
