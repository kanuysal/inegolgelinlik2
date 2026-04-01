-- H2 fix: Add kustomer_message_id column to messages table for webhook idempotency.
-- This prevents replay attacks by deduplicating Kustomer webhook deliveries.

ALTER TABLE messages ADD COLUMN IF NOT EXISTS kustomer_message_id TEXT;

-- Create a unique index for fast idempotency lookups (partial index — only non-null values)
CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_kustomer_message_id
  ON messages (kustomer_message_id)
  WHERE kustomer_message_id IS NOT NULL;
