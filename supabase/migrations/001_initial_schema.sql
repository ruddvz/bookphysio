-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (linked to Supabase auth.users)
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('patient', 'provider', 'admin')),
  full_name text NOT NULL,
  phone text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Specialties lookup
CREATE TABLE specialties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  icon_url text
);

-- Provider profiles
CREATE TABLE providers (
  id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  slug text UNIQUE NOT NULL,
  title text CHECK (title IN ('Dr.', 'PT', 'BPT', 'MPT')),
  icp_registration_no text,
  specialty_ids uuid[] NOT NULL DEFAULT '{}',
  bio text,
  experience_years int CHECK (experience_years >= 0),
  consultation_fee_inr int CHECK (consultation_fee_inr >= 0),
  rating_avg numeric(3,2) NOT NULL DEFAULT 0,
  rating_count int NOT NULL DEFAULT 0,
  verified boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  onboarding_step int NOT NULL DEFAULT 1 CHECK (onboarding_step BETWEEN 1 AND 4),
  gstin text
);

-- Clinic locations
CREATE TABLE locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  pincode char(6) NOT NULL CHECK (pincode ~ '^[1-9][0-9]{5}$'),
  lat numeric(10,7),
  lng numeric(10,7),
  visit_type text[] NOT NULL DEFAULT '{in_clinic}'
    CHECK (visit_type <@ ARRAY['in_clinic','home_visit']::text[])
);

-- Provider availability slots
CREATE TABLE availabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  location_id uuid REFERENCES locations(id) ON DELETE SET NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  slot_duration_mins int NOT NULL DEFAULT 30 CHECK (slot_duration_mins > 0),
  buffer_mins int NOT NULL DEFAULT 0 CHECK (buffer_mins >= 0),
  is_recurring boolean NOT NULL DEFAULT false,
  recurrence_rule text,
  is_booked boolean NOT NULL DEFAULT false,
  is_blocked boolean NOT NULL DEFAULT false,
  CONSTRAINT valid_time_range CHECK (ends_at > starts_at)
);

-- Appointments
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE RESTRICT,
  availability_id uuid NOT NULL REFERENCES availabilities(id) ON DELETE RESTRICT,
  location_id uuid REFERENCES locations(id) ON DELETE SET NULL,
  visit_type text NOT NULL CHECK (visit_type IN ('in_clinic','home_visit')),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','cancelled','completed','no_show')),
  fee_inr int NOT NULL CHECK (fee_inr >= 0),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Payments
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE RESTRICT,
  razorpay_order_id text UNIQUE,
  razorpay_payment_id text,
  amount_inr int NOT NULL CHECK (amount_inr >= 0),
  gst_amount_inr int NOT NULL DEFAULT 0 CHECK (gst_amount_inr >= 0),
  status text NOT NULL DEFAULT 'created'
    CHECK (status IN ('created','paid','failed','refunded')),
  refund_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Provider subscriptions
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  razorpay_subscription_id text UNIQUE,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free','basic','pro')),
  status text NOT NULL DEFAULT 'trial'
    CHECK (status IN ('trial','active','past_due','cancelled')),
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Reviews
CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid UNIQUE NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  provider_reply text,
  is_published boolean NOT NULL DEFAULT true,
  is_flagged boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Provider credential documents
CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('degree','registration','id_proof','photo')),
  storage_path text NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

-- Notifications
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger: auto-create users row on auth.users insert
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, role, full_name, phone, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.phone,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger: update provider rating on new review
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE providers SET
    rating_avg = (SELECT AVG(rating)::numeric(3,2) FROM reviews WHERE provider_id = NEW.provider_id AND is_published = true),
    rating_count = (SELECT COUNT(*) FROM reviews WHERE provider_id = NEW.provider_id AND is_published = true)
  WHERE id = NEW.provider_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_created
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_provider_rating();
