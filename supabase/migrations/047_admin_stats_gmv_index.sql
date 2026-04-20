-- Speeds up admin GMV aggregate (SUM of fee_inr for completed visits).
-- Partial index: only completed rows carry billable fees for this metric.

CREATE INDEX IF NOT EXISTS idx_appointments_completed_fee_inr
  ON appointments (fee_inr)
  WHERE status = 'completed';
