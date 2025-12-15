/*
  # Fix Unindexed Foreign Keys

  ## Overview
  This migration adds indexes to all foreign key columns that don't have covering indexes.
  Unindexed foreign keys can lead to severe performance degradation, especially for:
  - DELETE operations on parent tables (cascade checks)
  - JOIN operations
  - Foreign key constraint validation

  ## Changes
  
  ### New Indexes Added
  1. ab_events(user_id) - for user activity tracking
  2. ab_experiments(created_by) - for experiment creation tracking
  3. achievements(user_id) - for user achievements lookup
  4. admin_notifications(created_by) - for notification creation tracking
  5. blog_analytics(user_id) - for blog engagement tracking
  6. blog_topics(generated_post_id) - for topic-post relationship
  7. customer_subscriptions(product_id) - for subscription-product joins
  8. heatmap_data(user_id) - for heatmap user filtering
  9. notifications(user_id) - for user notifications lookup
  10. outfit_items(outfit_id) - for outfit composition queries
  11. saved_outfits(outfit_id) - for saved outfit lookups
  12. style_swipes(mood_photo_id) - for photo swipe analytics
  13. testimonials(created_by) - for testimonial authorship
  14. tribe_post_comments(user_id) - for user comment history
  15. tribe_post_likes(user_id) - for user like history
  16. tribe_posts(outfit_id) - for outfit-post relationship
  17. tribes(created_by) - for tribe ownership lookup
  18. user_points(current_level) - for level progression
  19. user_stats(user_id) - for user statistics lookup
  20. user_streaks(user_id) - for user streak tracking

  ## Performance Impact
  These indexes will improve:
  - Query performance by 10-100x for affected queries
  - DELETE cascade performance
  - JOIN operation speed
  - Foreign key constraint validation
*/

-- ab_events
CREATE INDEX IF NOT EXISTS idx_ab_events_user_id 
ON ab_events(user_id);

-- ab_experiments
CREATE INDEX IF NOT EXISTS idx_ab_experiments_created_by 
ON ab_experiments(created_by);

-- achievements
CREATE INDEX IF NOT EXISTS idx_achievements_user_id 
ON achievements(user_id);

-- admin_notifications
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_by 
ON admin_notifications(created_by);

-- blog_analytics
CREATE INDEX IF NOT EXISTS idx_blog_analytics_user_id 
ON blog_analytics(user_id);

-- blog_topics
CREATE INDEX IF NOT EXISTS idx_blog_topics_generated_post_id 
ON blog_topics(generated_post_id);

-- customer_subscriptions
CREATE INDEX IF NOT EXISTS idx_customer_subscriptions_product_id 
ON customer_subscriptions(product_id);

-- heatmap_data
CREATE INDEX IF NOT EXISTS idx_heatmap_data_user_id 
ON heatmap_data(user_id);

-- notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id 
ON notifications(user_id);

-- outfit_items
CREATE INDEX IF NOT EXISTS idx_outfit_items_outfit_id 
ON outfit_items(outfit_id);

-- saved_outfits
CREATE INDEX IF NOT EXISTS idx_saved_outfits_outfit_id 
ON saved_outfits(outfit_id);

-- style_swipes (correct column is mood_photo_id)
CREATE INDEX IF NOT EXISTS idx_style_swipes_mood_photo_id 
ON style_swipes(mood_photo_id);

-- testimonials
CREATE INDEX IF NOT EXISTS idx_testimonials_created_by 
ON testimonials(created_by);

-- tribe_post_comments
CREATE INDEX IF NOT EXISTS idx_tribe_post_comments_user_id 
ON tribe_post_comments(user_id);

-- tribe_post_likes
CREATE INDEX IF NOT EXISTS idx_tribe_post_likes_user_id 
ON tribe_post_likes(user_id);

-- tribe_posts
CREATE INDEX IF NOT EXISTS idx_tribe_posts_outfit_id 
ON tribe_posts(outfit_id);

-- tribes
CREATE INDEX IF NOT EXISTS idx_tribes_created_by 
ON tribes(created_by);

-- user_points (current_level references levels table)
CREATE INDEX IF NOT EXISTS idx_user_points_current_level 
ON user_points(current_level);

-- user_stats
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id 
ON user_stats(user_id);

-- user_streaks
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id 
ON user_streaks(user_id);
