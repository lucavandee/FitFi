/*
  # Create User Photos Storage Bucket

  ## Purpose
  Create a private storage bucket for user selfies used in color analysis.

  ## Security
  - Private bucket (not public)
  - RLS policies: users can only access their own photos
  - File size limit: 5MB
  - Allowed types: image/jpeg, image/png, image/webp

  ## Structure
  Photos stored as: user-photos/{user_id}/selfie-{timestamp}.{ext}
*/

-- Enable storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-photos',
  'user-photos',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own photos" ON storage.objects;

-- RLS Policy: Users can upload their own photos
CREATE POLICY "Users can upload own photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS Policy: Users can read their own photos
CREATE POLICY "Users can read own photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS Policy: Users can update their own photos
CREATE POLICY "Users can update own photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS Policy: Users can delete their own photos
CREATE POLICY "Users can delete own photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
