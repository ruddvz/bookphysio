-- Migration: Add TTL to notifications and scheduled cleanup
-- Notifications are write-heavy (5+ per booking). Without archival they grow unbounded.
-- Strategy: add expires_at column, default 90 days from creation.
-- Cleanup runs via pg_cron (available on Supabase) or can be triggered by a cron Edge Function.

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS expires_at timestamptz NOT NULL DEFAULT (now() + interval '90 days');

-- Index for efficient cleanup queries
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at
  ON notifications (expires_at)
  WHERE expires_at IS NOT NULL;

-- Backfill existing rows: set expires_at relative to created_at
UPDATE notifications
SET expires_at = created_at + interval '90 days'
WHERE expires_at = (now() + interval '90 days'); -- only rows just added with default

-- Cleanup function: hard-delete expired notifications
-- Call this via pg_cron: SELECT cron.schedule('cleanup-notifications', '0 3 * * *', 'SELECT cleanup_expired_notifications()');
-- Or trigger from a Supabase Edge Function on a daily schedule.
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
