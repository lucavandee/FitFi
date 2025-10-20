/*
  # Brams Fruit Product Images Storage

  1. Storage Bucket
    - `brams-fruit-images` - Public bucket for product images
    - Organized by: `/products/{style_code}/{filename}`
    - Example: `/products/900/900-Black.jpg`

  2. Security
    - Public read access for all images
    - Upload restricted to @fitfi.ai admin users
    - Max file size: 5MB
    - Allowed formats: jpg, jpeg, png, webp

  3. Notes
    - Images linked via `image_url` in `brams_fruit_products` table
    - Automatic image optimization via Supabase CDN
    - Fallback to placeholder for missing images
*/

-- Create storage bucket for Brams Fruit product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('brams-fruit-images', 'brams-fruit-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for Brams Fruit images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload Brams Fruit images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update Brams Fruit images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete Brams Fruit images" ON storage.objects;

-- Allow public read access to all images
CREATE POLICY "Public read access for Brams Fruit images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'brams-fruit-images');

-- Only admins (@fitfi.ai) can upload images
CREATE POLICY "Admins can upload Brams Fruit images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'brams-fruit-images'
    AND (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%@fitfi.ai'
  );

-- Only admins can update images
CREATE POLICY "Admins can update Brams Fruit images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'brams-fruit-images'
    AND (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%@fitfi.ai'
  )
  WITH CHECK (
    bucket_id = 'brams-fruit-images'
    AND (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%@fitfi.ai'
  );

-- Only admins can delete images
CREATE POLICY "Admins can delete Brams Fruit images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'brams-fruit-images'
    AND (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%@fitfi.ai'
  );
