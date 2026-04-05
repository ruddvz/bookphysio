-- Migration: Add gateway column to payments table
-- Enables future multi-gateway support (PhonePe, Cashfree, etc.)
-- without making historical Razorpay records ambiguous.
-- All existing rows default to 'razorpay'.

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS gateway text NOT NULL DEFAULT 'razorpay'
    CHECK (gateway IN ('razorpay', 'phonepe', 'cashfree', 'paytm'));

-- Index for gateway-specific queries (e.g., reconciliation jobs per gateway)
CREATE INDEX IF NOT EXISTS idx_payments_gateway ON payments (gateway);
