-- Realtime infrastructure: private chat broadcast + presence + notification push.
-- Topic contract:
--   chat messages : conversation:<conversation_id>:messages   (broadcast)
--   chat presence : conversation:<conversation_id>:presence   (presence)
--   notifications : user:<user_id>:notifications              (broadcast, private)

-- ── Helper: check conversation membership from topic string ──────────────────
CREATE OR REPLACE FUNCTION public.is_conversation_member_for_topic(p_topic text)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversations c
    WHERE c.id = split_part(p_topic, ':', 2)::uuid
      AND auth.uid() IN (c.user_id_1, c.user_id_2)
  );
$$;

-- ── RLS policies on realtime.messages (private channel access) ───────────────

-- Chat broadcast: receive
DROP POLICY IF EXISTS "conversation_members_can_receive_chat_broadcast" ON "realtime"."messages";
CREATE POLICY "conversation_members_can_receive_chat_broadcast"
  ON "realtime"."messages"
  FOR SELECT
  TO authenticated
  USING (
    public.is_conversation_member_for_topic(topic)
    AND extension = 'broadcast'
    AND topic LIKE 'conversation:%:messages'
  );

-- Chat broadcast: send
DROP POLICY IF EXISTS "conversation_members_can_send_chat_broadcast" ON "realtime"."messages";
CREATE POLICY "conversation_members_can_send_chat_broadcast"
  ON "realtime"."messages"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_conversation_member_for_topic(topic)
    AND extension = 'broadcast'
    AND topic LIKE 'conversation:%:messages'
  );

-- Chat presence: receive
DROP POLICY IF EXISTS "conversation_members_can_receive_chat_presence" ON "realtime"."messages";
CREATE POLICY "conversation_members_can_receive_chat_presence"
  ON "realtime"."messages"
  FOR SELECT
  TO authenticated
  USING (
    public.is_conversation_member_for_topic(topic)
    AND extension = 'presence'
    AND topic LIKE 'conversation:%:presence'
  );

-- Chat presence: send
DROP POLICY IF EXISTS "conversation_members_can_send_chat_presence" ON "realtime"."messages";
CREATE POLICY "conversation_members_can_send_chat_presence"
  ON "realtime"."messages"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_conversation_member_for_topic(topic)
    AND extension = 'presence'
    AND topic LIKE 'conversation:%:presence'
  );

-- Notifications: receive (private — only own topic)
DROP POLICY IF EXISTS "user_can_receive_notifications_broadcast" ON "realtime"."messages";
CREATE POLICY "user_can_receive_notifications_broadcast"
  ON "realtime"."messages"
  FOR SELECT
  TO authenticated
  USING (
    extension = 'broadcast'
    AND topic LIKE 'user:%:notifications'
    AND auth.uid() = split_part(topic, ':', 2)::uuid
  );

-- Notifications: send (service-role triggers only; deny client sends)
DROP POLICY IF EXISTS "user_can_send_notifications_broadcast" ON "realtime"."messages";
CREATE POLICY "user_can_send_notifications_broadcast"
  ON "realtime"."messages"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    extension = 'broadcast'
    AND topic LIKE 'user:%:notifications'
    AND auth.uid() = split_part(topic, ':', 2)::uuid
  );

-- ── Trigger: broadcast public.messages changes to realtime ───────────────────
CREATE OR REPLACE FUNCTION public.messages_realtime_broadcast_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM realtime.broadcast_changes(
    'conversation:' || COALESCE(NEW.conversation_id, OLD.conversation_id)::text || ':messages',
    TG_OP,
    TG_OP,
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    NEW,
    OLD
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS messages_realtime_broadcast ON public.messages;
CREATE TRIGGER messages_realtime_broadcast
  AFTER INSERT OR UPDATE OR DELETE
  ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.messages_realtime_broadcast_trigger();

-- ── Trigger: push notifications to user realtime topic ──────────────────────
CREATE OR REPLACE FUNCTION public.notifications_realtime_broadcast_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM realtime.send(
      'user:' || NEW.user_id::text || ':notifications',
      'notification_created',
      jsonb_build_object(
        'id',         NEW.id,
        'user_id',    NEW.user_id,
        'type',       NEW.type,
        'title',      NEW.title,
        'body',       NEW.body,
        'read',       NEW.read,
        'metadata',   NEW.metadata,
        'created_at', NEW.created_at,
        'expires_at', NEW.expires_at
      ),
      true -- private channel
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notifications_realtime_broadcast_insert ON public.notifications;
CREATE TRIGGER notifications_realtime_broadcast_insert
  AFTER INSERT
  ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.notifications_realtime_broadcast_insert();
