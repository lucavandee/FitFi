/*
  # Fix notification_preferences RLS Policies

  ## Overview
  The notification_preferences table has RLS enabled but no policies defined.
  This means NO users can access the table, which breaks the notification preferences feature.

  ## Changes
  
  ### RLS Policies Added
  1. SELECT policy - Users can view their own notification preferences
  2. INSERT policy - Users can create their own notification preferences
  3. UPDATE policy - Users can update their own notification preferences
  4. DELETE policy - Users can delete their own notification preferences

  ## Security
  - All policies use (select auth.uid()) for optimal performance
  - Each policy is specific to one operation (not using FOR ALL)
  - Users can only access their own preferences (user_id = auth.uid())
*/

-- SELECT: Users can view own preferences
CREATE POLICY "Users can view own notification preferences"
ON notification_preferences
FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

-- INSERT: Users can create own preferences
CREATE POLICY "Users can insert own notification preferences"
ON notification_preferences
FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

-- UPDATE: Users can update own preferences
CREATE POLICY "Users can update own notification preferences"
ON notification_preferences
FOR UPDATE
TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

-- DELETE: Users can delete own preferences
CREATE POLICY "Users can delete own notification preferences"
ON notification_preferences
FOR DELETE
TO authenticated
USING ((select auth.uid()) = user_id);
