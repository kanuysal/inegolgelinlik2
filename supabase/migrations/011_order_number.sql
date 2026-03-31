-- Migration 011: Add order_number column to listings
-- Stores the original purchase order number (from store confirmation or dress label)

ALTER TABLE listings ADD COLUMN IF NOT EXISTS order_number TEXT CHECK (char_length(order_number) <= 100);
