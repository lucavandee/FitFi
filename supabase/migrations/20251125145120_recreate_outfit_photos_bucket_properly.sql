/*
  # Recreate outfit-photos Storage Bucket Properly

  ## Problem
  The outfit-photos bucket exists in storage.buckets table but not in the actual Storage API.
  This causes 404/400 errors when trying to upload files.

  ## Solution
  1. Drop the database record
  2. Recreate using proper storage function
  3. Set up RLS policies

  ## Changes
  - Delete corrupted bucket record
  - Create new bucket via insert with proper trigger
  - Add RLS policies for authenticated uploads
*/

-- Step 1: Drop corrupted bucket and its policies
DROP POLICY IF EXISTS "Anyone can view outfit photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload outfit photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own outfit photos" ON storage.objects;

DELETE FROM storage.buckets WHERE id = 'outfit-photos';

-- Step 2: Create bucket with proper configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'outfit-photos',
  'outfit-photos',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']::text[]
);

-- Step 3: Create RLS policies
CREATE POLICY "Anyone can view outfit photos"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'outfit-photos');

CREATE POLICY "Authenticated users can upload outfit photos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'outfit-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own outfit photos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'outfit-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
