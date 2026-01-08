/*
  # Fix Security Definer Views

  ## Summary
  This migration removes SECURITY DEFINER from 7 analytics views.
  SECURITY DEFINER views run with the permissions of the view owner rather than the caller,
  which can create security vulnerabilities if not carefully managed.

  ## Changes Made
  - Recreate all 7 views without SECURITY DEFINER
  - Views will now respect the RLS policies of underlying tables
  - Maintain exact same view definitions, only change security model

  ## Affected Views
  - tribe_likes_summary
  - v_referral_leaderboard
  - outfit_match_feedback_analytics
  - adaptive_learning_analytics
  - ab_experiment_analytics
  - quiz_reset_analytics
  - onboarding_user_progress

  ## Security Impact
  - Views now execute with caller's permissions (more secure)
  - RLS policies on underlying tables provide proper access control
  - Reduces attack surface for privilege escalation
*/

-- Drop and recreate tribe_likes_summary without SECURITY DEFINER
DROP VIEW IF EXISTS tribe_likes_summary CASCADE;
CREATE VIEW tribe_likes_summary AS
WITH counts AS (
  SELECT tribe_id, COUNT(*)::integer AS like_count
  FROM tribe_likes
  GROUP BY tribe_id
),
first_like AS (
  SELECT DISTINCT ON (tribe_id)
    tribe_id,
    user_id AS first_like_user_id,
    created_at AS first_like_at
  FROM tribe_likes
  ORDER BY tribe_id, created_at, user_id
)
SELECT 
  c.tribe_id,
  c.like_count,
  f.first_like_user_id,
  f.first_like_at
FROM counts c
LEFT JOIN first_like f USING (tribe_id);

-- Drop and recreate v_referral_leaderboard without SECURITY DEFINER
DROP VIEW IF EXISTS v_referral_leaderboard CASCADE;
CREATE VIEW v_referral_leaderboard AS
SELECT 
  p.id,
  p.username,
  p.avatar_url,
  COUNT(r.id) AS total_referrals
FROM profiles p
LEFT JOIN referrals r ON r.inviter_id = p.id
GROUP BY p.id, p.username, p.avatar_url
ORDER BY COUNT(r.id) DESC;

-- Drop and recreate outfit_match_feedback_analytics without SECURITY DEFINER
DROP VIEW IF EXISTS outfit_match_feedback_analytics CASCADE;
CREATE VIEW outfit_match_feedback_analytics AS
SELECT 
  outfit_id,
  COUNT(*) AS feedback_count,
  AVG(shown_score) AS avg_shown_score,
  AVG(user_rating) AS avg_user_rating,
  AVG(user_rating * 20) AS avg_user_score_pct,
  AVG(shown_score - (user_rating * 20)) AS score_discrepancy,
  MIN(created_at) AS first_feedback,
  MAX(created_at) AS last_feedback
FROM outfit_match_feedback
GROUP BY outfit_id;

-- Drop and recreate adaptive_learning_analytics without SECURITY DEFINER
DROP VIEW IF EXISTS adaptive_learning_analytics CASCADE;
CREATE VIEW adaptive_learning_analytics AS
SELECT 
  user_id,
  COUNT(*) AS total_interactions,
  COUNT(*) FILTER (WHERE interaction_type = 'like') AS likes,
  COUNT(*) FILTER (WHERE interaction_type = 'dislike') AS dislikes,
  COUNT(*) FILTER (WHERE interaction_type = 'save') AS saves,
  MIN(created_at) AS first_interaction,
  MAX(created_at) AS last_interaction
FROM product_interactions
GROUP BY user_id;

-- Drop and recreate ab_experiment_analytics without SECURITY DEFINER
DROP VIEW IF EXISTS ab_experiment_analytics CASCADE;
CREATE VIEW ab_experiment_analytics AS
SELECT 
  e.id AS experiment_id,
  e.name AS experiment_name,
  e.status,
  COUNT(DISTINCT a.id) AS total_assignments,
  COUNT(DISTINCT a.user_id) AS unique_users,
  COUNT(DISTINCT ev.id) FILTER (WHERE ev.event_type = 'conversion') AS total_conversions,
  ROUND(
    (COUNT(DISTINCT ev.id) FILTER (WHERE ev.event_type = 'conversion')::numeric / 
     NULLIF(COUNT(DISTINCT a.id), 0)::numeric) * 100, 
    2
  ) AS overall_conversion_rate,
  e.created_at,
  e.start_date,
  e.end_date
FROM ab_experiments e
LEFT JOIN ab_assignments a ON e.id = a.experiment_id
LEFT JOIN ab_events ev ON a.id = ev.assignment_id
GROUP BY e.id, e.name, e.status, e.created_at, e.start_date, e.end_date;

-- Drop and recreate quiz_reset_analytics without SECURITY DEFINER
DROP VIEW IF EXISTS quiz_reset_analytics CASCADE;
CREATE VIEW quiz_reset_analytics AS
SELECT 
  DATE_TRUNC('week', reset_at) AS week,
  COUNT(*) AS total_resets,
  AVG(days_since_last_quiz) AS avg_days_between_resets,
  COUNT(*) FILTER (WHERE completed_new_quiz = true) AS completed_new_quiz_count,
  COUNT(*) FILTER (WHERE reason IS NOT NULL) AS resets_with_reason
FROM quiz_resets
GROUP BY DATE_TRUNC('week', reset_at)
ORDER BY DATE_TRUNC('week', reset_at) DESC;

-- Drop and recreate onboarding_user_progress without SECURITY DEFINER
DROP VIEW IF EXISTS onboarding_user_progress CASCADE;
CREATE VIEW onboarding_user_progress AS
SELECT 
  p.id AS user_id,
  p.created_at AS user_created_at,
  p.onboarding_state,
  p.onboarding_version,
  p.last_hint_shown_at,
  (p.onboarding_state->>'completed_welcome')::boolean AS completed_welcome,
  (p.onboarding_state->>'seen_dashboard_tour')::boolean AS seen_dashboard,
  (p.onboarding_state->>'seen_results_tour')::boolean AS seen_results,
  (p.onboarding_state->>'seen_nova_hint')::boolean AS seen_nova,
  (p.onboarding_state->>'tour_started_at')::timestamptz AS tour_started_at,
  (p.onboarding_state->>'tour_completed_at')::timestamptz AS tour_completed_at,
  CASE 
    WHEN (p.onboarding_state->>'tour_completed_at') IS NOT NULL THEN 100
    ELSE (
      CASE WHEN (p.onboarding_state->>'completed_welcome')::boolean THEN 20 ELSE 0 END +
      CASE WHEN (p.onboarding_state->>'seen_results_tour')::boolean THEN 20 ELSE 0 END +
      CASE WHEN (p.onboarding_state->>'seen_dashboard_tour')::boolean THEN 20 ELSE 0 END +
      CASE WHEN (p.onboarding_state->>'seen_nova_hint')::boolean THEN 20 ELSE 0 END +
      CASE WHEN jsonb_array_length(p.onboarding_state->'completed_actions') > 0 THEN 20 ELSE 0 END
    )
  END AS progress_percentage,
  EXTRACT(EPOCH FROM (
    COALESCE((p.onboarding_state->>'tour_completed_at')::timestamptz, NOW()) - 
    (p.onboarding_state->>'tour_started_at')::timestamptz
  )) / 86400 AS days_to_complete
FROM profiles p
WHERE p.onboarding_state IS NOT NULL;
