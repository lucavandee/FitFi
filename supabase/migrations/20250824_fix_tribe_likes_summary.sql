-- Idempotent: veilig herhaald uit te voeren.

-- Voor gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabel in public-schema (sluit aan op bestaande code/migrations)
CREATE TABLE IF NOT EXISTS public.tribe_likes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tribe_id   uuid NOT NULL,
  user_id    uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Unieke like per (tribe, user)
CREATE UNIQUE INDEX IF NOT EXISTS tribe_likes_unique
  ON public.tribe_likes (tribe_id, user_id);

-- RLS + policies (alleen aanmaken als ze nog niet bestaan)
ALTER TABLE public.tribe_likes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='tribe_likes' AND policyname='allow_select_all'
  ) THEN
    CREATE POLICY allow_select_all ON public.tribe_likes FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='tribe_likes' AND policyname='allow_insert_own'
  ) THEN
    CREATE POLICY allow_insert_own ON public.tribe_likes FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='tribe_likes' AND policyname='allow_delete_own'
  ) THEN
    CREATE POLICY allow_delete_own ON public.tribe_likes FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ✅ Fix: geen MIN(uuid). Pak de "eerste like" op tijd (stabiel, met tie-break op user_id)
CREATE OR REPLACE VIEW public.tribe_likes_summary AS
WITH counts AS (
  SELECT tribe_id, COUNT(*)::int AS like_count
  FROM public.tribe_likes
  GROUP BY tribe_id
),
first_like AS (
  SELECT DISTINCT ON (tribe_id)
         tribe_id,
         user_id   AS first_like_user_id,
         created_at AS first_like_at
  FROM public.tribe_likes
  ORDER BY tribe_id, created_at, user_id
)
SELECT
  c.tribe_id,
  c.like_count,
  f.first_like_user_id,
  f.first_like_at
FROM counts c
LEFT JOIN first_like f USING (tribe_id);
