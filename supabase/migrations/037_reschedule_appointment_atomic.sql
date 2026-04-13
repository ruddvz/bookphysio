-- Reschedule appointment atomically:
-- 1. Validate the appointment belongs to the patient and is eligible
-- 2. Release the old availability slot
-- 3. Book the new availability slot
-- 4. Update the appointment with the new slot
--
-- Returns the updated appointment row as JSONB, or NULL if not found.
-- Raises exceptions for invalid state transitions.

DROP FUNCTION IF EXISTS reschedule_appointment_atomic(uuid, uuid, uuid);

CREATE FUNCTION reschedule_appointment_atomic(
  p_appointment_id uuid,
  p_patient_id uuid,
  p_new_availability_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  target_appointment appointments%ROWTYPE;
  old_availability_id uuid;
  new_avail RECORD;
BEGIN
  -- Lock the appointment row
  SELECT *
  INTO target_appointment
  FROM appointments
  WHERE id = p_appointment_id
    AND patient_id = p_patient_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Only pending or confirmed appointments can be rescheduled
  IF target_appointment.status NOT IN ('pending', 'confirmed') THEN
    RAISE EXCEPTION 'Appointment cannot be rescheduled in current status'
      USING ERRCODE = 'P0001';
  END IF;

  -- Cannot reschedule to the same slot
  IF target_appointment.availability_id = p_new_availability_id THEN
    RAISE EXCEPTION 'New slot is the same as current slot'
      USING ERRCODE = 'P0003';
  END IF;

  old_availability_id := target_appointment.availability_id;

  -- Verify the new slot exists, belongs to the same provider, and is available
  SELECT id, provider_id, is_booked, is_blocked, starts_at
  INTO new_avail
  FROM availabilities
  WHERE id = p_new_availability_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'New availability slot not found'
      USING ERRCODE = 'P0002';
  END IF;

  IF new_avail.provider_id != target_appointment.provider_id THEN
    RAISE EXCEPTION 'New slot belongs to a different provider'
      USING ERRCODE = 'P0004';
  END IF;

  IF new_avail.is_booked THEN
    RAISE EXCEPTION 'New slot is already booked'
      USING ERRCODE = 'P0005';
  END IF;

  IF new_avail.is_blocked THEN
    RAISE EXCEPTION 'New slot is blocked'
      USING ERRCODE = 'P0006';
  END IF;

  IF new_avail.starts_at <= now() THEN
    RAISE EXCEPTION 'Cannot reschedule to a slot in the past'
      USING ERRCODE = 'P0007';
  END IF;

  -- Release the old slot
  UPDATE availabilities
  SET is_booked = false
  WHERE id = old_availability_id;

  -- Book the new slot
  UPDATE availabilities
  SET is_booked = true
  WHERE id = p_new_availability_id;

  -- Update the appointment
  UPDATE appointments
  SET availability_id = p_new_availability_id,
      location_id = COALESCE(
        (SELECT location_id FROM availabilities WHERE id = p_new_availability_id),
        target_appointment.location_id
      ),
      status = 'confirmed'
  WHERE id = target_appointment.id
  RETURNING * INTO target_appointment;

  RETURN to_jsonb(target_appointment);
END;
$$;
