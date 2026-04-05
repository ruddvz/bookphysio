-- Migration: Replace full AVG scan in update_provider_rating with incremental update
-- Previous trigger did SELECT AVG(...) + SELECT COUNT(*) on every review insert/update.
-- At 100K+ reviews this becomes a table scan on a hot table.
-- New approach: maintain running sum + count, compute avg inline — O(1) per review.

-- Step 1: Add rating_sum column to providers (stores running total of all published ratings)
ALTER TABLE providers ADD COLUMN IF NOT EXISTS rating_sum bigint NOT NULL DEFAULT 0;

-- Step 2: Backfill rating_sum from existing reviews
UPDATE providers p
SET rating_sum = COALESCE((
  SELECT SUM(r.rating)
  FROM reviews r
  WHERE r.provider_id = p.id AND r.is_published = true
), 0);

-- Step 3: Replace trigger function with incremental version
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
DECLARE
  v_old_published boolean;
  v_new_published boolean;
  v_old_rating    int;
  v_new_rating    int;
  v_delta_sum     int := 0;
  v_delta_count   int := 0;
BEGIN
  -- Determine old and new published/rating state depending on operation
  IF TG_OP = 'INSERT' THEN
    v_old_published := false;
    v_new_published := NEW.is_published;
    v_old_rating    := 0;
    v_new_rating    := NEW.rating;
  ELSIF TG_OP = 'UPDATE' THEN
    v_old_published := OLD.is_published;
    v_new_published := NEW.is_published;
    v_old_rating    := OLD.rating;
    v_new_rating    := NEW.rating;
  ELSIF TG_OP = 'DELETE' THEN
    v_old_published := OLD.is_published;
    v_new_published := false;
    v_old_rating    := OLD.rating;
    v_new_rating    := 0;
  END IF;

  -- Calculate deltas
  IF v_old_published AND NOT v_new_published THEN
    -- Review unpublished: subtract old contribution
    v_delta_sum   := -v_old_rating;
    v_delta_count := -1;
  ELSIF NOT v_old_published AND v_new_published THEN
    -- Review published: add new contribution
    v_delta_sum   := v_new_rating;
    v_delta_count := 1;
  ELSIF v_old_published AND v_new_published THEN
    -- Rating changed while staying published
    v_delta_sum   := v_new_rating - v_old_rating;
    v_delta_count := 0;
  END IF;

  -- Only update if something changed
  IF v_delta_sum <> 0 OR v_delta_count <> 0 THEN
    UPDATE providers
    SET
      rating_sum   = GREATEST(0, rating_sum + v_delta_sum),
      rating_count = GREATEST(0, rating_count + v_delta_count),
      rating_avg   = CASE
        WHEN GREATEST(0, rating_count + v_delta_count) = 0 THEN 0
        ELSE ROUND(
          (rating_sum + v_delta_sum)::numeric /
          GREATEST(1, rating_count + v_delta_count),
          2
        )
      END
    WHERE id = COALESCE(NEW.provider_id, OLD.provider_id);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Re-attach trigger (now covers DELETE as well for completeness)
DROP TRIGGER IF EXISTS on_review_created ON reviews;

CREATE TRIGGER on_review_changed
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_provider_rating();
