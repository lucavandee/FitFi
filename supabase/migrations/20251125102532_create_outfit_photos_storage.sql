/*
  # Create Outfit Photos Storage Bucket

  ## Purpose
  Create storage bucket for outfit photos uploaded by users for AI analysis.

  ## Details
  1. New Storage Bucket
     - `outfit-photos`: Public bucket for outfit photo uploads
     - File size limit: 10MB
     - Allowed types: image/jpeg, image/png, image/webp

  2. Security
     - RLS enabled on storage.objects
     - Authenticated users can upload to their own folder
     - Photos are publicly readable (for AI processing)
     - Users can only delete their own photos

  ## Structure
  Photos stored as: outfit-photos/{user_id}/{timestamp}-{random}.{ext}
*/

-- Create outfit-photos bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'outfit-photos',
  'outfit-photos',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload outfit photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view outfit photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own outfit photos" ON storage.objects;

-- RLS Policy: Authenticated users can upload outfit photos to their folder
CREATE POLICY "Authenticated users can upload outfit photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'outfit-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS Policy: Anyone can view outfit photos (needed for AI processing)
CREATE POLICY "Anyone can view outfit photos"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'outfit-photos'
);

-- RLS Policy: Users can delete their own outfit photos
CREATE POLICY "Users can delete own outfit photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'outfit-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
