-- 031_visit_schedule.sql
-- Adds optional scheduling fields to patient_visits so providers can lay out
-- their week (Mon–Sun, 8am–8pm) on the schedule page. Visits without these
-- fields are unscheduled (after-the-fact records) and don't appear on the grid.

ALTER TABLE patient_visits
  ADD COLUMN IF NOT EXISTS visit_time time,
  ADD COLUMN IF NOT EXISTS fee_inr int CHECK (fee_inr IS NULL OR fee_inr >= 0);

CREATE INDEX IF NOT EXISTS patient_visits_provider_date_idx
  ON patient_visits (provider_id, visit_date)
  WHERE visit_time IS NOT NULL;
