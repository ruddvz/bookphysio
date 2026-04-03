DROP FUNCTION IF EXISTS cancel_appointment_and_release_slot(uuid, uuid);

CREATE FUNCTION cancel_appointment_and_release_slot(
  p_appointment_id uuid,
  p_patient_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  target_appointment appointments%ROWTYPE;
BEGIN
  SELECT *
  INTO target_appointment
  FROM appointments
  WHERE id = p_appointment_id
    AND patient_id = p_patient_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  IF target_appointment.status NOT IN ('pending', 'confirmed') THEN
    RAISE EXCEPTION 'Appointment cannot be cancelled' USING ERRCODE = 'P0001';
  END IF;

  IF target_appointment.availability_id IS NULL THEN
    RAISE EXCEPTION 'Appointment is missing availability' USING ERRCODE = 'P0002';
  END IF;

  UPDATE availabilities
  SET is_booked = false
  WHERE id = target_appointment.availability_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Failed to release appointment slot' USING ERRCODE = 'P0002';
  END IF;

  UPDATE appointments
  SET status = 'cancelled'
  WHERE id = target_appointment.id
  RETURNING * INTO target_appointment;

  RETURN to_jsonb(target_appointment);
END;
$$;