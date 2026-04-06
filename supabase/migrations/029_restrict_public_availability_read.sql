DROP POLICY IF EXISTS "availabilities_public_read" ON availabilities;

CREATE POLICY "availabilities_public_read" ON availabilities FOR SELECT USING (
  (
    is_booked = false
    AND is_blocked = false
    AND EXISTS (
      SELECT 1
      FROM providers p
      WHERE p.id = availabilities.provider_id
        AND p.verified = true
        AND p.active = true
    )
  )
  OR provider_id = auth.uid()
  OR auth_role() = 'admin'
);