-- Add stockist integration columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS stockist_id integer UNIQUE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stockist_data jsonb DEFAULT '{}';
