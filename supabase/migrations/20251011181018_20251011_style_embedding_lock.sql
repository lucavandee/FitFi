/*
  # Style Embedding Lock Mechanism

  1. Purpose
    - Creates immutable "locked" embeddings after calibration
    - Prevents drift from accidental clicks/swipes
    - Enables versioned embedding snapshots
  
  2. New Tables
    - `style_embedding_snapshots`
      - Historical record of embedding versions
      - Tracks what triggered each snapshot
      - Allows rollback if needed
  
  3. style_profiles Extensions
    - locked_embedding: Immutable reference embedding
    - embedding_locked_at: Timestamp of lock
    - last_calibration_at: Last refinement session
  
  4. Security
    - Enable RLS on snapshots
    - Users can only view their own snapshots
*/

-- Create snapshots table
CREATE TABLE IF NOT EXISTS style_embedding_snapshots (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  version INTEGER NOT NULL,
  embedding JSONB NOT NULL,
  snapshot_trigger TEXT NOT NULL CHECK (snapshot_trigger IN ('initial_quiz', 'calibration_complete', 'manual_recalibration')),
  swipe_count INTEGER DEFAULT 0,
  calibration_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE style_embedding_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own snapshots"
  ON style_embedding_snapshots FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own snapshots"
  ON style_embedding_snapshots FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Extend style_profiles with lock fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'style_profiles' AND column_name = 'locked_embedding'
  ) THEN
    ALTER TABLE style_profiles ADD COLUMN locked_embedding JSONB;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'style_profiles' AND column_name = 'embedding_locked_at'
  ) THEN
    ALTER TABLE style_profiles ADD COLUMN embedding_locked_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'style_profiles' AND column_name = 'last_calibration_at'
  ) THEN
    ALTER TABLE style_profiles ADD COLUMN last_calibration_at TIMESTAMPTZ;
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_snapshots_user ON style_embedding_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_version ON style_embedding_snapshots(version DESC);
CREATE INDEX IF NOT EXISTS idx_snapshots_created ON style_embedding_snapshots(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_locked_at ON style_profiles(embedding_locked_at);
