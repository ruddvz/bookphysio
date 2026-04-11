-- Daily AI-generated platform summaries
-- Stored by the Vercel cron job at /api/cron/daily-summary

CREATE TABLE IF NOT EXISTS daily_summaries (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  summary_date  date NOT NULL UNIQUE,
  metrics       jsonb NOT NULL DEFAULT '{}'::jsonb,
  ai_summary    jsonb NOT NULL DEFAULT '{}'::jsonb,
  health_score  smallint,
  alerts        jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookups by date
CREATE INDEX IF NOT EXISTS idx_daily_summaries_date ON daily_summaries (summary_date DESC);

-- RLS: only service role can write; admin users can read
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can read daily summaries"
  ON daily_summaries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

-- Service role bypasses RLS, so no INSERT policy needed for the cron job
