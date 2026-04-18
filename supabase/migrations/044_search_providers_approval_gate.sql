-- Gate public search RPC on approval_status so only admin-approved providers appear.
-- Aligns with applyPublicProviderFilters() in src/app/api/providers/filters.ts

CREATE OR REPLACE FUNCTION search_providers_v2(
  p_lat numeric DEFAULT NULL,
  p_lng numeric DEFAULT NULL,
  p_radius_km numeric DEFAULT 50,
  p_city text DEFAULT NULL,
  p_specialty_id uuid DEFAULT NULL,
  p_visit_type text DEFAULT NULL,
  p_min_rating numeric DEFAULT 0,
  p_max_fees numeric DEFAULT 1000000,
  p_page int DEFAULT 1,
  p_limit int DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  slug text,
  full_name text,
  title text,
  avatar_url text,
  rating_avg numeric(3,2),
  rating_count int,
  experience_years int,
  consultation_fee_inr int,
  location_id uuid,
  city text,
  lat numeric(10,7),
  lng numeric(10,7),
  visit_types text[],
  distance_km numeric,
  total_count bigint
) AS $$
DECLARE
  v_offset int := GREATEST((p_page - 1) * p_limit, 0);
BEGIN
  RETURN QUERY
  WITH provider_locations AS (
    SELECT
      pr.id,
      pr.slug,
      u.full_name,
      pr.title,
      u.avatar_url,
      pr.rating_avg,
      pr.rating_count,
      pr.experience_years,
      pr.consultation_fee_inr,
      l.id AS location_id,
      l.city,
      l.lat,
      l.lng,
      l.visit_type AS visit_types,
      CASE
        WHEN p_lat IS NOT NULL AND p_lng IS NOT NULL AND l.lat IS NOT NULL AND l.lng IS NOT NULL
        THEN (
          6371 * acos(
            LEAST(
              1.0,
              GREATEST(
                -1.0,
                cos(radians(p_lat::float8)) * cos(radians(l.lat::float8)) *
                cos(radians(l.lng::float8) - radians(p_lng::float8)) +
                sin(radians(p_lat::float8)) * sin(radians(l.lat::float8))
              )
            )
          )
        )
        ELSE NULL
      END AS dist
    FROM providers pr
    JOIN users u ON pr.id = u.id
    JOIN locations l ON pr.id = l.provider_id
    WHERE pr.verified = true AND pr.active = true
      AND pr.approval_status = 'approved'::public.provider_approval_status
      AND (p_city IS NULL OR l.city ILIKE '%' || p_city || '%')
      AND (p_visit_type IS NULL OR p_visit_type = ANY(l.visit_type))
      AND (pr.rating_avg >= p_min_rating)
      AND (pr.consultation_fee_inr <= p_max_fees)
      AND (p_specialty_id IS NULL OR pr.specialty_ids @> ARRAY[p_specialty_id])
  ),
  ranked_providers AS (
    SELECT
      provider_locations.*,
      ROW_NUMBER() OVER (
        PARTITION BY provider_locations.id
        ORDER BY
          CASE WHEN provider_locations.dist IS NULL THEN 1 ELSE 0 END,
          provider_locations.dist ASC NULLS LAST,
          provider_locations.location_id ASC
      ) AS location_rank
    FROM provider_locations
  ),
  filtered_providers AS (
    SELECT *
    FROM ranked_providers
    WHERE location_rank = 1
      AND (p_lat IS NULL OR p_lng IS NULL OR dist IS NULL OR dist <= p_radius_km)
  ),
  count_table AS (
    SELECT COUNT(*) AS total
    FROM filtered_providers
  )
  SELECT
    f.id,
    f.slug,
    f.full_name,
    f.title,
    f.avatar_url,
    f.rating_avg,
    f.rating_count,
    f.experience_years,
    f.consultation_fee_inr,
    NULL::uuid AS location_id,
    f.city,
    NULL::numeric(10,7) AS lat,
    NULL::numeric(10,7) AS lng,
    f.visit_types,
    CASE
      WHEN p_lat IS NOT NULL AND p_lng IS NOT NULL THEN f.dist::numeric
      ELSE NULL
    END AS distance_km,
    c.total AS total_count
  FROM filtered_providers f
  CROSS JOIN count_table c
  ORDER BY
    CASE WHEN p_lat IS NOT NULL AND p_lng IS NOT NULL THEN f.dist ELSE NULL END ASC NULLS LAST,
    f.rating_avg DESC
  LIMIT p_limit OFFSET v_offset;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
