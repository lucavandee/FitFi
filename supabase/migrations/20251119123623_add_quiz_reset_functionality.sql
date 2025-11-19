/*
  # Quiz Herstart Functionaliteit

  1. Nieuwe Functionaliteit
    - Functie voor het resetten van quiz data
    - Behoudt user account maar wist alle stijl-gerelateerde data
    - Audit trail voor quiz resets

  2. Security
    - Users kunnen alleen hun eigen data resetten
    - Admin logging van resets

  3. Notes
    - Dit wist: style_profiles, visual_preferences, style_swipes, saved_outfits
    - Dit behoudt: user account, subscription, gamification progress
*/

-- Function to reset user's quiz data
CREATE OR REPLACE FUNCTION reset_user_quiz_data(user_id_param uuid)
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  result json;
  deleted_profiles int;
  deleted_swipes int;
  deleted_preferences int;
  deleted_outfits int;
BEGIN
  -- Verify the user is resetting their own data
  IF auth.uid() != user_id_param THEN
    RAISE EXCEPTION 'Unauthorized: You can only reset your own quiz data';
  END IF;

  -- Delete style profile
  DELETE FROM style_profiles WHERE user_id = user_id_param;
  GET DIAGNOSTICS deleted_profiles = ROW_COUNT;

  -- Delete visual preferences
  DELETE FROM visual_preferences WHERE user_id = user_id_param;
  GET DIAGNOSTICS deleted_preferences = ROW_COUNT;

  -- Delete style swipes
  DELETE FROM style_swipes WHERE user_id = user_id_param;
  GET DIAGNOSTICS deleted_swipes = ROW_COUNT;

  -- Delete saved outfits
  DELETE FROM saved_outfits WHERE user_id = user_id_param;
  GET DIAGNOSTICS deleted_outfits = ROW_COUNT;

  -- Log the reset in user_activity_log
  INSERT INTO user_activity_log (user_id, action, details)
  VALUES (
    user_id_param,
    'quiz_reset',
    json_build_object(
      'profiles_deleted', deleted_profiles,
      'swipes_deleted', deleted_swipes,
      'preferences_deleted', deleted_preferences,
      'outfits_deleted', deleted_outfits,
      'timestamp', now()
    )
  );

  -- Return summary
  result := json_build_object(
    'success', true,
    'deleted', json_build_object(
      'profiles', deleted_profiles,
      'swipes', deleted_swipes,
      'preferences', deleted_preferences,
      'outfits', deleted_outfits
    )
  );

  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION reset_user_quiz_data(uuid) TO authenticated;

-- Comment on function
COMMENT ON FUNCTION reset_user_quiz_data IS 'Resets all quiz-related data for a user while preserving account and subscription';
