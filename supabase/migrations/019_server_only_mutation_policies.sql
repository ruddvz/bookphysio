DROP POLICY IF EXISTS "appointments_patient_insert" ON appointments;
DROP POLICY IF EXISTS "appointments_update" ON appointments;

DROP POLICY IF EXISTS "messages_user_send" ON messages;
DROP POLICY IF EXISTS "messages_user_mark_read" ON messages;

DROP POLICY IF EXISTS "conversations_user_create" ON conversations;
DROP POLICY IF EXISTS "conversations_user_update" ON conversations;