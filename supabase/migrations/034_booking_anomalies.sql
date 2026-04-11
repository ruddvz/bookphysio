-- Booking anomaly detection flags
-- Populated by the AI anomaly detection system after each booking

CREATE TABLE IF NOT EXISTS booking_anomalies (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id  uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id      uuid NOT NULL,
  provider_id     uuid NOT NULL,
  severity        text NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  reason          text NOT NULL,
  rule_flags      jsonb NOT NULL DEFAULT '[]'::jsonb,
  reviewed        boolean NOT NULL DEFAULT false,
  reviewed_by     uuid REFERENCES users(id),
  reviewed_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_booking_anomalies_appointment ON booking_anomalies (appointment_id);
CREATE INDEX IF NOT EXISTS idx_booking_anomalies_unreviewed
  ON booking_anomalies (
    reviewed,
    (
      CASE severity
        WHEN 'high' THEN 3
        WHEN 'medium' THEN 2
        WHEN 'low' THEN 1
        ELSE 0
      END
    ) DESC
  )
  WHERE NOT reviewed;

-- RLS: only admin users can read anomalies
ALTER TABLE booking_anomalies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can read booking anomalies"
  ON booking_anomalies FOR SELECT
  USING (
    auth_role() = 'admin'
  );

CREATE POLICY "Admin users can update booking anomalies"
  ON booking_anomalies FOR UPDATE
  USING (
    auth_role() = 'admin'
  );
