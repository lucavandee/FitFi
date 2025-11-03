/*
  # Create Storage Bucket for Mood Photos

  1. New Bucket
    - `mood-photos` bucket for user-uploaded style inspiration photos
    - Public read access (for displaying in quiz)
    - Admin-only write access
    
  2. Security
    - Public can view photos
    - Only admins (@fitfi.ai) can upload/delete
    - Max file size: 5MB
    - Allowed: JPEG, PNG, WebP
*/

-- Create mood-photos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'mood-photos',
  'mood-photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view mood photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload mood photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update mood photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete mood photos" ON storage.objects;

-- Public can view photos
CREATE POLICY "Public can view mood photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'mood-photos');

-- Only admins can upload
CREATE POLICY "Admins can upload mood photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'mood-photos' 
  AND (
    SELECT is_admin 
    FROM profiles 
    WHERE id = auth.uid()
  ) = true
);

-- Only admins can update
CREATE POLICY "Admins can update mood photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'mood-photos'
  AND (
    SELECT is_admin 
    FROM profiles 
    WHERE id = auth.uid()
  ) = true
);

-- Only admins can delete
CREATE POLICY "Admins can delete mood photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'mood-photos'
  AND (
    SELECT is_admin 
    FROM profiles 
    WHERE id = auth.uid()
  ) = true
);
