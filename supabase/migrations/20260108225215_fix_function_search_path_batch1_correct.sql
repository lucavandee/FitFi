/*
  # Fix Function Search Path (Batch 1)

  ## Summary
  This migration fixes the search_path for ~45 database functions to prevent search_path injection attacks.
  Functions with a role-mutable search_path can be exploited by malicious users.

  ## Changes Made
  - Set search_path to 'pg_catalog, public' for all affected functions
  - Ensures functions always resolve schema-qualified objects correctly
  - Prevents search_path injection attacks

  ## Functions Fixed
  Includes referral, user management, analytics, color advice, calibration, admin, and utility functions
*/

ALTER FUNCTION public.apply_calibration_to_profile(p_user_id uuid, p_session_id text) SET search_path = pg_catalog, public;
ALTER FUNCTION public.auto_compute_color_advice() SET search_path = pg_catalog, public;
ALTER FUNCTION public.award_points(user_uuid uuid, points_to_add integer, action_type text, source_info text) SET search_path = pg_catalog, public;
ALTER FUNCTION public.calculate_level(user_points integer) SET search_path = pg_catalog, public;
ALTER FUNCTION public.can_use_nova(p_user_id uuid) SET search_path = pg_catalog, public;
ALTER FUNCTION public.clean_old_nova_memories() SET search_path = pg_catalog, public;
ALTER FUNCTION public.cleanup_expired_dismissed_insights() SET search_path = pg_catalog, public;
ALTER FUNCTION public.cleanup_old_outfit_visuals() SET search_path = pg_catalog, public;
ALTER FUNCTION public.compute_calibration_adjustments(p_user_id uuid, p_session_id text) SET search_path = pg_catalog, public;
ALTER FUNCTION public.compute_color_advice(quiz_data jsonb, user_archetype text) SET search_path = pg_catalog, public;
ALTER FUNCTION public.create_user_referral_code() SET search_path = pg_catalog, public;
ALTER FUNCTION public.create_user_referral_code(p_user_id uuid) SET search_path = pg_catalog, public;
ALTER FUNCTION public.dismiss_feature_tip(tip_id text) SET search_path = pg_catalog, public;
ALTER FUNCTION public.extract_undertone(quiz_data jsonb) SET search_path = pg_catalog, public;
ALTER FUNCTION public.generate_referral_code() SET search_path = pg_catalog, public;
ALTER FUNCTION public.get_best_colors(p_user_id uuid) SET search_path = pg_catalog, public;
ALTER FUNCTION public.get_calibration_effectiveness() SET search_path = pg_catalog, public;
ALTER FUNCTION public.get_color_summary(p_user_id uuid) SET search_path = pg_catalog, public;
ALTER FUNCTION public.get_funnel_metrics(time_range text) SET search_path = pg_catalog, public;
ALTER FUNCTION public.get_heatmap_summary(time_range text) SET search_path = pg_catalog, public;
ALTER FUNCTION public.get_predictive_insights(limit_per_type integer) SET search_path = pg_catalog, public;
ALTER FUNCTION public.get_realtime_metrics() SET search_path = pg_catalog, public;
ALTER FUNCTION public.get_referral_leaderboard() SET search_path = pg_catalog, public;
ALTER FUNCTION public.get_referral_leaderboard(p_limit integer, p_offset integer) SET search_path = pg_catalog, public;
ALTER FUNCTION public.get_similar_memories(query_embedding vector, user_uuid uuid, match_threshold double precision, match_count integer) SET search_path = pg_catalog, public;
ALTER FUNCTION public.get_swipe_global_stats() SET search_path = pg_catalog, public;
ALTER FUNCTION public.get_swipe_photo_stats() SET search_path = pg_catalog, public;
ALTER FUNCTION public.get_user_profile(user_uuid uuid) SET search_path = pg_catalog, public;
ALTER FUNCTION public.handle_new_user() SET search_path = pg_catalog, public;
ALTER FUNCTION public.has_color_analysis(p_user_id uuid) SET search_path = pg_catalog, public;
ALTER FUNCTION public.increment_blog_view_count(post_slug text) SET search_path = pg_catalog, public;
ALTER FUNCTION public.increment_nova_usage(p_user_id uuid) SET search_path = pg_catalog, public;
ALTER FUNCTION public.is_fitfi_email(email text) SET search_path = pg_catalog, public;
ALTER FUNCTION public.log_admin_action(p_action text, p_target_user_id uuid, p_details jsonb, p_ip_address text, p_user_agent text) SET search_path = pg_catalog, public;
ALTER FUNCTION public.refresh_embedding_analytics() SET search_path = pg_catalog, public;
ALTER FUNCTION public.set_admin_for_fitfi_emails() SET search_path = pg_catalog, public;
ALTER FUNCTION public.set_updated_at() SET search_path = pg_catalog, public;
ALTER FUNCTION public.submit_contact(contact_name text, contact_email text, contact_subject text, contact_message text, contact_type text) SET search_path = pg_catalog, public;
ALTER FUNCTION public.trg_profiles_set_referral_code() SET search_path = pg_catalog, public;
ALTER FUNCTION public.update_blog_posts_updated_at() SET search_path = pg_catalog, public;
ALTER FUNCTION public.update_brams_fruit_products_updated_at() SET search_path = pg_catalog, public;
ALTER FUNCTION public.update_brand_affinity(p_user_id uuid, p_session_id text, p_brand text, p_liked boolean) SET search_path = pg_catalog, public;
ALTER FUNCTION public.update_onboarding_state(state_key text, state_value boolean) SET search_path = pg_catalog, public;
ALTER FUNCTION public.update_outfit_match_feedback_updated_at() SET search_path = pg_catalog, public;
ALTER FUNCTION public.update_testimonials_updated_at() SET search_path = pg_catalog, public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = pg_catalog, public;
ALTER FUNCTION public.update_user_preferences_from_interactions(p_user_id uuid) SET search_path = pg_catalog, public;
