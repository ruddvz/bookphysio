-- Messages table for patient-provider communication
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 5000),
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  CHECK (sender_id != receiver_id)
);

-- Conversations table: tracks patient-provider message threads
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_1 uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_id_2 uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_message_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id_1, user_id_2),
  CHECK (user_id_1 != user_id_2)
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Messages RLS policies
-- Users can SELECT their own messages (as sender or receiver)
CREATE POLICY "messages_user_read" ON messages FOR SELECT USING (
  sender_id = auth.uid() OR receiver_id = auth.uid() OR auth_role() = 'admin'
);

-- Users can INSERT messages where they are the sender
CREATE POLICY "messages_user_send" ON messages FOR INSERT WITH CHECK (
  sender_id = auth.uid()
);

-- Users can UPDATE read_at on messages they received
CREATE POLICY "messages_user_mark_read" ON messages FOR UPDATE USING (
  receiver_id = auth.uid() OR auth_role() = 'admin'
) WITH CHECK (
  receiver_id = auth.uid() OR auth_role() = 'admin'
);

-- Conversations RLS policies
-- Users can SELECT conversations they are part of
CREATE POLICY "conversations_user_read" ON conversations FOR SELECT USING (
  user_id_1 = auth.uid() OR user_id_2 = auth.uid() OR auth_role() = 'admin'
);

-- Users can INSERT conversations where they are one of the participants
CREATE POLICY "conversations_user_create" ON conversations FOR INSERT WITH CHECK (
  user_id_1 = auth.uid() OR user_id_2 = auth.uid()
);

-- Users can UPDATE conversations they are part of
CREATE POLICY "conversations_user_update" ON conversations FOR UPDATE USING (
  user_id_1 = auth.uid() OR user_id_2 = auth.uid() OR auth_role() = 'admin'
);

-- Indexes for performance
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_created_at_desc ON messages(created_at DESC);
CREATE INDEX idx_conversations_user_id_1 ON conversations(user_id_1);
CREATE INDEX idx_conversations_user_id_2 ON conversations(user_id_2);
CREATE INDEX idx_conversations_user_pair ON conversations(LEAST(user_id_1, user_id_2), GREATEST(user_id_1, user_id_2));
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at DESC);
