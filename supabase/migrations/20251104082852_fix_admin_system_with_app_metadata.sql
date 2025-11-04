/*
  # DEFINITIEVE FIX: Admin System via App Metadata
  
  1. Root Cause
    - Functions met SECURITY DEFINER hebben geen auth context
    - auth.uid() returns NULL in function context
    - JWT claims zijn niet betrouwbaar in functions
    
  2. Correcte Oplossing (Supabase Best Practice)
    - Zet is_admin in auth.users.raw_app_meta_data
    - RLS policies lezen direct uit JWT: auth.jwt() ->> 'is_admin'
    - GEEN custom functions nodig
    
  3. Implementation
    - Update trigger zet is_admin in app_metadata
    - Alle policies gebruiken JWT check
    - Eenvoudig, betrouwbaar, officieel ondersteund
*/

-- Step 1: Drop ALL old stuff
DROP FUNCTION IF EXISTS is_current_user_admin() CASCADE;
DROP VIEW IF EXISTS admin_status CASCADE;

-- Step 2: Create trigger to sync is_admin to app_metadata
CREATE OR REPLACE FUNCTION sync_admin_to_auth_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update auth.users app_metadata with is_admin flag
  UPDATE auth.users
  SET raw_app_meta_data = 
    COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('is_admin', NEW.is_admin)
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Create trigger on profiles INSERT and UPDATE
DROP TRIGGER IF EXISTS sync_admin_metadata_on_insert ON profiles;
DROP TRIGGER IF EXISTS sync_admin_metadata_on_update ON profiles;

CREATE TRIGGER sync_admin_metadata_on_insert
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION sync_admin_to_auth_metadata();

CREATE TRIGGER sync_admin_metadata_on_update
AFTER UPDATE OF is_admin ON profiles
FOR EACH ROW
WHEN (OLD.is_admin IS DISTINCT FROM NEW.is_admin)
EXECUTE FUNCTION sync_admin_to_auth_metadata();

-- Step 3: Sync existing admin users NOW
UPDATE auth.users
SET raw_app_meta_data = 
  COALESCE(raw_app_meta_data, '{}'::jsonb) || 
  jsonb_build_object('is_admin', p.is_admin)
FROM profiles p
WHERE auth.users.id = p.id
AND p.is_admin = true;

-- Step 4: Recreate ALL policies using JWT check
-- This is the CORRECT way to do admin checks in Supabase

-- mood_photos policies
DROP POLICY IF EXISTS "Public can view active mood photos" ON mood_photos;
DROP POLICY IF EXISTS "Admins can view all mood photos" ON mood_photos;
DROP POLICY IF EXISTS "Admins can insert mood photos" ON mood_photos;
DROP POLICY IF EXISTS "Admins can update mood photos" ON mood_photos;
DROP POLICY IF EXISTS "Admins can delete mood photos" ON mood_photos;

CREATE POLICY "Public can view active mood photos"
  ON mood_photos FOR SELECT
  TO public
  USING (active = true);

CREATE POLICY "Admins can view all mood photos"
  ON mood_photos FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true);

CREATE POLICY "Admins can insert mood photos"
  ON mood_photos FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true);

CREATE POLICY "Admins can update mood photos"
  ON mood_photos FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true)
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true);

CREATE POLICY "Admins can delete mood photos"
  ON mood_photos FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true);

-- Storage policies (same approach)
DROP POLICY IF EXISTS "Public can view mood photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload to mood photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update mood photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete mood photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload mood photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update mood photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete mood photos" ON storage.objects;

CREATE POLICY "Public can view mood photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'mood-photos');

CREATE POLICY "Admins can upload to mood photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'mood-photos' 
  AND (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
);

CREATE POLICY "Admins can update mood photos storage"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'mood-photos'
  AND (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
)
WITH CHECK (
  bucket_id = 'mood-photos'
  AND (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
);

CREATE POLICY "Admins can delete from mood photos storage"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'mood-photos'
  AND (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
);
