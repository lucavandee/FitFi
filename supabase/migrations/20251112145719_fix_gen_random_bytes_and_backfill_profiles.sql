/*
  # Fix gen_random_bytes Function and Backfill Profiles

  1. Problem
    - handle_new_user trigger fails with "function gen_random_bytes(integer) does not exist"
    - This prevents automatic profile creation for new users
    - Results in dashboard crashes for users without profiles

  2. Solution
    - Enable pgcrypto extension (provides gen_random_bytes)
    - Update handle_new_user to use hex encoding instead of base32
    - Backfill profiles for users who registered when trigger was failing

  3. Security
    - pgcrypto is a standard PostgreSQL extension
    - Safe to enable in production
*/

-- Enable pgcrypto extension for gen_random_bytes
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Update handle_new_user function to use hex encoding (more compatible)
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
    -- Generate unique referral code using hex encoding
    LOOP
      v_referral_code := lower(encode(gen_random_bytes(6), 'hex'));
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE referral_code = v_referral_code
      );
    END LOOP;

    -- Insert profile with full_name and referral_code
    INSERT INTO public.profiles (
      id,
      full_name,
      referral_code,
      tier,
      is_admin
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      v_referral_code,
      'free',
      CASE WHEN NEW.email LIKE '%@fitfi.%' THEN true ELSE false END
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

-- Backfill profiles for users without them
DO $$
DECLARE
  v_user record;
  v_referral_code text;
BEGIN
  FOR v_user IN 
    SELECT u.id, u.email, u.raw_user_meta_data
    FROM auth.users u
    WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
  LOOP
    -- Generate unique referral code
    LOOP
      v_referral_code := lower(encode(gen_random_bytes(6), 'hex'));
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE referral_code = v_referral_code
      );
    END LOOP;

    -- Insert profile
    INSERT INTO public.profiles (id, full_name, referral_code, tier, is_admin)
    VALUES (
      v_user.id,
      COALESCE(v_user.raw_user_meta_data->>'name', split_part(v_user.email, '@', 1)),
      v_referral_code,
      'free',
      CASE WHEN v_user.email LIKE '%@fitfi.%' THEN true ELSE false END
    )
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;
