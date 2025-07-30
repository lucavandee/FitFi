/*
  # Create profiles table with auto-creation

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `avatar_url` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `profiles` table
    - Add policy for users to read/insert their own data

  3. Auto-creation
    - Trigger function to auto-create profile on user signup
    - Ensures every auth.user has corresponding profile
*/

-- Create profiles table
create table if not exists public.profiles (
  id         uuid primary key references auth.users on delete cascade,
  full_name  text,
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies for profile access
create policy "profiles_select_own"
  on public.profiles for select
  using ( auth.uid() = id );

create policy "profiles_insert_own"
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "profiles_update_own"
  on public.profiles for update
  using ( auth.uid() = id );

-- Auto-creation trigger function
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles(id, full_name) 
  values (new.id, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for auto-profile creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();