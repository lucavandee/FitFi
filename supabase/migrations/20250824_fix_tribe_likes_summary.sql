-- Idempotent: veilig om vaker te draaien

-- Voor gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Schema + tabel (alle IF NOT EXISTS -> veilig herhaalbaar)
CREATE SCHEMA IF NOT EXISTS tribes;

CREATE TABLE IF NOT EXISTS tribes.tribe_likes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tribe_id   uuid NOT NULL,
  user_id    uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Unieke like per (tribe, user)
CREATE UNIQUE INDEX IF NOT EXISTS tribes_tribe_likes_unique
  ON tribes.tribe_likes (tribe_id, user_id);

-- RLS aan + policies alleen aanmaken als ze nog niet bestaan
ALTER TABLE tribes.tribe_likes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='tribes' AND tablename='tribe_likes' AND policyname='allow_select_all'
  ) THEN
    CREATE POLICY allow_select_all ON tribes.tribe_likes FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='tribes' AND tablename='tribe_likes' AND policyname='allow_insert_own'
  ) THEN
    CREATE POLICY allow_insert_own ON tribes.tribe_likes FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='tribes' AND tablename='tribe_likes' AND policyname='allow_delete_own'
  ) THEN
    CREATE POLICY allow_delete_own ON tribes.tribe_likes FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ✅ Fix: vervang MIN(uuid) door deterministisch "eerste like" op tijd
--   - earliest created_at per tribe_id
--   - tie-break op user_id voor determinisme
CREATE OR REPLACE VIEW tribes.tribe_likes_summary AS
WITH counts AS (
  SELECT tribe_id, COUNT(*)::int AS like_count
  FROM tribes.tribe_likes
  GROUP BY tribe_id
),
first_like AS (
  SELECT DISTINCT ON (tribe_id)
         tribe_id,
         user_id   AS first_like_user_id,
         created_at AS first_like_at
  FROM tribes.tribe_likes
  ORDER BY tribe_id, created_at, user_id
)
SELECT
  c.tribe_id,
  c.like_count,
  f.first_like_user_id,
  f.first_like_at
FROM counts c
LEFT JOIN first_like f USING (tribe_id);
