-- Add updated_at column to payments (used by verify route)
ALTER TABLE payments ADD COLUMN IF NOT EXISTS updated_at timestamptz;

-- Index on appointment_id for faster lookups in all payment routes
CREATE INDEX IF NOT EXISTS idx_payments_appointment_id ON payments (appointment_id);
