-- RLS policies for quiz_achievements table
-- Ensures users can only access their own achievements

-- Drop existing policies if they exist
drop policy if exists "Users can select own achievements" on quiz_achievements;
drop policy if exists "Users can insert own achievements" on quiz_achievements;
drop policy if exists "Users can update own achievements" on quiz_achievements;

-- Create secure policies for quiz_achievements
create policy "Users can select own achievements"
  on quiz_achievements for select
  using (auth.uid() = user_id);

create policy "Users can insert own achievements"
  on quiz_achievements for insert
  with check (auth.uid() = user_id);

create policy "Users can update own achievements"
  on quiz_achievements for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Ensure RLS is enabled
alter table quiz_achievements enable row level security;