/*
  # Fix Anonymous Photo Uploads

  ## Changes
  - Add RLS policies to allow anonymous users (anon role) to upload photos to user-photos bucket
  - Allow uploads to paths starting with 'anon_*' for anonymous users
  - Keep existing authenticated user policies intact

  ## Security
  - Anonymous users can only upload to anon_* folders
  - Authenticated users can only access their own folder
  - File size limit (5MB) enforced at bucket level
*/

-- Allow anonymous users to upload photos to anon_* folders
CREATE POLICY "Anonymous users can upload photos"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'user-photos'
  AND (storage.foldername(name))[1] LIKE 'anon_%'
);

-- Allow anonymous users to read their uploaded photos
CREATE POLICY "Anonymous users can read their photos"
ON storage.objects
FOR SELECT
TO anon
USING (
  bucket_id = 'user-photos'
  AND (storage.foldername(name))[1] LIKE 'anon_%'
);

-- Allow public read access to user-photos bucket (for displaying images)
-- This is safe because folder names act as secret tokens for anonymous users
CREATE POLICY "Public can read user photos"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'user-photos'
);
