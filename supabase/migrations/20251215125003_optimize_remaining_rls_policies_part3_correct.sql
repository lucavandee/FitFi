/*
  # Optimize Remaining RLS Policies - Part 3 (Final - Corrected)
  
  ## Overview
  Final optimization of remaining RLS policies by wrapping auth.uid() calls 
  in SELECT statements for performance.
  
  ## Tables Covered (Part 3 - Final set)
  1. blog_analytics
  2. blog_topics
  3. contact_submissions (no user tracking)
  4. mood_photos
  5. newsletter_subscribers (no user tracking)
  6. notification_log
  7. tribes
  8. tribe_likes
  9. ab_test_variants (public read)
  10. levels (public read)
  11. products (public read)
  12. style_embedding_snapshots
*/

-- =====================================================
-- BLOG_ANALYTICS
-- =====================================================

DROP POLICY IF EXISTS "Anyone can insert analytics" ON blog_analytics;
CREATE POLICY "Anyone can insert analytics"
ON blog_analytics FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own analytics" ON blog_analytics;
CREATE POLICY "Users can view own analytics"
ON blog_analytics FOR SELECT
TO authenticated
USING (user_id IS NULL OR (select auth.uid()) = user_id);

-- =====================================================
-- BLOG_TOPICS (public read for admin)
-- =====================================================

DROP POLICY IF EXISTS "Anyone can read topics" ON blog_topics;
CREATE POLICY "Anyone can read topics"
ON blog_topics FOR SELECT
TO authenticated
USING (true);

-- =====================================================
-- CONTACT_SUBMISSIONS (no user_id column)
-- =====================================================

DROP POLICY IF EXISTS "Anyone can submit contact forms" ON contact_submissions;
CREATE POLICY "Anyone can submit contact forms"
ON contact_submissions FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- =====================================================
-- NEWSLETTER_SUBSCRIBERS (no user_id column)
-- =====================================================

DROP POLICY IF EXISTS "Anyone can subscribe" ON newsletter_subscribers;
CREATE POLICY "Anyone can subscribe"
ON newsletter_subscribers FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view newsletters" ON newsletter_subscribers;
CREATE POLICY "Anyone can view newsletters"
ON newsletter_subscribers FOR SELECT
TO authenticated
USING (true);

-- =====================================================
-- NOTIFICATION_LOG
-- =====================================================

DROP POLICY IF EXISTS "Users can view own notification log" ON notification_log;
CREATE POLICY "Users can view own notification log"
ON notification_log FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert notification log" ON notification_log;
CREATE POLICY "Users can insert notification log"
ON notification_log FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update notification log" ON notification_log;
CREATE POLICY "Users can update notification log"
ON notification_log FOR UPDATE
TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

-- =====================================================
-- TRIBES
-- =====================================================

DROP POLICY IF EXISTS "Users can view tribes" ON tribes;
CREATE POLICY "Users can view tribes"
ON tribes FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can create tribes" ON tribes;
CREATE POLICY "Users can create tribes"
ON tribes FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = created_by);

DROP POLICY IF EXISTS "Creators can update tribes" ON tribes;
CREATE POLICY "Creators can update tribes"
ON tribes FOR UPDATE
TO authenticated
USING ((select auth.uid()) = created_by)
WITH CHECK ((select auth.uid()) = created_by);

-- =====================================================
-- TRIBE_LIKES
-- =====================================================

DROP POLICY IF EXISTS "Users can view likes" ON tribe_likes;
CREATE POLICY "Users can view likes"
ON tribe_likes FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can like content" ON tribe_likes;
CREATE POLICY "Users can like content"
ON tribe_likes FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can unlike content" ON tribe_likes;
CREATE POLICY "Users can unlike content"
ON tribe_likes FOR DELETE
TO authenticated
USING ((select auth.uid()) = user_id);

-- =====================================================
-- STYLE_EMBEDDING_SNAPSHOTS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own snapshots" ON style_embedding_snapshots;
CREATE POLICY "Users can view own snapshots"
ON style_embedding_snapshots FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert snapshots" ON style_embedding_snapshots;
CREATE POLICY "Users can insert snapshots"
ON style_embedding_snapshots FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

-- =====================================================
-- PUBLIC READ TABLES (no user_id)
-- =====================================================

-- AB_TEST_VARIANTS: Public read
DROP POLICY IF EXISTS "Anyone can view variants" ON ab_test_variants;
CREATE POLICY "Anyone can view variants"
ON ab_test_variants FOR SELECT
TO authenticated
USING (true);

-- LEVELS: Public read
DROP POLICY IF EXISTS "Anyone can view levels" ON levels;
CREATE POLICY "Anyone can view levels"
ON levels FOR SELECT
TO authenticated
USING (true);

-- PRODUCTS: Public read
DROP POLICY IF EXISTS "Anyone can view products" ON products;
CREATE POLICY "Anyone can view products"
ON products FOR SELECT
TO anon, authenticated
USING (true);

-- MOOD_PHOTOS: Public read with gender filter
DROP POLICY IF EXISTS "Users can view appropriate mood photos" ON mood_photos;
CREATE POLICY "Users can view appropriate mood photos"
ON mood_photos FOR SELECT
TO authenticated
USING (
  gender = (SELECT gender FROM profiles WHERE id = (select auth.uid())) 
  OR gender IS NULL
  OR gender = 'unisex'
);
