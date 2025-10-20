/*
  # Admin Role System

  1. Schema Changes
    - Add `is_admin` column to `profiles` table (boolean, default false)
    - Add index on `is_admin` for query performance

  2. Security
    - Enable RLS on profiles (already enabled)
    - Add policy so users can view their own admin status
    - Only @fitfi.ai emails get admin privileges

  3. Functions
    - `set_admin_for_fitfi_emails()` - Automatically grants admin role to @fitfi.ai email users
    - Trigger on profile insert to auto-grant admin on registration

  4. Data Migration
    - Retroactively grant admin to existing @fitfi.ai users
*/

-- Add is_admin column to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = true;

-- Function to check if email is @fitfi.ai
CREATE OR REPLACE FUNCTION is_fitfi_email(email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN email LIKE '%@fitfi.ai';
END;
$$;

-- Function to automatically set admin role for @fitfi.ai emails
CREATE OR REPLACE FUNCTION set_admin_for_fitfi_emails()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email text;
BEGIN
  -- Get email from auth.users
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = NEW.id;

  -- Set is_admin based on email domain
  IF user_email LIKE '%@fitfi.ai' THEN
    NEW.is_admin := true;
  ELSE
    NEW.is_admin := false;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger to auto-set admin on profile creation
DROP TRIGGER IF EXISTS on_profile_created_set_admin ON profiles;
CREATE TRIGGER on_profile_created_set_admin
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_admin_for_fitfi_emails();

-- Retroactively grant admin to existing @fitfi.ai users
UPDATE profiles
SET is_admin = true
WHERE id IN (
  SELECT id FROM auth.users WHERE email LIKE '%@fitfi.ai'
);

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can view own admin status" ON profiles;

-- Add RLS policy for admin check
-- Users can always read their own is_admin status
CREATE POLICY "Users can view own admin status"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Comment on column for documentation
COMMENT ON COLUMN profiles.is_admin IS 'Admin privileges - automatically set to true for @fitfi.ai email addresses';