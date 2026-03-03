-- Add listing_id FK to featured_gowns so we can link to actual listings
ALTER TABLE featured_gowns
  ADD COLUMN IF NOT EXISTS listing_id uuid REFERENCES listings(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_featured_gowns_listing ON featured_gowns(listing_id);
