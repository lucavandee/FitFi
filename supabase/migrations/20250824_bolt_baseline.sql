-- Baseline for Bolt/Supabase – idempotent (safe to re-run)
-- Lost-and-found objects for your app so Bolt stops suggesting them each refresh.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────────
-- Schemas
CREATE SCHEMA IF NOT EXISTS tribes;

-- ─────────────────────────────────────────────────────────────────────────────
-- tribe_likes + RLS (incl. ✅ fix: geen MIN(uuid) in summary)
CREATE TABLE IF NOT EXISTS public.tribe_likes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tribe_id   uuid NOT NULL,
  user_id    uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS tribe_likes_unique
  ON public.tribe_likes (tribe_id, user_id);
CREATE INDEX IF NOT EXISTS tribe_likes_tribe_idx ON public.tribe_likes(tribe_id);
CREATE INDEX IF NOT EXISTS tribe_likes_user_idx  ON public.tribe_likes(user_id);

ALTER TABLE public.tribe_likes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tribe_likes' AND policyname='allow_select_all') THEN
    CREATE POLICY allow_select_all ON public.tribe_likes FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tribe_likes' AND policyname='allow_insert_own') THEN
    CREATE POLICY allow_insert_own ON public.tribe_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tribe_likes' AND policyname='allow_delete_own') THEN
    CREATE POLICY allow_delete_own ON public.tribe_likes FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Vervang elke eerdere (foute) definitie met MIN(uuid)
CREATE OR REPLACE VIEW public.tribe_likes_summary AS
WITH counts AS (
  SELECT tribe_id, COUNT(*)::int AS like_count
  FROM public.tribe_likes
  GROUP BY tribe_id
),
first_like AS (
  SELECT DISTINCT ON (tribe_id)
         tribe_id,
         user_id    AS first_like_user_id,
         created_at AS first_like_at
  FROM public.tribe_likes
  ORDER BY tribe_id, created_at, user_id  -- stabiele tie-break, geen MIN(uuid)
)
SELECT c.tribe_id, c.like_count, f.first_like_user_id, f.first_like_at
FROM counts c
LEFT JOIN first_like f USING (tribe_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Saved Outfits Table + RLS
CREATE TABLE IF NOT EXISTS public.saved_outfits (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL,
  outfit     jsonb NOT NULL,
  note       text,
  is_test    boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS saved_outfits_user_idx ON public.saved_outfits(user_id);

ALTER TABLE public.saved_outfits ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='saved_outfits' AND policyname='saved_outfits_select_own') THEN
    CREATE POLICY saved_outfits_select_own ON public.saved_outfits FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='saved_outfits' AND policyname='saved_outfits_insert_own') THEN
    CREATE POLICY saved_outfits_insert_own ON public.saved_outfits FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='saved_outfits' AND policyname='saved_outfits_delete_own') THEN
    CREATE POLICY saved_outfits_delete_own ON public.saved_outfits FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Supabase Errors Logging Table
CREATE TABLE IF NOT EXISTS public.supabase_errors (
  id         bigserial PRIMARY KEY,
  source     text,
  code       text,
  message    text,
  details    jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Alt Text Cache Table
CREATE TABLE IF NOT EXISTS public.alt_text_cache (
  id         bigserial PRIMARY KEY,
  image_url  text NOT NULL UNIQUE,
  alt_text   text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Onboarding behavior analytics (+ test-marking)
CREATE TABLE IF NOT EXISTS public.onboarding_events (
  id         bigserial PRIMARY KEY,
  user_id    uuid,
  step       text,
  action     text,
  is_test    boolean NOT NULL DEFAULT false,
  meta       jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS onboarding_events_user_idx    ON public.onboarding_events(user_id);
CREATE INDEX IF NOT EXISTS onboarding_events_created_idx ON public.onboarding_events(created_at);

-- ─────────────────────────────────────────────────────────────────────────────
-- Enhanced Dashboard & Referral System (minimal schema, uitbreidbaar)
CREATE TABLE IF NOT EXISTS public.referrals (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_user_id uuid,
  invitee_email   text,
  status          text CHECK (status IN ('sent','clicked','joined','rewarded')),
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS referrals_inviter_idx ON public.referrals(inviter_user_id);

CREATE TABLE IF NOT EXISTS public.analytics_daily (
  day    date NOT NULL,
  metric text NOT NULL,
  value  numeric NOT NULL DEFAULT 0,
  PRIMARY KEY(day, metric)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Nova Intelligence Engine (requests/responses) + Feedback
CREATE TABLE IF NOT EXISTS public.nova_requests (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid,
  kind       text,
  prompt     text,
  meta       jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.nova_responses (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid,
  output     text,
  tokens     int,
  meta       jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS nova_responses_req_idx ON public.nova_responses(request_id);

CREATE TABLE IF NOT EXISTS public.nova_feedback (
  id         bigserial PRIMARY KEY,
  user_id    uuid,
  rating     int CHECK (rating BETWEEN 1 AND 5),
  message    text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS nova_feedback_user_idx ON public.nova_feedback(user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Achievements (+ RLS policy)
CREATE TABLE IF NOT EXISTS public.achievements (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   uuid NOT NULL,
  code      text NOT NULL,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, code)
);
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='achievements' AND policyname='achievements_select_own') THEN
    CREATE POLICY achievements_select_own ON public.achievements FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='achievements' AND policyname='achievements_insert_own') THEN
    CREATE POLICY achievements_insert_own ON public.achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Baseline marker so we can detect schema is ready
CREATE TABLE IF NOT EXISTS public._bolt_baseline (
  name       text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public._bolt_baseline(name) VALUES ('baseline_2025_08_24')
ON CONFLICT (name) DO NOTHING;
