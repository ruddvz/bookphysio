-- Booking idempotency + one active reservation per availability slot
-- client_request_id: stable key from client for safe retries (same booking = same id)
-- Partial unique on availability: at most one pending/confirmed appointment per slot

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS client_request_id uuid;

CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_client_request_id
  ON appointments (client_request_id)
  WHERE client_request_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_one_active_booking_per_slot
  ON appointments (availability_id)
  WHERE status IN ('pending', 'confirmed');
