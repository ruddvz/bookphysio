DROP POLICY IF EXISTS "messages_user_read" ON messages;
CREATE POLICY "messages_user_read" ON messages FOR SELECT USING (
  sender_id = auth.uid() OR receiver_id = auth.uid()
);

DROP POLICY IF EXISTS "messages_user_send" ON messages;
CREATE POLICY "messages_user_send" ON messages FOR INSERT WITH CHECK (
  sender_id = auth.uid()
  AND auth_role() IN ('patient', 'provider')
  AND EXISTS (
    SELECT 1
    FROM users AS sender_user, users AS receiver_user
    WHERE sender_user.id = messages.sender_id
      AND receiver_user.id = messages.receiver_id
      AND sender_user.role IN ('patient', 'provider')
      AND receiver_user.role IN ('patient', 'provider')
      AND sender_user.role <> receiver_user.role
  )
  AND EXISTS (
    SELECT 1
    FROM conversations
    WHERE conversations.id = messages.conversation_id
      AND (
        (conversations.user_id_1 = messages.sender_id AND conversations.user_id_2 = messages.receiver_id)
        OR (conversations.user_id_1 = messages.receiver_id AND conversations.user_id_2 = messages.sender_id)
      )
  )
);

DROP POLICY IF EXISTS "messages_user_mark_read" ON messages;
CREATE POLICY "messages_user_mark_read" ON messages FOR UPDATE USING (
  receiver_id = auth.uid()
) WITH CHECK (
  receiver_id = auth.uid()
);

DROP POLICY IF EXISTS "conversations_user_read" ON conversations;
CREATE POLICY "conversations_user_read" ON conversations FOR SELECT USING (
  user_id_1 = auth.uid() OR user_id_2 = auth.uid()
);

DROP POLICY IF EXISTS "conversations_user_create" ON conversations;
CREATE POLICY "conversations_user_create" ON conversations FOR INSERT WITH CHECK (
  (user_id_1 = auth.uid() OR user_id_2 = auth.uid())
  AND auth_role() IN ('patient', 'provider')
  AND EXISTS (
    SELECT 1
    FROM users AS first_user, users AS second_user
    WHERE first_user.id = conversations.user_id_1
      AND second_user.id = conversations.user_id_2
      AND first_user.role IN ('patient', 'provider')
      AND second_user.role IN ('patient', 'provider')
      AND first_user.role <> second_user.role
  )
);

DROP POLICY IF EXISTS "conversations_user_update" ON conversations;
CREATE POLICY "conversations_user_update" ON conversations FOR UPDATE USING (
  user_id_1 = auth.uid() OR user_id_2 = auth.uid()
);

WITH ranked_conversations AS (
  SELECT
    id,
    LEAST(user_id_1, user_id_2) AS canonical_user_id_1,
    GREATEST(user_id_1, user_id_2) AS canonical_user_id_2,
    ROW_NUMBER() OVER (
      PARTITION BY LEAST(user_id_1, user_id_2), GREATEST(user_id_1, user_id_2)
      ORDER BY COALESCE(last_message_at, updated_at, created_at) DESC, created_at ASC, id ASC
    ) AS row_number
  FROM conversations
),
duplicate_conversations AS (
  SELECT
    duplicate.id AS duplicate_id,
    canonical.id AS canonical_id
  FROM ranked_conversations AS canonical
  JOIN ranked_conversations AS duplicate
    ON canonical.canonical_user_id_1 = duplicate.canonical_user_id_1
   AND canonical.canonical_user_id_2 = duplicate.canonical_user_id_2
   AND canonical.row_number = 1
   AND duplicate.row_number > 1
)
UPDATE messages
SET conversation_id = duplicate_conversations.canonical_id
FROM duplicate_conversations
WHERE messages.conversation_id = duplicate_conversations.duplicate_id;

WITH ranked_conversations AS (
  SELECT
    id,
    LEAST(user_id_1, user_id_2) AS canonical_user_id_1,
    GREATEST(user_id_1, user_id_2) AS canonical_user_id_2,
    ROW_NUMBER() OVER (
      PARTITION BY LEAST(user_id_1, user_id_2), GREATEST(user_id_1, user_id_2)
      ORDER BY COALESCE(last_message_at, updated_at, created_at) DESC, created_at ASC, id ASC
    ) AS row_number
  FROM conversations
)
DELETE FROM conversations
USING ranked_conversations
WHERE conversations.id = ranked_conversations.id
  AND ranked_conversations.row_number > 1;

CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_user_pair_unique ON conversations(
  LEAST(user_id_1, user_id_2),
  GREATEST(user_id_1, user_id_2)
);