ALTER TABLE IF EXISTS appointments
  DROP COLUMN IF EXISTS insurance_id;

DROP TABLE IF EXISTS provider_insurances;
DROP TABLE IF EXISTS insurances;