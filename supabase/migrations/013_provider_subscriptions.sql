-- Provider subscription plans
-- Free: 0/month — 5 booking requests, basic listing
-- Pro: ₹100/month — unlimited requests, priority search, analytics
-- Max: ₹200/month — Pro + featured badge, multiple locations, SMS alerts

CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'max');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired', 'pending');

CREATE TABLE provider_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  tier subscription_tier NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'active',
  -- Billing cycle
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz,
  -- Payment reference (Razorpay will be wired later)
  razorpay_subscription_id text,
  razorpay_payment_link_id text,
  -- Limits
  booking_requests_used int NOT NULL DEFAULT 0,
  booking_requests_limit int NOT NULL DEFAULT 5, -- 5 for free, NULL for paid
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider_id) -- one active subscription per provider
);

-- Ensure updated_at stays current
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_subscription_updated_at
  BEFORE UPDATE ON provider_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_subscription_updated_at();

-- Every new provider gets a free subscription automatically
CREATE OR REPLACE FUNCTION create_free_subscription()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO provider_subscriptions (provider_id, tier, status, booking_requests_limit)
  VALUES (NEW.id, 'free', 'active', 5)
  ON CONFLICT (provider_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_provider_free_subscription
  AFTER INSERT ON providers
  FOR EACH ROW EXECUTE FUNCTION create_free_subscription();

-- RLS
ALTER TABLE provider_subscriptions ENABLE ROW LEVEL SECURITY;

-- Providers can read their own subscription
CREATE POLICY "sub_provider_read" ON provider_subscriptions
  FOR SELECT USING (
    provider_id = auth.uid()
  );

-- Only service-role (admin API) can insert/update
CREATE POLICY "sub_admin_write" ON provider_subscriptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Index
CREATE INDEX idx_subscriptions_provider_id ON provider_subscriptions (provider_id);
CREATE INDEX idx_subscriptions_status ON provider_subscriptions (status);
