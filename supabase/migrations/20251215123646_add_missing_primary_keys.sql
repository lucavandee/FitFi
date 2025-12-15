/*
  # Add Missing Primary Keys

  ## Overview
  This migration adds primary keys to tables that are missing them.
  Primary keys are essential for:
  - Data integrity (preventing duplicate rows)
  - Performance (automatic index on PK)
  - Foreign key relationships
  - Proper replication and backup

  ## Changes
  
  ### Primary Keys Added
  1. user_stats(user_id) - one stats record per user
  2. user_streaks(user_id) - one streak record per user

  ## Data Cleanup
  - Removes duplicate rows from user_stats, keeping the most recent (by updated_at)
  - Removes duplicate rows from user_streaks, keeping the most recent (by last_check_date)

  ## Notes
  - Both tables logically have a 1:1 relationship with users
  - user_id already has a foreign key to auth.users
  - Adding PK also creates an index automatically
*/

-- Clean up user_stats duplicates
-- Keep only the most recent record for each user_id
DELETE FROM user_stats
WHERE ctid NOT IN (
  SELECT DISTINCT ON (user_id) ctid
  FROM user_stats
  ORDER BY user_id, updated_at DESC NULLS LAST, xp DESC NULLS LAST
);

-- Add primary key to user_stats
ALTER TABLE user_stats
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE user_stats
ADD CONSTRAINT user_stats_pkey PRIMARY KEY (user_id);

-- Clean up user_streaks duplicates
-- Keep only the most recent record for each user_id
DELETE FROM user_streaks
WHERE ctid NOT IN (
  SELECT DISTINCT ON (user_id) ctid
  FROM user_streaks
  ORDER BY user_id, last_check_date DESC NULLS LAST, current_streak DESC NULLS LAST
);

-- Add primary key to user_streaks
ALTER TABLE user_streaks
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE user_streaks
ADD CONSTRAINT user_streaks_pkey PRIMARY KEY (user_id);
