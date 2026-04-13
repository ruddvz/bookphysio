-- Migration: Allow 'pay_at_clinic' as a payment gateway
-- so we always have a payment record even when the patient pays in person.

ALTER TABLE payments
  DROP CONSTRAINT IF EXISTS payments_gateway_check;

ALTER TABLE payments
  ADD CONSTRAINT payments_gateway_check
    CHECK (gateway IN ('razorpay', 'phonepe', 'cashfree', 'paytm', 'pay_at_clinic'));
