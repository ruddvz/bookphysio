-- Distinguish in-person reservation (no Razorpay order) from online checkout rows.
-- Used by webhooks and booking API to avoid treating pay-at-clinic as online payment failure.

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS booking_channel text NOT NULL DEFAULT 'razorpay'
  CHECK (booking_channel IN ('razorpay', 'pay_at_clinic'));

CREATE INDEX IF NOT EXISTS idx_payments_booking_channel ON payments (booking_channel);
