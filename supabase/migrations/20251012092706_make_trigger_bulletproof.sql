/*
  # Make Registration Trigger Bulletproof
  
  1. Problem
    - 500 errors during signUp suggest trigger is throwing unhandled exceptions
    - Need to catch ALL errors and log them without failing registration
    
  2. Solution
    - Wrap entire trigger in EXCEPTION handler
    - Log errors to a dedicated table
    - ALWAYS return NEW (never fail)
    
  3. Safety
    - Registration will ALWAYS succeed
    - Errors are logged for debugging
    - Can manually create profile if trigger fails
*/

-- Create error log table if not exists
CREATE TABLE IF NOT EXISTS public.trigger_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_name text NOT NULL,
  user_id uuid,
  error_message text,
  error_detail text,
  error_hint text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trigger_errors ENABLE ROW LEVEL SECURITY;

-- Only admins can read errors
CREATE POLICY "Admins can read trigger errors"
  ON public.trigger_errors
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.tier = 'founder' OR auth.jwt()->>'email' LIKE '%@genrise.nl')
    )
  );

-- Recreate trigger with bulletproof error handling
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_referral_code text;
  v_error_message text;
  v_error_detail text;
  v_error_hint text;
BEGIN
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

  EXCEPTION
    WHEN OTHERS THEN
      -- Log error but don't fail the trigger
      GET STACKED DIAGNOSTICS
        v_error_message = MESSAGE_TEXT,
        v_error_detail = PG_EXCEPTION_DETAIL,
        v_error_hint = PG_EXCEPTION_HINT;
      
      INSERT INTO public.trigger_errors (
        trigger_name,
        user_id,
        error_message,
        error_detail,
        error_hint
      ) VALUES (
        'handle_new_user',
        NEW.id,
        v_error_message,
        v_error_detail,
        v_error_hint
      );
      
      -- Log to PostgreSQL logs as well
      RAISE WARNING 'handle_new_user trigger failed for user %: % (detail: %, hint: %)', 
        NEW.id, v_error_message, v_error_detail, v_error_hint;
  END;

  -- ALWAYS return NEW (never fail registration)
  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user() IS 
  'Bulletproof trigger that creates profile for new users. Never fails - logs errors instead.';

COMMENT ON TABLE public.trigger_errors IS
  'Logs errors from database triggers to aid debugging without breaking user flows.';
