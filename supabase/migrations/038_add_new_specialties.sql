-- Migration 038: Add new physiotherapy specialties identified in NCAHP research
-- Adds: Oncology, Community, Industrial/Occupational, and Vestibular Physiotherapy

INSERT INTO specialties (name, slug) VALUES
  ('Oncology Physiotherapy', 'oncology'),
  ('Community Physiotherapy', 'community'),
  ('Industrial & Occupational Physiotherapy', 'industrial'),
  ('Vestibular Physiotherapy', 'vestibular')
ON CONFLICT (slug) DO NOTHING;
