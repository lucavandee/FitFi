/*
  # Embedding Analytics Functions

  1. Purpose
    - Provide aggregate analytics for admin dashboard
    - Track archetype distribution across all users
    - Monitor stability metrics
    - Measure embedding performance

  2. Functions
    - get_archetype_distribution() - Top archetypes across users
    - get_stability_distribution() - User preference stability breakdown
    - get_embedding_stats() - General embedding statistics
*/

-- ============================================
-- ARCHETYPE DISTRIBUTION
-- ============================================

CREATE OR REPLACE FUNCTION get_archetype_distribution()
RETURNS TABLE (
  archetype text,
  user_count bigint,
  avg_score numeric
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    archetype::text,
    COUNT(DISTINCT sp.id) as user_count,
    ROUND(AVG((sp.locked_embedding->>archetype)::numeric), 2) as avg_score
  FROM style_profiles sp,
       LATERAL jsonb_object_keys(sp.locked_embedding) as archetype
  WHERE sp.embedding_locked_at IS NOT NULL
    AND sp.locked_embedding IS NOT NULL
  GROUP BY archetype
  ORDER BY user_count DESC, avg_score DESC;
$$;

COMMENT ON FUNCTION get_archetype_distribution IS 'Returns archetype popularity across all locked profiles';

-- ============================================
-- STABILITY DISTRIBUTION
-- ============================================

CREATE OR REPLACE FUNCTION get_stability_distribution()
RETURNS TABLE (
  category text,
  user_count bigint
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  WITH user_stability AS (
    SELECT
      sp.user_id,
      COALESCE(
        (
          SELECT MAX(
            -- Count unchanged archetypes / total archetypes
            (
              SELECT COUNT(*)::numeric
              FROM jsonb_object_keys(ses.embedding) k
              WHERE ABS(
                COALESCE((ses.embedding->>k)::numeric, 0) -
                COALESCE((LAG(ses.embedding) OVER (PARTITION BY ses.user_id ORDER BY ses.version)->>k)::numeric, 0)
              ) < 10
            ) / GREATEST(
              (SELECT COUNT(*) FROM jsonb_object_keys(ses.embedding)),
              1
            )
          )
          FROM style_embedding_snapshots ses
          WHERE ses.user_id = sp.user_id
            AND ses.version > 1
        ),
        1.0
      ) as stability_score
    FROM style_profiles sp
    WHERE sp.embedding_locked_at IS NOT NULL
      AND sp.user_id IS NOT NULL
  )
  SELECT
    CASE
      WHEN stability_score >= 0.9 THEN 'Very Stable'
      WHEN stability_score >= 0.7 THEN 'Moderately Stable'
      ELSE 'Volatile'
    END as category,
    COUNT(*) as user_count
  FROM user_stability
  GROUP BY category
  ORDER BY
    CASE category
      WHEN 'Very Stable' THEN 1
      WHEN 'Moderately Stable' THEN 2
      ELSE 3
    END;
$$;

COMMENT ON FUNCTION get_stability_distribution IS 'Returns distribution of user preference stability';

-- ============================================
-- GENERAL EMBEDDING STATS
-- ============================================

CREATE OR REPLACE FUNCTION get_embedding_stats()
RETURNS TABLE (
  total_locked bigint,
  avg_time_to_lock numeric,
  avg_archetypes_per_user numeric
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    COUNT(*) as total_locked,
    ROUND(
      AVG(
        EXTRACT(EPOCH FROM embedding_locked_at - created_at) / 60
      )::numeric,
      1
    ) as avg_time_to_lock,
    ROUND(
      AVG(
        (SELECT COUNT(*) FROM jsonb_object_keys(locked_embedding))
      )::numeric,
      1
    ) as avg_archetypes_per_user
  FROM style_profiles
  WHERE embedding_locked_at IS NOT NULL
    AND locked_embedding IS NOT NULL;
$$;

COMMENT ON FUNCTION get_embedding_stats IS 'Returns general statistics about locked embeddings';

-- ============================================
-- USER EMBEDDING TIMELINE
-- ============================================

CREATE OR REPLACE FUNCTION get_user_embedding_timeline(
  p_user_id uuid
)
RETURNS TABLE (
  version int,
  embedding jsonb,
  snapshot_trigger text,
  created_at timestamptz,
  changes jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH snapshots AS (
    SELECT
      ses.version,
      ses.embedding,
      ses.snapshot_trigger,
      ses.created_at,
      LAG(ses.embedding) OVER (ORDER BY ses.version) as prev_embedding
    FROM style_embedding_snapshots ses
    WHERE ses.user_id = p_user_id
    ORDER BY ses.version
  )
  SELECT
    s.version,
    s.embedding,
    s.snapshot_trigger,
    s.created_at,
    CASE
      WHEN s.prev_embedding IS NULL THEN NULL
      ELSE (
        SELECT jsonb_object_agg(
          key,
          jsonb_build_object(
            'old', COALESCE((s.prev_embedding->>key)::numeric, 0),
            'new', COALESCE((s.embedding->>key)::numeric, 0),
            'delta', COALESCE((s.embedding->>key)::numeric, 0) - COALESCE((s.prev_embedding->>key)::numeric, 0)
          )
        )
        FROM jsonb_object_keys(s.embedding) key
        WHERE ABS(
          COALESCE((s.embedding->>key)::numeric, 0) -
          COALESCE((s.prev_embedding->>key)::numeric, 0)
        ) >= 5
      )
    END as changes
  FROM snapshots s;
END;
$$;

COMMENT ON FUNCTION get_user_embedding_timeline IS 'Returns complete embedding history with change deltas for a user';

-- ============================================
-- COMPARISON ANALYTICS
-- ============================================

CREATE OR REPLACE FUNCTION compare_embedding_versions(
  p_user_id uuid,
  p_version_1 int,
  p_version_2 int
)
RETURNS TABLE (
  archetype text,
  v1_score numeric,
  v2_score numeric,
  delta numeric,
  change_type text
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH v1 AS (
    SELECT embedding
    FROM style_embedding_snapshots
    WHERE user_id = p_user_id AND version = p_version_1
  ),
  v2 AS (
    SELECT embedding
    FROM style_embedding_snapshots
    WHERE user_id = p_user_id AND version = p_version_2
  ),
  all_archetypes AS (
    SELECT DISTINCT k as archetype
    FROM v1, LATERAL jsonb_object_keys(v1.embedding) k
    UNION
    SELECT DISTINCT k as archetype
    FROM v2, LATERAL jsonb_object_keys(v2.embedding) k
  )
  SELECT
    a.archetype::text,
    COALESCE((v1.embedding->>a.archetype)::numeric, 0) as v1_score,
    COALESCE((v2.embedding->>a.archetype)::numeric, 0) as v2_score,
    COALESCE((v2.embedding->>a.archetype)::numeric, 0) - COALESCE((v1.embedding->>a.archetype)::numeric, 0) as delta,
    CASE
      WHEN (v1.embedding->>a.archetype) IS NULL THEN 'new'
      WHEN (v2.embedding->>a.archetype) IS NULL THEN 'removed'
      WHEN ABS(COALESCE((v2.embedding->>a.archetype)::numeric, 0) - COALESCE((v1.embedding->>a.archetype)::numeric, 0)) < 5 THEN 'stable'
      WHEN COALESCE((v2.embedding->>a.archetype)::numeric, 0) > COALESCE((v1.embedding->>a.archetype)::numeric, 0) THEN 'increased'
      ELSE 'decreased'
    END as change_type
  FROM all_archetypes a, v1, v2
  ORDER BY ABS(COALESCE((v2.embedding->>a.archetype)::numeric, 0) - COALESCE((v1.embedding->>a.archetype)::numeric, 0)) DESC;
$$;

COMMENT ON FUNCTION compare_embedding_versions IS 'Compares two embedding versions for a user, showing all changes';
