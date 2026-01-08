/*
  # Fix Function Search Path (Batch 2)

  ## Summary
  This migration fixes the search_path for the remaining ~34 database functions to prevent 
  search_path injection attacks.

  ## Functions Fixed
  Includes AB testing, admin, analytics, blog, calibration, onboarding, rate limiting, 
  security, and adaptive recommendation functions
*/

ALTER FUNCTION public.archive_and_reset_quiz(p_reset_reason text) SET search_path = pg_catalog, public;
ALTER FUNCTION public.auto_update_adaptive_weights() SET search_path = pg_catalog, public;
ALTER FUNCTION public.calculate_ab_results(p_experiment_id uuid) SET search_path = pg_catalog, public;
ALTER FUNCTION public.calculate_user_adaptive_weights(p_user_id uuid, p_base_weights jsonb) SET search_path = pg_catalog, public;
ALTER FUNCTION public.check_rate_limit(p_identifier text, p_identifier_type text, p_endpoint text, p_max_requests integer, p_window_minutes integer) SET search_path = pg_catalog, public;
ALTER FUNCTION public.cleanup_expired_product_cache() SET search_path = pg_catalog, public;
ALTER FUNCTION public.cleanup_old_rate_limits() SET search_path = pg_catalog, public;
ALTER FUNCTION public.complete_daily_challenge(p_user_id uuid, p_day_of_week integer) SET search_path = pg_catalog, public;
ALTER FUNCTION public.complete_onboarding_action(action_id text) SET search_path = pg_catalog, public;
ALTER FUNCTION public.find_similar_users(p_user_id uuid, p_limit integer) SET search_path = pg_catalog, public;
ALTER FUNCTION public.get_adaptive_recommendations(p_session_id uuid, p_limit integer) SET search_path = pg_catalog, public;
ALTER FUNCTION public.get_admin_metrics() SET search_path = pg_catalog, public;
ALTER FUNCTION public.get_blog_post_by_slug(post_slug text) SET search_path = pg_catalog, public;
ALTER FUNCTION public.get_current_week_progress(p_user_id uuid) SET search_path = pg_catalog, public;
ALTER FUNCTION public.get_hint_performance(p_hint_id text) SET search_path = pg_catalog, public;
ALTER FUNCTION public.get_onboarding_cohort_analysis(p_start_date date, p_end_date date) SET search_path = pg_catalog, public;
ALTER FUNCTION public.get_onboarding_completion_rate() SET search_path = pg_catalog, public;
ALTER FUNCTION public.get_onboarding_health_score() SET search_path = pg_catalog, public;
ALTER FUNCTION public.get_or_create_ab_assignment(p_experiment_id uuid, p_user_id uuid, p_session_id text) SET search_path = pg_catalog, public;
ALTER FUNCTION public.get_popular_swap_categories() SET search_path = pg_catalog, public;
ALTER FUNCTION public.get_published_blog_posts(page_size integer, page_offset integer, filter_category text) SET search_path = pg_catalog, public;
ALTER FUNCTION public.get_style_profile_history(p_user_id uuid) SET search_path = pg_catalog, public;
ALTER FUNCTION public.get_swap_success_rate(p_user_id uuid, p_session_id text) SET search_path = pg_catalog, public;
ALTER FUNCTION public.get_user_activity_dates(p_user_id uuid, p_start_date date, p_end_date date) SET search_path = pg_catalog, public;
ALTER FUNCTION public.get_user_journey(p_user_id uuid) SET search_path = pg_catalog, public;
ALTER FUNCTION public.log_daily_checkin(p_user_id uuid) SET search_path = pg_catalog, public;
ALTER FUNCTION public.log_security_event(p_event_type text, p_severity text, p_user_id uuid, p_ip_address text, p_user_agent text, p_endpoint text, p_details jsonb) SET search_path = pg_catalog, public;
ALTER FUNCTION public.record_swipe(p_outfit_id text, p_swipe_direction text, p_session_id uuid, p_outfit_features jsonb) SET search_path = pg_catalog, public;
ALTER FUNCTION public.refresh_onboarding_stats() SET search_path = pg_catalog, public;
ALTER FUNCTION public.send_admin_notification(p_target_user_id uuid, p_target_tier text, p_title text, p_message text, p_type text, p_action_url text, p_action_label text, p_expires_at timestamp with time zone) SET search_path = pg_catalog, public;
ALTER FUNCTION public.should_show_hint() SET search_path = pg_catalog, public;
ALTER FUNCTION public.start_calibration_session() SET search_path = pg_catalog, public;
ALTER FUNCTION public.update_photo_analyses_updated_at() SET search_path = pg_catalog, public;
ALTER FUNCTION public.upgrade_user_tier(p_user_id uuid, p_new_tier text, p_reason text) SET search_path = pg_catalog, public;
