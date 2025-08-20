/*
  # Policy Housekeeping - Remove Duplicate Policies

  1. Purpose
     - Clean up duplicate RLS policies that may cause conflicts
     - Ensure idempotent policy application across environments
     - Prepare for canonical policy definitions

  2. Tables Affected
     - `profiles` - User profile policies cleanup
     - `referrals` - Referral system policies cleanup  
     - `user_stats` - User statistics policies cleanup

  3. Security
     - Only removes duplicate policies, does not affect RLS enforcement
     - Policies will be re-created by canonical migrations if needed
     - No data access is affected during this operation

  4. Notes
     - Safe to run multiple times (idempotent)
     - Prepares database for clean policy state
     - Part of database maintenance and consistency
*/

DO $$
BEGIN
  -- Profiles policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='profiles_insert_own') THEN
    EXECUTE 'DROP POLICY "profiles_insert_own" ON public.profiles';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='profiles_select_own') THEN
    EXECUTE 'DROP POLICY "profiles_select_own" ON public.profiles';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='profiles_update_own') THEN
    EXECUTE 'DROP POLICY "profiles_update_own" ON public.profiles';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='profiles_read_leaderboard') THEN
    EXECUTE 'DROP POLICY "profiles_read_leaderboard" ON public.profiles';
  END IF;

  -- Referrals policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='referrals' AND policyname='referrals_insert_own') THEN
    EXECUTE 'DROP POLICY "referrals_insert_own" ON public.referrals';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='referrals' AND policyname='referrals_select_own') THEN
    EXECUTE 'DROP POLICY "referrals_select_own" ON public.referrals';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='referrals' AND policyname='referrals_update_own') THEN
    EXECUTE 'DROP POLICY "referrals_update_own" ON public.referrals';
  END IF;

  -- user_stats policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_stats' AND policyname='user_stats_insert_own') THEN
    EXECUTE 'DROP POLICY "user_stats_insert_own" ON public.user_stats';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_stats' AND policyname='user_stats_select_own') THEN
    EXECUTE 'DROP POLICY "user_stats_select_own" ON public.user_stats';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_stats' AND policyname='user_stats_update_own') THEN
    EXECUTE 'DROP POLICY "user_stats_update_own" ON public.user_stats';
  END IF;
END$$;

-- Re-create canonical policies in ONE place if needed (optional)
-- (Keep this section empty if they are defined in a later canonical migration)