-- Migration 045: Consolidate specialties to 7 core areas
-- Removes: oncology, community, industrial, vestibular
-- Merges: obstetrics + gynaecology → womens

-- 1. Add the merged Women's Health specialty
INSERT INTO specialties (name, slug)
VALUES ('Women''s Health Physiotherapy', 'womens')
ON CONFLICT (slug) DO NOTHING;

-- 2. Remap any provider_specialties rows that referenced obstetrics or gynaecology
UPDATE provider_specialties
SET specialty_id = (SELECT id FROM specialties WHERE slug = 'womens')
WHERE specialty_id IN (
  SELECT id FROM specialties WHERE slug IN ('obstetrics', 'gynaecology')
);

-- 3. Remove the specialties being retired
--    ON DELETE CASCADE on provider_specialties handles any remaining join rows.
DELETE FROM specialties
WHERE slug IN ('oncology', 'community', 'industrial', 'vestibular', 'obstetrics', 'gynaecology');
