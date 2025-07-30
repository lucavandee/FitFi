/*
  # Auto Profile Creation

  1. New Tables
    - `profiles` table with minimal structure
    - Auto-created for every new auth user

  2. Security
    - Enable RLS on profiles table
    - Users can only access their own profile

  3. Automation
    - Trigger automatically creates profile on user signup
    - No manual profile creation needed
*/

-- Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- RLS Policies
create policy "profiles_select_own"
  on public.profiles for select
  using ( auth.uid() = id );

create policy "profiles_insert_own"
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "profiles_update_own"
  on public.profiles for update
  using ( auth.uid() = id );

-- Auto-insert function
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles(id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Drop existing trigger if exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();