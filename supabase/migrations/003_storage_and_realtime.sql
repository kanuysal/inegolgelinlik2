-- =============================================================================
-- RE:GALIA — Storage Buckets & Realtime Configuration
-- =============================================================================

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Listing images bucket (public read, authenticated write)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listing-images',
  'listing-images',
  true,  -- Public read (images displayed on shop page)
  5242880,  -- 5MB max per image
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Avatar images bucket (public read, authenticated write)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,  -- 2MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- ============================================
-- STORAGE POLICIES — Listing Images
-- ============================================

-- Anyone can view listing images (public bucket)
CREATE POLICY "listing_images_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listing-images');

-- Authenticated users can upload to their own folder
-- Path: listing-images/{user_id}/{filename}
CREATE POLICY "listing_images_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'listing-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update their own images
CREATE POLICY "listing_images_update_own"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'listing-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own images
CREATE POLICY "listing_images_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'listing-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- STORAGE POLICIES — Avatars
-- ============================================

CREATE POLICY "avatars_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_update_own"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- REALTIME — Enable for chat
-- ============================================

-- Enable realtime on messages table for live chat
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Enable realtime on notifications for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Enable realtime on conversations for last_message_at updates
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
