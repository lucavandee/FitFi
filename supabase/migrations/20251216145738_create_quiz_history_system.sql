/*
  # Quiz History & Reset Tracking System

  ## Doel
  Bied gebruikers de mogelijkheid om hun quiz opnieuw te doen en hun stijlevolutie
  te volgen over tijd. Track hoeveel users hun stijl bijwerken voor product insights.

  ## Nieuwe Tabellen

  ### 1. `style_profile_history`
  Archief van alle vorige stijlprofielen van een gebruiker, zodat we kunnen tonen
  hoe hun stijl is geëvolueerd over tijd.

  Kolommen:
  - `id` (uuid, PK) - Unieke ID voor dit historisch profiel
  - `user_id` (uuid, FK) - Referentie naar auth.users
  - `session_id` (text, nullable) - Voor anonieme sessies
  - `profile_data` (jsonb) - Snapshot van het volledige profiel op dat moment
  - `archetype` (jsonb) - Stijlarchetype op dat moment
  - `color_profile` (jsonb) - Kleurprofiel op dat moment
  - `quiz_answers` (jsonb) - Alle quiz antwoorden
  - `created_at` (timestamptz) - Wanneer dit profiel origineel was gemaakt
  - `archived_at` (timestamptz) - Wanneer dit profiel is gearchiveerd (= quiz reset datum)
  - `reset_reason` (text, nullable) - Optionele reden voor reset (UX research)

  ### 2. `quiz_resets`
  Analytics tabel om quiz resets te tracken voor product insights.

  Kolommen:
  - `id` (uuid, PK)
  - `user_id` (uuid, FK)
  - `old_archetype` (text) - Archetype vóór reset
  - `new_archetype` (text, nullable) - Archetype ná reset (wordt later ingevuld)
  - `reset_at` (timestamptz) - Wanneer de reset plaatsvond
  - `reason` (text, nullable) - Waarom wilde user resetten?
  - `days_since_last_quiz` (int) - Hoeveel dagen sinds vorige quiz
  - `completed_new_quiz` (boolean) - Heeft user de nieuwe quiz afgemaakt?
  - `completed_at` (timestamptz, nullable) - Wanneer nieuwe quiz voltooid

  ## Security
  - RLS enabled op beide tabellen
  - Users kunnen alleen hun eigen history zien
  - Users kunnen alleen hun eigen resets triggeren

  ## Indexen
  - Index op user_id voor snelle lookups
  - Index op archived_at voor tijdlijn queries
  - Index op reset_at voor analytics
*/

-- ============================================================================
-- TABLE: style_profile_history
-- ============================================================================

CREATE TABLE IF NOT EXISTS style_profile_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  profile_data jsonb NOT NULL,
  archetype jsonb,
  color_profile jsonb,
  quiz_answers jsonb,
  created_at timestamptz NOT NULL,
  archived_at timestamptz DEFAULT now(),
  reset_reason text,

  -- Constraints
  CONSTRAINT user_or_session_required CHECK (
    user_id IS NOT NULL OR session_id IS NOT NULL
  )
);

-- Indexen voor performance
CREATE INDEX IF NOT EXISTS idx_style_profile_history_user_id
  ON style_profile_history(user_id);
CREATE INDEX IF NOT EXISTS idx_style_profile_history_session_id
  ON style_profile_history(session_id);
CREATE INDEX IF NOT EXISTS idx_style_profile_history_archived_at
  ON style_profile_history(archived_at DESC);

-- RLS
ALTER TABLE style_profile_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile history"
  ON style_profile_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert profile history"
  ON style_profile_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- TABLE: quiz_resets
-- ============================================================================

CREATE TABLE IF NOT EXISTS quiz_resets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  old_archetype text,
  new_archetype text,
  reset_at timestamptz DEFAULT now(),
  reason text,
  days_since_last_quiz int,
  completed_new_quiz boolean DEFAULT false,
  completed_at timestamptz
);

-- Indexen
CREATE INDEX IF NOT EXISTS idx_quiz_resets_user_id
  ON quiz_resets(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_resets_reset_at
  ON quiz_resets(reset_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_resets_completed
  ON quiz_resets(completed_new_quiz);

-- RLS
ALTER TABLE quiz_resets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quiz resets"
  ON quiz_resets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz resets"
  ON quiz_resets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quiz resets"
  ON quiz_resets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- FUNCTION: archive_and_reset_quiz
-- ============================================================================

CREATE OR REPLACE FUNCTION archive_and_reset_quiz(
  p_reset_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_current_profile record;
  v_days_since_last_quiz int;
  v_old_archetype text;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_current_profile
  FROM style_profiles
  WHERE user_id = v_user_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'no_existing_profile',
      'message', 'No existing profile found to archive'
    );
  END IF;

  v_days_since_last_quiz := EXTRACT(DAY FROM (now() - v_current_profile.created_at));

  IF v_current_profile.archetype IS NOT NULL THEN
    v_old_archetype := COALESCE(
      v_current_profile.archetype->>'name',
      v_current_profile.archetype::text
    );
  END IF;

  INSERT INTO style_profile_history (
    user_id,
    session_id,
    profile_data,
    archetype,
    color_profile,
    quiz_answers,
    created_at,
    archived_at,
    reset_reason
  ) VALUES (
    v_current_profile.user_id,
    v_current_profile.session_id,
    jsonb_build_object(
      'id', v_current_profile.id,
      'gender', v_current_profile.gender,
      'sizes', v_current_profile.sizes,
      'budget_range', v_current_profile.budget_range,
      'preferred_occasions', v_current_profile.preferred_occasions,
      'photo_url', v_current_profile.photo_url,
      'color_analysis', v_current_profile.color_analysis,
      'completed_at', v_current_profile.completed_at
    ),
    v_current_profile.archetype,
    v_current_profile.color_profile,
    v_current_profile.quiz_answers,
    v_current_profile.created_at,
    now(),
    p_reset_reason
  );

  INSERT INTO quiz_resets (
    user_id,
    old_archetype,
    reset_at,
    reason,
    days_since_last_quiz,
    completed_new_quiz
  ) VALUES (
    v_user_id,
    v_old_archetype,
    now(),
    p_reset_reason,
    v_days_since_last_quiz,
    false
  );

  DELETE FROM style_profiles
  WHERE user_id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'archived_profile_id', v_current_profile.id,
    'old_archetype', v_old_archetype,
    'days_since_last_quiz', v_days_since_last_quiz,
    'archived_at', now()
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- ============================================================================
-- FUNCTION: get_style_profile_history
-- ============================================================================

CREATE OR REPLACE FUNCTION get_style_profile_history(
  p_user_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_history jsonb;
  v_current_profile jsonb;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'archetype', archetype,
      'color_profile', color_profile,
      'created_at', created_at,
      'archived_at', archived_at,
      'reset_reason', reset_reason,
      'profile_data', profile_data
    )
    ORDER BY archived_at DESC
  )
  INTO v_history
  FROM style_profile_history
  WHERE user_id = v_user_id;

  SELECT jsonb_build_object(
    'id', id,
    'archetype', archetype,
    'color_profile', color_profile,
    'created_at', created_at,
    'is_current', true
  )
  INTO v_current_profile
  FROM style_profiles
  WHERE user_id = v_user_id
  ORDER BY created_at DESC
  LIMIT 1;

  RETURN jsonb_build_object(
    'current_profile', v_current_profile,
    'history', COALESCE(v_history, '[]'::jsonb),
    'total_resets', (
      SELECT COUNT(*) FROM quiz_resets WHERE user_id = v_user_id
    )
  );
END;
$$;

-- ============================================================================
-- ANALYTICS VIEW
-- ============================================================================

CREATE OR REPLACE VIEW quiz_reset_analytics AS
SELECT
  DATE_TRUNC('week', reset_at) as week,
  COUNT(*) as total_resets,
  AVG(days_since_last_quiz) as avg_days_between_resets,
  COUNT(*) FILTER (WHERE completed_new_quiz = true) as completed_new_quiz_count,
  COUNT(*) FILTER (WHERE reason IS NOT NULL) as resets_with_reason
FROM quiz_resets
GROUP BY week
ORDER BY week DESC;
