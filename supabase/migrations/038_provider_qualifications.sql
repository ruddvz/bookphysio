-- Migration 038: Provider qualifications, certifications, and equipment tags
-- Adds professional metadata columns to the providers table (non-sensitive, public).
-- iap_member_id is stored separately in provider_iap_members with restrictive RLS
-- because providers_public_read exposes entire provider rows to the public.

-- ── Public metadata columns ────────────────────────────────────────────────────
ALTER TABLE providers
  ADD COLUMN IF NOT EXISTS qualification text
    CHECK (qualification IN ('BPT', 'MPT', 'PhD', 'DPT')),
  ADD COLUMN IF NOT EXISTS certifications text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS equipment_tags text[] DEFAULT '{}';

COMMENT ON COLUMN providers.qualification IS 'Highest physiotherapy degree: BPT, MPT, PhD, or DPT';
COMMENT ON COLUMN providers.certifications IS 'Professional technique certifications, e.g. Mulligan, McKenzie, NDT';
COMMENT ON COLUMN providers.equipment_tags IS 'Equipment/modality tags, e.g. TENS, Ultrasound, Traction';

-- ── Private identifier table (DPDPA compliance) ───────────────────────────────
-- iap_member_id is a professional identifier and personal data under DPDPA.
-- It MUST NOT be stored on providers because providers_public_read exposes
-- entire rows publicly.
CREATE TABLE IF NOT EXISTS provider_iap_members (
  provider_id uuid PRIMARY KEY REFERENCES providers(id) ON DELETE CASCADE,
  iap_member_id text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE provider_iap_members IS
  'DPDPA-restricted table: stores IAP member IDs separately from public provider rows. '
  'Access limited to the owning provider and admin role only.';

-- ── RLS: only admin and owning provider may read/write ────────────────────────
ALTER TABLE provider_iap_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS provider_iap_members_owner ON provider_iap_members;
CREATE POLICY provider_iap_members_owner ON provider_iap_members
  FOR ALL TO authenticated
  USING (
    provider_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ── updated_at trigger ────────────────────────────────────────────────────────
-- Keeps updated_at current on every row update so it doesn't stay write-once.
CREATE OR REPLACE FUNCTION set_updated_at_provider_iap_members()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_updated_at_provider_iap_members ON provider_iap_members;
CREATE TRIGGER trg_set_updated_at_provider_iap_members
BEFORE UPDATE ON provider_iap_members
FOR EACH ROW EXECUTE FUNCTION set_updated_at_provider_iap_members();

-- ── Audit trigger ─────────────────────────────────────────────────────────────
-- Logs create/update/delete operations on iap_member_id to audit_log.
-- Note: the audit_log table must exist before this migration is applied.
-- If absent, create a minimal one:
CREATE TABLE IF NOT EXISTS audit_log (
  id bigserial PRIMARY KEY,
  table_name text NOT NULL,
  operation text NOT NULL,
  row_id uuid,
  actor_id uuid,
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION audit_provider_iap_members()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO audit_log (table_name, operation, row_id, actor_id, changed_at)
  VALUES (
    'provider_iap_members',
    TG_OP,
    COALESCE(NEW.provider_id, OLD.provider_id),
    auth.uid(),
    now()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_provider_iap_members ON provider_iap_members;
CREATE TRIGGER trg_audit_provider_iap_members
AFTER INSERT OR UPDATE OR DELETE ON provider_iap_members
FOR EACH ROW EXECUTE FUNCTION audit_provider_iap_members();
