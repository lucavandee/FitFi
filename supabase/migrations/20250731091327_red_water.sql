/*
  # Skip duplicate profiles insert policy

  1. Policy Management
    - Make profiles_insert_own policy creation idempotent
    - Prevent duplicate policy errors during migrations
    - Ensure single source of truth for policy definition

  2. Changes
    - Check if policy exists before creating
    - Skip creation if policy already exists
    - Log notice when skipping existing policy

  3. Notes
    - This migration should be run after removing duplicate policy creation from older migrations
    - Ensures clean migration runs without policy conflicts
*/

-- Make INSERT policy creation idempotent
DO
$$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'profiles'
      AND policyname = 'profiles_insert_own'
  ) THEN
    CREATE POLICY profiles_insert_own
      ON public.profiles
      FOR INSERT
      TO public
      WITH CHECK (auth.uid() = id);
    
    RAISE NOTICE 'Policy profiles_insert_own created successfully.';
  ELSE
    RAISE NOTICE 'Policy profiles_insert_own already exists – skipping.';
  END IF;
END
$$;