/*
  # Fix Registration Trigger - Add Referral Code Generation

  1. Issue
    - handle_new_user() trigger was too simple
    - Only inserted id into profiles
    - Missing full_name and referral_code
    - Caused 500 error on registration

  2. Solution
    - Update handle_new_user() to insert full_name from user_metadata
    - Generate referral_code using existing helper function
    - Also create user_stats record

  3. Changes
    - DROP and CREATE handle_new_user function with proper fields
    - Uses COALESCE to get name from metadata or email
    - Calls create_user_referral_code() for unique code generation
*/

-- Drop existing function
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Recreate with proper implementation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_referral_code text;
BEGIN
  -- Generate unique referral code
  LOOP
    v_referral_code := lower(encode(gen_random_bytes(5), 'base32'));
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE referral_code = v_referral_code
    );
  END LOOP;

  -- Insert profile with full_name and referral_code
  INSERT INTO public.profiles (
    id,
    full_name,
    referral_code,
    tier
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    v_referral_code,
    'free'
  );

  -- Create user_stats if table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_stats'
  ) THEN
    INSERT INTO public.user_stats (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add helpful comment
COMMENT ON FUNCTION public.handle_new_user() IS 
  'Trigger function that creates profile and user_stats for new auth users. 
   Generates unique referral code and extracts name from user metadata.';
