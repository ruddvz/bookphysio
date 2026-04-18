-- 042_provider_approval_state.sql
-- Adds provider_approval_status enum + approval_status column to providers.
-- Backfills: verified=true → 'approved', otherwise 'pending'.
-- Enables proper Pending/Approved/Rejected tabs in the admin queue.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'provider_approval_status') THEN
    CREATE TYPE public.provider_approval_status AS ENUM ('pending', 'approved', 'rejected');
  END IF;
END$$;

ALTER TABLE public.providers
  ADD COLUMN IF NOT EXISTS approval_status public.provider_approval_status NOT NULL DEFAULT 'pending';

-- Backfill existing rows from the verified boolean
UPDATE public.providers
SET approval_status = CASE
  WHEN verified = true THEN 'approved'::public.provider_approval_status
  ELSE 'pending'::public.provider_approval_status
END;

CREATE INDEX IF NOT EXISTS providers_approval_status_idx ON public.providers(approval_status);
