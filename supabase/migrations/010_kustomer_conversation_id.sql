-- 010: Add kustomer_conversation_id to conversations table
-- Enables the Kustomer CRM webhook handler to find the correct
-- RE:GALIA conversation when a CS agent replies.

ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS kustomer_conversation_id TEXT;

-- Partial unique index: only non-null values, so peer-to-peer
-- conversations don't pollute the index.
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_kustomer_id
  ON conversations(kustomer_conversation_id)
  WHERE kustomer_conversation_id IS NOT NULL;
