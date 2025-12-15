/*
  # Optimize Remaining RLS Policies - Part 2 (Fixed)
  
  ## Overview
  Continues optimization of RLS policies by wrapping auth.uid() and auth.jwt() calls 
  in SELECT statements for performance.
  
  ## Tables Covered (Part 2 - Additional tables)
  1. ab_assignments
  2. ab_events
  3. ab_experiments
  4. brand_preferences
  5. chat_messages
  6. customer_subscriptions
  7. nova_memories
  8. nova_swipe_insights
  9. nova_usage
  10. outfit_calibration_feedback
  11. outfit_visuals
  12. preview_outfits
  13. product_interactions
  14. user_product_preferences
  15. user_weekly_progress
  16. stripe_customers
  17. stripe_subscriptions
  18. tribe_members
  19. tribe_posts
  20. tribe_post_likes
  21. tribe_post_comments
  22. blog_posts
  23. testimonials
*/

-- =====================================================
-- AB_ASSIGNMENTS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own assignments" ON ab_assignments;
CREATE POLICY "Users can view own assignments"
ON ab_assignments FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own assignments" ON ab_assignments;
CREATE POLICY "Users can insert own assignments"
ON ab_assignments FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

-- =====================================================
-- AB_EVENTS
-- =====================================================

DROP POLICY IF EXISTS "Users can insert ab events" ON ab_events;
CREATE POLICY "Users can insert ab events"
ON ab_events FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view own ab events" ON ab_events;
CREATE POLICY "Users can view own ab events"
ON ab_events FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

-- =====================================================
-- AB_EXPERIMENTS (public view)
-- =====================================================

DROP POLICY IF EXISTS "Users can view experiments" ON ab_experiments;
CREATE POLICY "Users can view experiments"
ON ab_experiments FOR SELECT
TO authenticated
USING (true);

-- =====================================================
-- BRAND_PREFERENCES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own brand preferences" ON brand_preferences;
CREATE POLICY "Users can view own brand preferences"
ON brand_preferences FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert brand preferences" ON brand_preferences;
CREATE POLICY "Users can insert brand preferences"
ON brand_preferences FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update brand preferences" ON brand_preferences;
CREATE POLICY "Users can update brand preferences"
ON brand_preferences FOR UPDATE
TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

-- =====================================================
-- CHAT_MESSAGES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own messages" ON chat_messages;
CREATE POLICY "Users can view own messages"
ON chat_messages FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert messages" ON chat_messages;
CREATE POLICY "Users can insert messages"
ON chat_messages FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

-- =====================================================
-- CUSTOMER_SUBSCRIPTIONS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own subscriptions" ON customer_subscriptions;
CREATE POLICY "Users can view own subscriptions"
ON customer_subscriptions FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert subscriptions" ON customer_subscriptions;
CREATE POLICY "Users can insert subscriptions"
ON customer_subscriptions FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update subscriptions" ON customer_subscriptions;
CREATE POLICY "Users can update subscriptions"
ON customer_subscriptions FOR UPDATE
TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

-- =====================================================
-- NOVA_MEMORIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own memories" ON nova_memories;
CREATE POLICY "Users can view own memories"
ON nova_memories FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert memories" ON nova_memories;
CREATE POLICY "Users can insert memories"
ON nova_memories FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update memories" ON nova_memories;
CREATE POLICY "Users can update memories"
ON nova_memories FOR UPDATE
TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

-- =====================================================
-- NOVA_SWIPE_INSIGHTS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own swipe insights" ON nova_swipe_insights;
CREATE POLICY "Users can view own swipe insights"
ON nova_swipe_insights FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert swipe insights" ON nova_swipe_insights;
CREATE POLICY "Users can insert swipe insights"
ON nova_swipe_insights FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

-- =====================================================
-- NOVA_USAGE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own usage" ON nova_usage;
CREATE POLICY "Users can view own usage"
ON nova_usage FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert usage" ON nova_usage;
CREATE POLICY "Users can insert usage"
ON nova_usage FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update usage" ON nova_usage;
CREATE POLICY "Users can update usage"
ON nova_usage FOR UPDATE
TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

-- =====================================================
-- OUTFIT_CALIBRATION_FEEDBACK
-- =====================================================

DROP POLICY IF EXISTS "Users can view own calibration feedback" ON outfit_calibration_feedback;
CREATE POLICY "Users can view own calibration feedback"
ON outfit_calibration_feedback FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert calibration feedback" ON outfit_calibration_feedback;
CREATE POLICY "Users can insert calibration feedback"
ON outfit_calibration_feedback FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

-- =====================================================
-- OUTFIT_VISUALS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own outfit visuals" ON outfit_visuals;
CREATE POLICY "Users can view own outfit visuals"
ON outfit_visuals FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert outfit visuals" ON outfit_visuals;
CREATE POLICY "Users can insert outfit visuals"
ON outfit_visuals FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update outfit visuals" ON outfit_visuals;
CREATE POLICY "Users can update outfit visuals"
ON outfit_visuals FOR UPDATE
TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

-- =====================================================
-- PREVIEW_OUTFITS (anonymous access)
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view preview outfits" ON preview_outfits;
CREATE POLICY "Anyone can view preview outfits"
ON preview_outfits FOR SELECT
TO anon, authenticated
USING (true);

-- =====================================================
-- PRODUCT_INTERACTIONS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own interactions" ON product_interactions;
CREATE POLICY "Users can view own interactions"
ON product_interactions FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert interactions" ON product_interactions;
CREATE POLICY "Users can insert interactions"
ON product_interactions FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

-- =====================================================
-- USER_PRODUCT_PREFERENCES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own product preferences" ON user_product_preferences;
CREATE POLICY "Users can view own product preferences"
ON user_product_preferences FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert product preferences" ON user_product_preferences;
CREATE POLICY "Users can insert product preferences"
ON user_product_preferences FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update product preferences" ON user_product_preferences;
CREATE POLICY "Users can update product preferences"
ON user_product_preferences FOR UPDATE
TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

-- =====================================================
-- USER_WEEKLY_PROGRESS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own progress" ON user_weekly_progress;
CREATE POLICY "Users can view own progress"
ON user_weekly_progress FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert progress" ON user_weekly_progress;
CREATE POLICY "Users can insert progress"
ON user_weekly_progress FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update progress" ON user_weekly_progress;
CREATE POLICY "Users can update progress"
ON user_weekly_progress FOR UPDATE
TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

-- =====================================================
-- STRIPE_CUSTOMERS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own stripe data" ON stripe_customers;
CREATE POLICY "Users can view own stripe data"
ON stripe_customers FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

-- =====================================================
-- STRIPE_SUBSCRIPTIONS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own stripe subscriptions" ON stripe_subscriptions;
CREATE POLICY "Users can view own stripe subscriptions"
ON stripe_subscriptions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM stripe_customers 
    WHERE stripe_customers.customer_id = stripe_subscriptions.customer_id 
    AND stripe_customers.user_id = (select auth.uid())
  )
);

-- =====================================================
-- TRIBE_MEMBERS
-- =====================================================

DROP POLICY IF EXISTS "Users can view tribe members" ON tribe_members;
CREATE POLICY "Users can view tribe members"
ON tribe_members FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can join tribes" ON tribe_members;
CREATE POLICY "Users can join tribes"
ON tribe_members FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can leave tribes" ON tribe_members;
CREATE POLICY "Users can leave tribes"
ON tribe_members FOR DELETE
TO authenticated
USING ((select auth.uid()) = user_id);

-- =====================================================
-- TRIBE_POSTS
-- =====================================================

DROP POLICY IF EXISTS "Users can view tribe posts" ON tribe_posts;
CREATE POLICY "Users can view tribe posts"
ON tribe_posts FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tribe_members 
    WHERE tribe_members.tribe_id = tribe_posts.tribe_id 
    AND tribe_members.user_id = (select auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can create tribe posts" ON tribe_posts;
CREATE POLICY "Users can create tribe posts"
ON tribe_posts FOR INSERT
TO authenticated
WITH CHECK (
  (select auth.uid()) = user_id AND
  EXISTS (
    SELECT 1 FROM tribe_members 
    WHERE tribe_members.tribe_id = tribe_posts.tribe_id 
    AND tribe_members.user_id = (select auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can update own posts" ON tribe_posts;
CREATE POLICY "Users can update own posts"
ON tribe_posts FOR UPDATE
TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own posts" ON tribe_posts;
CREATE POLICY "Users can delete own posts"
ON tribe_posts FOR DELETE
TO authenticated
USING ((select auth.uid()) = user_id);

-- =====================================================
-- TRIBE_POST_LIKES
-- =====================================================

DROP POLICY IF EXISTS "Users can view post likes" ON tribe_post_likes;
CREATE POLICY "Users can view post likes"
ON tribe_post_likes FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can like posts" ON tribe_post_likes;
CREATE POLICY "Users can like posts"
ON tribe_post_likes FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can unlike posts" ON tribe_post_likes;
CREATE POLICY "Users can unlike posts"
ON tribe_post_likes FOR DELETE
TO authenticated
USING ((select auth.uid()) = user_id);

-- =====================================================
-- TRIBE_POST_COMMENTS
-- =====================================================

DROP POLICY IF EXISTS "Users can view comments" ON tribe_post_comments;
CREATE POLICY "Users can view comments"
ON tribe_post_comments FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can create comments" ON tribe_post_comments;
CREATE POLICY "Users can create comments"
ON tribe_post_comments FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own comments" ON tribe_post_comments;
CREATE POLICY "Users can update own comments"
ON tribe_post_comments FOR UPDATE
TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON tribe_post_comments;
CREATE POLICY "Users can delete own comments"
ON tribe_post_comments FOR DELETE
TO authenticated
USING ((select auth.uid()) = user_id);

-- =====================================================
-- BLOG_POSTS (public read for published status)
-- =====================================================

DROP POLICY IF EXISTS "Anyone can read published posts" ON blog_posts;
CREATE POLICY "Anyone can read published posts"
ON blog_posts FOR SELECT
TO anon, authenticated
USING (status = 'published');

-- =====================================================
-- TESTIMONIALS (public read for active/verified)
-- =====================================================

DROP POLICY IF EXISTS "Anyone can read active testimonials" ON testimonials;
CREATE POLICY "Anyone can read active testimonials"
ON testimonials FOR SELECT
TO anon, authenticated
USING (is_active = true AND is_verified = true);

DROP POLICY IF EXISTS "Users can submit testimonials" ON testimonials;
CREATE POLICY "Users can submit testimonials"
ON testimonials FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = created_by);

DROP POLICY IF EXISTS "Users can update own testimonials" ON testimonials;
CREATE POLICY "Users can update own testimonials"
ON testimonials FOR UPDATE
TO authenticated
USING ((select auth.uid()) = created_by)
WITH CHECK ((select auth.uid()) = created_by);
