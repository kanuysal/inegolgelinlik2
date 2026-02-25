-- ============================================
-- Migration: Allow sellers to unpublish/republish/delete their listings
-- ============================================
-- This migration updates RLS policies to allow sellers to:
-- 1. Unpublish approved listings (approved → archived)
-- 2. Republish archived listings (archived → approved)
-- 3. Delete draft, rejected, or archived listings

-- Drop the old restrictive policies
DROP POLICY IF EXISTS "listings_update_own" ON listings;
DROP POLICY IF EXISTS "listings_delete_own_draft" ON listings;

-- Helper function to validate status transitions for sellers
CREATE OR REPLACE FUNCTION seller_can_update_listing_status(
  old_status listing_status,
  new_status listing_status
) RETURNS BOOLEAN AS $$
BEGIN
  -- Allow editing draft/pending
  IF old_status IN ('draft', 'pending_review') AND new_status IN ('draft', 'pending_review') THEN
    RETURN TRUE;
  END IF;

  -- Allow unpublishing: approved → archived
  IF old_status = 'approved' AND new_status = 'archived' THEN
    RETURN TRUE;
  END IF;

  -- Allow republishing: archived → approved
  IF old_status = 'archived' AND new_status = 'approved' THEN
    RETURN TRUE;
  END IF;

  -- Block self-approval and other unauthorized transitions
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Create new update policy that allows sellers to manage their listings
CREATE POLICY "listings_update_own"
  ON listings FOR UPDATE
  USING (auth.uid() = seller_id)
  WITH CHECK (
    auth.uid() = seller_id
    AND seller_can_update_listing_status(
      (SELECT status FROM listings WHERE id = listings.id),
      status
    )
  );

-- Create new delete policy that allows deleting draft, rejected, or archived listings
CREATE POLICY "listings_delete_own"
  ON listings FOR DELETE
  USING (
    auth.uid() = seller_id
    AND status IN ('draft', 'rejected', 'archived')
  );
