-- =============================================================================
-- RE:GALIA — Security Hardening (PII Protection)
-- =============================================================================

-- 1. Tighten Profile RLS
-- Drop the wide-open select policy that was exposing PII
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;

-- Add a policy that only allows users to see their own row OR authorized staff to see everything
-- This protects 'full_name' and 'phone' from public scraping.
CREATE POLICY "profiles_select_sensitive"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR is_moderator_or_admin(auth.uid()));

-- 2. Create Public View for non-sensitive data
-- This allows the marketplace to show display names and avatars without leaking PII.
-- Using a view is the safest way to provide column-level security in PostgreSQL.
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id, 
  display_name, 
  avatar_url, 
  created_at
FROM public.profiles;

-- Ensure the view is accessible via the API
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- 3. Storage Hardening Extension
-- Strictly enforce that listing images can only be updated if they match the user's directory.
-- (Already in 003, but reinforced here for consistency)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
