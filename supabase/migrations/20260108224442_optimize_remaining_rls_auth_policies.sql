/*
  # Optimize Remaining RLS Policies - Auth Function Performance (Part 2)

  ## Summary
  This migration optimizes 10 additional RLS policies that directly call auth functions.
  These direct calls cause the database to re-evaluate the function for each row, creating performance issues at scale.

  ## Changes Made
  - Wrapped all `auth.jwt()` calls with `(select auth.jwt())` to prevent per-row re-evaluation
  - Wrapped all `auth.uid()` calls with `(select auth.uid())` where needed
  - Preserved all existing policy logic exactly as-is
  - Used CASCADE drops to handle dependencies safely

  ## Affected Tables (10 policies total)
  - mood_photos: 4 policies (Admins can delete/insert/update/view)
  - weekly_challenge_templates: 1 policy (Admins can manage)
  - notification_log: 1 policy (Admins can view all)
  - outfit_match_feedback: 1 policy (Admins can view all)
  - ab_experiments: 1 policy (Admins can manage)
  - ab_assignments: 1 policy (Admins can view all)
  - ab_events: 1 policy (Admins can view all)

  ## Performance Impact
  - Queries will execute significantly faster on tables with many rows
  - Auth function calls now execute once per query instead of once per row
  - No change to security model - all policies maintain identical logic
*/

-- mood_photos (4 policies)
DROP POLICY IF EXISTS "Admins can delete mood photos" ON mood_photos CASCADE;
CREATE POLICY "Admins can delete mood photos"
  ON mood_photos FOR DELETE
  TO authenticated
  USING (((select auth.jwt()) ->> 'email'::text) LIKE '%@fitfi.ai');

DROP POLICY IF EXISTS "Admins can insert mood photos" ON mood_photos CASCADE;
CREATE POLICY "Admins can insert mood photos"
  ON mood_photos FOR INSERT
  TO authenticated
  WITH CHECK (((select auth.jwt()) ->> 'email'::text) LIKE '%@fitfi.ai');

DROP POLICY IF EXISTS "Admins can update mood photos" ON mood_photos CASCADE;
CREATE POLICY "Admins can update mood photos"
  ON mood_photos FOR UPDATE
  TO authenticated
  USING (((select auth.jwt()) ->> 'email'::text) LIKE '%@fitfi.ai')
  WITH CHECK (((select auth.jwt()) ->> 'email'::text) LIKE '%@fitfi.ai');

DROP POLICY IF EXISTS "Admins can view all mood photos" ON mood_photos CASCADE;
CREATE POLICY "Admins can view all mood photos"
  ON mood_photos FOR SELECT
  TO authenticated
  USING (((select auth.jwt()) ->> 'email'::text) LIKE '%@fitfi.ai');

-- weekly_challenge_templates (1 policy)
DROP POLICY IF EXISTS "Admins can manage challenge templates" ON weekly_challenge_templates CASCADE;
CREATE POLICY "Admins can manage challenge templates"
  ON weekly_challenge_templates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE users.id = (select auth.uid())
        AND users.email::text IN (
          SELECT unnest(string_to_array(current_setting('app.admin_emails'::text, true), ','))
        )
    )
  );

-- notification_log (1 policy)
DROP POLICY IF EXISTS "Admins can view all notification logs" ON notification_log CASCADE;
CREATE POLICY "Admins can view all notification logs"
  ON notification_log FOR SELECT
  TO authenticated
  USING (
    (((select auth.jwt()) ->> 'email'::text) = 'admin@fitfi.nl') OR
    (((select auth.jwt()) ->> 'email'::text) = 'support@fitfi.nl') OR
    ((((select auth.jwt()) -> 'app_metadata'::text) ->> 'is_admin'::text)::boolean = true)
  );

-- outfit_match_feedback (1 policy)
DROP POLICY IF EXISTS "Admins can view all feedback" ON outfit_match_feedback CASCADE;
CREATE POLICY "Admins can view all feedback"
  ON outfit_match_feedback FOR SELECT
  TO authenticated
  USING (
    COALESCE(
      (((select auth.jwt()) -> 'app_metadata'::text) ->> 'is_admin'::text)::boolean,
      false
    )
  );

-- ab_experiments (1 policy)
DROP POLICY IF EXISTS "Admins can manage experiments" ON ab_experiments CASCADE;
CREATE POLICY "Admins can manage experiments"
  ON ab_experiments FOR ALL
  TO authenticated
  USING (
    COALESCE(
      (((select auth.jwt()) -> 'app_metadata'::text) ->> 'is_admin'::text)::boolean,
      false
    )
  )
  WITH CHECK (
    COALESCE(
      (((select auth.jwt()) -> 'app_metadata'::text) ->> 'is_admin'::text)::boolean,
      false
    )
  );

-- ab_assignments (1 policy)
DROP POLICY IF EXISTS "Admins can view all assignments" ON ab_assignments CASCADE;
CREATE POLICY "Admins can view all assignments"
  ON ab_assignments FOR SELECT
  TO authenticated
  USING (
    COALESCE(
      (((select auth.jwt()) -> 'app_metadata'::text) ->> 'is_admin'::text)::boolean,
      false
    )
  );

-- ab_events (1 policy)
DROP POLICY IF EXISTS "Admins can view all events" ON ab_events CASCADE;
CREATE POLICY "Admins can view all events"
  ON ab_events FOR SELECT
  TO authenticated
  USING (
    COALESCE(
      (((select auth.jwt()) -> 'app_metadata'::text) ->> 'is_admin'::text)::boolean,
      false
    )
  );
