-- =============================================================================
-- RE:GALIA — Treet Migration Columns
-- =============================================================================
-- Adds tracking columns for data migrated from the Treet marketplace platform.
-- - treet_user_id: original Treet user UUID (dedup key)
-- - google_id: Google OAuth sub, populated on first Google sign-in
-- - treet_listing_id: original Treet listing UUID (dedup key)
-- =============================================================================

-- Profiles: track Treet origin and Google identity linking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS treet_user_id TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE;

-- Listings: track Treet origin
ALTER TABLE listings ADD COLUMN IF NOT EXISTS treet_listing_id TEXT UNIQUE;
