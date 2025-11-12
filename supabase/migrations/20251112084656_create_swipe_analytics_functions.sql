/*
  # Swipe Analytics Functions

  1. Functions
    - get_swipe_global_stats: Global swipe statistics
    - get_swipe_photo_stats: Per-photo swipe statistics

  2. Purpose
    - Provide admin dashboard with swipe pattern insights
    - Track photo performance (like rate, engagement)
    - Identify top/worst performing photos

  3. Security
    - Functions are security definer (run as postgres)
    - Called via RPC from authenticated admin users
*/

-- Global swipe statistics
CREATE OR REPLACE FUNCTION get_swipe_global_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'total_swipes', COUNT(*),
      'total_users', COUNT(DISTINCT session_id),
      'avg_swipes_per_user', ROUND(COUNT(*)::numeric / NULLIF(COUNT(DISTINCT session_id), 0), 1),
      'avg_like_rate', ROUND(
        (COUNT(*) FILTER (WHERE swipe_direction = 'like')::numeric * 100) / 
        NULLIF(COUNT(*), 0), 
        1
      ),
      'male_photos_count', (SELECT COUNT(*) FROM mood_photos WHERE gender = 'male' AND active = true),
      'female_photos_count', (SELECT COUNT(*) FROM mood_photos WHERE gender = 'female' AND active = true)
    )
    FROM style_swipes
  );
END;
$$;

-- Per-photo swipe statistics
CREATE OR REPLACE FUNCTION get_swipe_photo_stats()
RETURNS TABLE (
  photo_id bigint,
  photo_url text,
  gender text,
  mood_tags jsonb,
  total_swipes bigint,
  likes bigint,
  dislikes bigint,
  like_rate numeric,
  unique_users bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    mp.id as photo_id,
    mp.photo_url,
    mp.gender,
    mp.mood_tags,
    COUNT(ss.id) as total_swipes,
    COUNT(*) FILTER (WHERE ss.swipe_direction = 'like') as likes,
    COUNT(*) FILTER (WHERE ss.swipe_direction = 'dislike') as dislikes,
    ROUND(
      (COUNT(*) FILTER (WHERE ss.swipe_direction = 'like')::numeric * 100) / 
      NULLIF(COUNT(ss.id), 0), 
      1
    ) as like_rate,
    COUNT(DISTINCT ss.session_id) as unique_users
  FROM mood_photos mp
  LEFT JOIN style_swipes ss ON ss.photo_id = mp.id
  WHERE mp.active = true
  GROUP BY mp.id, mp.photo_url, mp.gender, mp.mood_tags
  HAVING COUNT(ss.id) > 0
  ORDER BY like_rate DESC NULLS LAST;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_swipe_global_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_swipe_photo_stats() TO authenticated;
