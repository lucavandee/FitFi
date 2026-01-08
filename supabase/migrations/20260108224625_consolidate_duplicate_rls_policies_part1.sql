/*
  # Consolidate Duplicate RLS Policies (Part 1)

  ## Summary
  This migration removes duplicate permissive RLS policies that provide identical access control.
  Having multiple policies for the same role and action creates confusion and maintenance overhead.

  ## Strategy
  - Keep policies with descriptive names (e.g., "Users can view own data")
  - Remove generic pattern policies (e.g., "table_read_own", "table_write_own")
  - Consolidate "Allow all operations" policies into specific action policies
  - Remove redundant duplicate policies with different names but identical logic

  ## Changes Made
  This part 1 migration focuses on the most obvious duplicates across high-traffic tables.

  ## Tables Affected
  Multiple tables including ab_test_variants, achievements, analytics_events, challenge_completions,
  chat_messages, conversion_optimizations, daily_challenges, funnel_analytics, heatmap_data,
  leaderboards, notifications, nova_memories, onboarding_behavior_analytics, outfit_visuals,
  point_transactions, predictive_models, quiz_achievements, quiz_answers, saved_outfits,
  session_recordings, style_preferences, supabase_errors, tribe_members, tribe_posts,
  tribe_post_comments, tribe_post_likes, user_badges, user_levels, user_onboarding_profiles,
  user_points, user_stats, user_streaks
*/

-- ab_test_variants: Remove generic write_own (keep descriptive ones)
DROP POLICY IF EXISTS "ab_test_variants_write_own" ON ab_test_variants CASCADE;
DROP POLICY IF EXISTS "ab_test_variants_read_own" ON ab_test_variants CASCADE;

-- achievements: Remove generic policies (keep descriptive)
DROP POLICY IF EXISTS "achievements_write_own" ON achievements CASCADE;
DROP POLICY IF EXISTS "achievements_read_own" ON achievements CASCADE;

-- analytics_events: Remove generic policies
DROP POLICY IF EXISTS "analytics_events_write_own" ON analytics_events CASCADE;
DROP POLICY IF EXISTS "analytics_events_read_own" ON analytics_events CASCADE;

-- challenge_completions: Remove generic policies
DROP POLICY IF EXISTS "challenge_completions_write_own" ON challenge_completions CASCADE;
DROP POLICY IF EXISTS "challenge_completions_read_own" ON challenge_completions CASCADE;

-- chat_messages: Remove generic policies
DROP POLICY IF EXISTS "chat_messages_write_own" ON chat_messages CASCADE;
DROP POLICY IF EXISTS "chat_messages_read_own" ON chat_messages CASCADE;

-- conversion_optimizations: Remove generic policies
DROP POLICY IF EXISTS "conversion_optimizations_write_own" ON conversion_optimizations CASCADE;
DROP POLICY IF EXISTS "conversion_optimizations_read_own" ON conversion_optimizations CASCADE;

-- daily_challenges: Remove "Allow all operations" policy and generic ones
DROP POLICY IF EXISTS "Allow all operations on daily_challenges" ON daily_challenges CASCADE;
DROP POLICY IF EXISTS "daily_challenges_write_own" ON daily_challenges CASCADE;
DROP POLICY IF EXISTS "daily_challenges_read_own" ON daily_challenges CASCADE;

-- funnel_analytics: Remove generic policies
DROP POLICY IF EXISTS "funnel_analytics_write_own" ON funnel_analytics CASCADE;
DROP POLICY IF EXISTS "funnel_analytics_read_own" ON funnel_analytics CASCADE;

-- heatmap_data: Remove generic policies
DROP POLICY IF EXISTS "heatmap_data_write_own" ON heatmap_data CASCADE;
DROP POLICY IF EXISTS "heatmap_data_read_own" ON heatmap_data CASCADE;

-- leaderboards: Remove generic policies
DROP POLICY IF EXISTS "leaderboards_write_own" ON leaderboards CASCADE;
DROP POLICY IF EXISTS "leaderboards_read_own" ON leaderboards CASCADE;

-- notifications: Remove generic policies
DROP POLICY IF EXISTS "notifications_write_own" ON notifications CASCADE;
DROP POLICY IF EXISTS "notifications_read_own" ON notifications CASCADE;

-- nova_memories: Remove generic policies
DROP POLICY IF EXISTS "nova_memories_write_own" ON nova_memories CASCADE;
DROP POLICY IF EXISTS "nova_memories_read_own" ON nova_memories CASCADE;

-- onboarding_behavior_analytics: Remove generic policies
DROP POLICY IF EXISTS "onboarding_behavior_analytics_write_own" ON onboarding_behavior_analytics CASCADE;
DROP POLICY IF EXISTS "onboarding_behavior_analytics_read_own" ON onboarding_behavior_analytics CASCADE;

-- outfit_visuals: Remove generic policies
DROP POLICY IF EXISTS "outfit_visuals_write_own" ON outfit_visuals CASCADE;
DROP POLICY IF EXISTS "outfit_visuals_read_own" ON outfit_visuals CASCADE;

-- point_transactions: Remove generic policies
DROP POLICY IF EXISTS "point_transactions_write_own" ON point_transactions CASCADE;
DROP POLICY IF EXISTS "point_transactions_read_own" ON point_transactions CASCADE;

-- predictive_models: Remove generic policies
DROP POLICY IF EXISTS "predictive_models_write_own" ON predictive_models CASCADE;
DROP POLICY IF EXISTS "predictive_models_read_own" ON predictive_models CASCADE;

-- quiz_achievements: Remove generic and duplicate policies
DROP POLICY IF EXISTS "quiz_achievements_write_own" ON quiz_achievements CASCADE;
DROP POLICY IF EXISTS "quiz_achievements_read_own" ON quiz_achievements CASCADE;
DROP POLICY IF EXISTS "user_reads_own_achievements" ON quiz_achievements CASCADE;

-- quiz_answers: Remove "Allow all operations" and generic policies
DROP POLICY IF EXISTS "Allow all operations on quiz_answers" ON quiz_answers CASCADE;
DROP POLICY IF EXISTS "quiz_answers_write_own" ON quiz_answers CASCADE;
DROP POLICY IF EXISTS "quiz_answers_read_own" ON quiz_answers CASCADE;

-- saved_outfits: Remove "Allow all operations" and generic policies
DROP POLICY IF EXISTS "Allow all operations on saved_outfits" ON saved_outfits CASCADE;
DROP POLICY IF EXISTS "saved_outfits_write_own" ON saved_outfits CASCADE;
DROP POLICY IF EXISTS "saved_outfits_read_own" ON saved_outfits CASCADE;

-- session_recordings: Remove generic policies
DROP POLICY IF EXISTS "session_recordings_write_own" ON session_recordings CASCADE;
DROP POLICY IF EXISTS "session_recordings_read_own" ON session_recordings CASCADE;

-- style_preferences: Remove "Allow all operations" and generic policies
DROP POLICY IF EXISTS "Allow all operations on style_preferences" ON style_preferences CASCADE;
DROP POLICY IF EXISTS "style_preferences_write_own" ON style_preferences CASCADE;
DROP POLICY IF EXISTS "style_preferences_read_own" ON style_preferences CASCADE;

-- supabase_errors: Remove generic policies
DROP POLICY IF EXISTS "supabase_errors_write_own" ON supabase_errors CASCADE;
DROP POLICY IF EXISTS "supabase_errors_read_own" ON supabase_errors CASCADE;

-- tribe_members: Remove generic policies
DROP POLICY IF EXISTS "tribe_members_write_own" ON tribe_members CASCADE;
DROP POLICY IF EXISTS "tribe_members_read_own" ON tribe_members CASCADE;

-- tribe_posts: Remove generic policies
DROP POLICY IF EXISTS "tribe_posts_write_own" ON tribe_posts CASCADE;
DROP POLICY IF EXISTS "tribe_posts_read_own" ON tribe_posts CASCADE;

-- tribe_post_comments: Remove generic policies
DROP POLICY IF EXISTS "tribe_post_comments_write_own" ON tribe_post_comments CASCADE;
DROP POLICY IF EXISTS "tribe_post_comments_read_own" ON tribe_post_comments CASCADE;

-- tribe_post_likes: Remove generic policies
DROP POLICY IF EXISTS "tribe_post_likes_write_own" ON tribe_post_likes CASCADE;
DROP POLICY IF EXISTS "tribe_post_likes_read_own" ON tribe_post_likes CASCADE;

-- user_badges: Remove generic policies
DROP POLICY IF EXISTS "user_badges_write_own" ON user_badges CASCADE;
DROP POLICY IF EXISTS "user_badges_read_own" ON user_badges CASCADE;

-- user_levels: Remove generic policies
DROP POLICY IF EXISTS "user_levels_write_own" ON user_levels CASCADE;
DROP POLICY IF EXISTS "user_levels_read_own" ON user_levels CASCADE;

-- user_onboarding_profiles: Remove generic policies
DROP POLICY IF EXISTS "user_onboarding_profiles_write_own" ON user_onboarding_profiles CASCADE;
DROP POLICY IF EXISTS "user_onboarding_profiles_read_own" ON user_onboarding_profiles CASCADE;

-- user_points: Remove generic policies
DROP POLICY IF EXISTS "user_points_write_own" ON user_points CASCADE;
DROP POLICY IF EXISTS "user_points_read_own" ON user_points CASCADE;

-- user_stats: Remove duplicate "user_stats_own" (keep specific policies)
DROP POLICY IF EXISTS "user_stats_own" ON user_stats CASCADE;
DROP POLICY IF EXISTS "user_stats_write_own" ON user_stats CASCADE;
DROP POLICY IF EXISTS "user_stats_read_own" ON user_stats CASCADE;

-- user_streaks: Remove generic policies
DROP POLICY IF EXISTS "user_streaks_write_own" ON user_streaks CASCADE;
DROP POLICY IF EXISTS "user_streaks_read_own" ON user_streaks CASCADE;

-- outfit_items: Remove "Allow all operations" (keep specific read policies)
DROP POLICY IF EXISTS "Allow all operations on outfit_items" ON outfit_items CASCADE;

-- outfits: Remove "Allow all operations" (keep specific read policies)
DROP POLICY IF EXISTS "Allow all operations on outfits" ON outfits CASCADE;

-- users_legacy: Remove "Allow all operations" (keep specific policies)
DROP POLICY IF EXISTS "Allow all operations on users" ON users_legacy CASCADE;
