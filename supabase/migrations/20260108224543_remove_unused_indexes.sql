/*
  # Remove Unused Database Indexes

  ## Summary
  This migration removes 150+ unused indexes that have been identified by Supabase.
  Unused indexes consume storage space and slow down write operations without providing query benefits.

  ## Changes Made
  - Dropped all indexes that show zero usage
  - Used IF EXISTS to prevent errors if any index was already dropped
  - Preserved all indexes that are actively being used by queries

  ## Performance Impact
  - Faster INSERT, UPDATE, and DELETE operations
  - Reduced storage overhead
  - No negative impact on query performance (these indexes weren't being used)

  ## Tables Affected
  Multiple tables across the database including products, profiles, quiz_achievements,
  referrals, users_legacy, contact_submissions, leaderboards, stripe_products,
  user_activity_log, funnel_analytics, heatmap_data, session_recordings,
  predictive_models, conversion_optimizations, customer_subscriptions, supabase_errors,
  brams_fruit_products, nova_memories, chat_messages, outfit_visuals, user_badges,
  analytics_events, user_points, tribe_members, tribe_posts, tribe_post_likes,
  tribe_post_comments, newsletter_subscribers, style_profiles, mood_photos,
  nova_swipe_insights, outfit_calibration_feedback, style_embedding_snapshots,
  brand_preferences, admin_audit_log, admin_notifications, user_weekly_progress,
  admin_user_sessions, photo_analyses, push_subscriptions, notification_log,
  preview_outfits, dismissed_nova_insights, outfit_match_feedback, product_gaps,
  product_interactions, product_cache, similar_users_cache, ab_experiments,
  ab_assignments, ab_events, blog_posts, blog_topics, blog_analytics, security_events,
  rate_limits, notifications, outfit_items, saved_outfits, testimonials, ab_test_variants,
  achievements, user_levels, style_profile_history, quiz_resets, onboarding_events,
  swipe_preferences, calibration_sessions, outfit_generation_cache, outfit_swaps
*/

-- Products table
DROP INDEX IF EXISTS idx_products_style;

-- Quiz achievements
DROP INDEX IF EXISTS idx_quiz_achievements_type;

-- AB test variants
DROP INDEX IF EXISTS idx_ab_test_variants_test;

-- Referrals
DROP INDEX IF EXISTS idx_referrals_user_id;
DROP INDEX IF EXISTS idx_referrals_code;

-- Users legacy
DROP INDEX IF EXISTS idx_users_email;

-- Contact submissions
DROP INDEX IF EXISTS idx_contact_submissions_created_at;

-- Profiles
DROP INDEX IF EXISTS idx_profiles_referral_code;
DROP INDEX IF EXISTS idx_profiles_referral_count;
DROP INDEX IF EXISTS idx_profiles_is_admin;
DROP INDEX IF EXISTS idx_profiles_locked_at;

-- Onboarding behavior analytics
DROP INDEX IF EXISTS idx_behavior_analytics_session;
DROP INDEX IF EXISTS idx_behavior_analytics_timestamp;

-- User levels
DROP INDEX IF EXISTS idx_user_levels_rank;

-- Leaderboards
DROP INDEX IF EXISTS idx_leaderboards_points;
DROP INDEX IF EXISTS idx_leaderboards_weekly;
DROP INDEX IF EXISTS idx_leaderboards_monthly;

-- Challenge completions
DROP INDEX IF EXISTS idx_challenge_completions_week;

-- Point transactions
DROP INDEX IF EXISTS idx_point_transactions_date;

-- Stripe products
DROP INDEX IF EXISTS idx_stripe_products_active;
DROP INDEX IF EXISTS idx_stripe_products_featured;

-- User activity log
DROP INDEX IF EXISTS idx_user_activity_log_user_date;
DROP INDEX IF EXISTS idx_user_activity_log_user_type_date;

-- Funnel analytics
DROP INDEX IF EXISTS idx_funnel_analytics_session;
DROP INDEX IF EXISTS idx_funnel_analytics_timestamp;

-- Heatmap data
DROP INDEX IF EXISTS idx_heatmap_data_page;
DROP INDEX IF EXISTS idx_heatmap_data_element;
DROP INDEX IF EXISTS idx_heatmap_data_timestamp;
DROP INDEX IF EXISTS idx_heatmap_data_user_id;

-- Session recordings
DROP INDEX IF EXISTS idx_session_recordings_timestamp;

-- Predictive models
DROP INDEX IF EXISTS idx_predictive_models_calculated;

-- Conversion optimizations
DROP INDEX IF EXISTS idx_conversion_optimizations_type;

-- Customer subscriptions
DROP INDEX IF EXISTS idx_customer_subscriptions_stripe_customer;
DROP INDEX IF EXISTS idx_customer_subscriptions_product_id;

-- Supabase errors
DROP INDEX IF EXISTS idx_supabase_errors_created_at;
DROP INDEX IF EXISTS idx_supabase_errors_severity;
DROP INDEX IF EXISTS idx_supabase_errors_operation;
DROP INDEX IF EXISTS idx_supabase_errors_table;

-- Brams fruit products
DROP INDEX IF EXISTS idx_brams_sku;
DROP INDEX IF EXISTS idx_brams_category;
DROP INDEX IF EXISTS idx_brams_sub_category;
DROP INDEX IF EXISTS idx_brams_is_active;
DROP INDEX IF EXISTS idx_brams_style_code;

-- Nova memories
DROP INDEX IF EXISTS idx_nova_memories_created_at;
DROP INDEX IF EXISTS idx_nova_memories_embedding;

-- Chat messages
DROP INDEX IF EXISTS idx_chat_messages_user_id;
DROP INDEX IF EXISTS idx_chat_messages_created_at;

-- Outfit visuals
DROP INDEX IF EXISTS idx_outfit_visuals_created_at;
DROP INDEX IF EXISTS idx_outfit_visuals_status;
DROP INDEX IF EXISTS idx_outfit_visuals_outfit_id;

-- User badges
DROP INDEX IF EXISTS idx_user_badges_earned_at;

-- Analytics events
DROP INDEX IF EXISTS idx_analytics_events_type;
DROP INDEX IF EXISTS idx_analytics_events_created_at;

-- User points
DROP INDEX IF EXISTS idx_user_points_total_points;
DROP INDEX IF EXISTS idx_user_points_current_level;

-- Tribe members
DROP INDEX IF EXISTS idx_tribe_members_tribe_id;
DROP INDEX IF EXISTS idx_tribe_members_user_id;

-- Tribe posts
DROP INDEX IF EXISTS idx_tribe_posts_tribe_id;
DROP INDEX IF EXISTS idx_tribe_posts_created_at;
DROP INDEX IF EXISTS idx_tribe_posts_outfit_id;

-- Tribe post likes
DROP INDEX IF EXISTS idx_tribe_post_likes_post_id;
DROP INDEX IF EXISTS idx_tribe_post_likes_user_id;

-- Tribe post comments
DROP INDEX IF EXISTS idx_tribe_post_comments_post_id;
DROP INDEX IF EXISTS idx_tribe_post_comments_user_id;

-- Newsletter subscribers
DROP INDEX IF EXISTS newsletter_subscribers_subscribed_at_idx;

-- Style profiles
DROP INDEX IF EXISTS idx_style_profiles_color_analysis;
DROP INDEX IF EXISTS idx_style_profiles_learning_enabled;
DROP INDEX IF EXISTS style_profiles_skipped_idx;
DROP INDEX IF EXISTS idx_style_profiles_user_id;

-- Mood photos
DROP INDEX IF EXISTS idx_mood_photos_archetype;

-- Nova swipe insights
DROP INDEX IF EXISTS idx_nova_insights_session;
DROP INDEX IF EXISTS idx_nova_insights_dismissed;

-- Outfit calibration feedback
DROP INDEX IF EXISTS idx_outfit_feedback_type;
DROP INDEX IF EXISTS idx_outfit_feedback_created;

-- Style embedding snapshots
DROP INDEX IF EXISTS idx_snapshots_version;
DROP INDEX IF EXISTS idx_snapshots_created;

-- Brand preferences
DROP INDEX IF EXISTS idx_brand_preferences_brand;

-- Admin audit log
DROP INDEX IF EXISTS idx_audit_admin_id;
DROP INDEX IF EXISTS idx_audit_target_user;
DROP INDEX IF EXISTS idx_audit_action;

-- Admin notifications
DROP INDEX IF EXISTS idx_notifications_target_user;
DROP INDEX IF EXISTS idx_notifications_target_tier;
DROP INDEX IF EXISTS idx_notifications_created_at;
DROP INDEX IF EXISTS idx_notifications_user_id;
DROP INDEX IF EXISTS idx_admin_notifications_created_by;

-- User weekly progress
DROP INDEX IF EXISTS idx_user_weekly_progress_user_week;

-- Admin user sessions
DROP INDEX IF EXISTS idx_sessions_admin;
DROP INDEX IF EXISTS idx_sessions_target;
DROP INDEX IF EXISTS idx_sessions_active;

-- Photo analyses
DROP INDEX IF EXISTS photo_analyses_created_at_idx;

-- Products (additional)
DROP INDEX IF EXISTS products_gender_idx;
DROP INDEX IF EXISTS products_type_idx;

-- Push subscriptions
DROP INDEX IF EXISTS idx_push_subscriptions_user_id;

-- Notification log
DROP INDEX IF EXISTS idx_notification_log_user_id;
DROP INDEX IF EXISTS idx_notification_log_sent_at;

-- Preview outfits
DROP INDEX IF EXISTS idx_preview_outfits_user_id;
DROP INDEX IF EXISTS idx_preview_outfits_session_id;
DROP INDEX IF EXISTS idx_preview_outfits_created_at;

-- Dismissed nova insights
DROP INDEX IF EXISTS dismissed_insights_user_idx;
DROP INDEX IF EXISTS dismissed_insights_expires_idx;

-- Outfit match feedback
DROP INDEX IF EXISTS idx_outfit_match_feedback_user_id;
DROP INDEX IF EXISTS idx_outfit_match_feedback_outfit_id;
DROP INDEX IF EXISTS idx_outfit_match_feedback_created_at;
DROP INDEX IF EXISTS idx_outfit_match_feedback_user_archetype;
DROP INDEX IF EXISTS idx_outfit_match_feedback_session_archetype;

-- Product gaps
DROP INDEX IF EXISTS idx_product_gaps_priority;

-- Product interactions
DROP INDEX IF EXISTS idx_product_interactions_user;
DROP INDEX IF EXISTS idx_product_interactions_product;
DROP INDEX IF EXISTS idx_product_interactions_type;

-- Product cache
DROP INDEX IF EXISTS idx_product_cache_expires;

-- Similar users cache
DROP INDEX IF EXISTS idx_similar_users_expires;

-- AB experiments
DROP INDEX IF EXISTS idx_ab_experiments_status;
DROP INDEX IF EXISTS idx_ab_experiments_created_by;

-- AB assignments
DROP INDEX IF EXISTS idx_ab_assignments_experiment;
DROP INDEX IF EXISTS idx_ab_assignments_user;
DROP INDEX IF EXISTS idx_ab_assignments_session;

-- AB events
DROP INDEX IF EXISTS idx_ab_events_experiment;
DROP INDEX IF EXISTS idx_ab_events_assignment;
DROP INDEX IF EXISTS idx_ab_events_created_at;
DROP INDEX IF EXISTS idx_ab_events_type;
DROP INDEX IF EXISTS idx_ab_events_user_id;

-- Blog posts
DROP INDEX IF EXISTS idx_blog_posts_category;
DROP INDEX IF EXISTS idx_blog_posts_featured;

-- Blog topics
DROP INDEX IF EXISTS idx_blog_topics_status;
DROP INDEX IF EXISTS idx_blog_topics_generated_post_id;

-- Blog analytics
DROP INDEX IF EXISTS idx_blog_analytics_post_id;
DROP INDEX IF EXISTS idx_blog_analytics_event_type;
DROP INDEX IF EXISTS idx_blog_analytics_user_id;

-- Style swipes
DROP INDEX IF EXISTS idx_style_swipes_user_id;

-- Security events
DROP INDEX IF EXISTS idx_security_events_type;
DROP INDEX IF EXISTS idx_security_events_user;
DROP INDEX IF EXISTS idx_security_events_severity;

-- Rate limits
DROP INDEX IF EXISTS idx_rate_limits_lookup;
DROP INDEX IF EXISTS idx_rate_limits_cleanup;

-- Outfit items
DROP INDEX IF EXISTS idx_outfit_items_outfit_id;

-- Saved outfits
DROP INDEX IF EXISTS idx_saved_outfits_outfit_id;

-- Testimonials
DROP INDEX IF EXISTS idx_testimonials_created_by;

-- Achievements
DROP INDEX IF EXISTS idx_achievements_user_id;

-- Tribes
DROP INDEX IF EXISTS idx_tribes_created_by;

-- User stats
DROP INDEX IF EXISTS idx_user_stats_user_id;

-- User streaks
DROP INDEX IF EXISTS idx_user_streaks_user_id;

-- Style profile history
DROP INDEX IF EXISTS idx_style_profile_history_session_id;
DROP INDEX IF EXISTS idx_style_profile_history_archived_at;

-- Quiz resets
DROP INDEX IF EXISTS idx_quiz_resets_reset_at;
DROP INDEX IF EXISTS idx_quiz_resets_completed;

-- Onboarding events
DROP INDEX IF EXISTS idx_onboarding_events_user_id;
DROP INDEX IF EXISTS idx_onboarding_events_event_type;
DROP INDEX IF EXISTS idx_onboarding_events_created_at;

-- Swipe preferences
DROP INDEX IF EXISTS idx_swipe_preferences_user_session;
DROP INDEX IF EXISTS idx_swipe_preferences_created;

-- Calibration sessions
DROP INDEX IF EXISTS idx_calibration_sessions_user;

-- Outfit generation cache
DROP INDEX IF EXISTS idx_outfit_cache_user_expires;

-- Outfit swaps
DROP INDEX IF EXISTS idx_outfit_swaps_user_id;
DROP INDEX IF EXISTS idx_outfit_swaps_session_id;
DROP INDEX IF EXISTS idx_outfit_swaps_created_at;
DROP INDEX IF EXISTS idx_outfit_swaps_improvement;
DROP INDEX IF EXISTS idx_outfit_swaps_category;
