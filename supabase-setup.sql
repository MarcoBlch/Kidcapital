-- Run this script in your Supabase SQL Editor

-- 1. Create the profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username text UNIQUE NOT NULL,
  avatar text NOT NULL,
  level integer DEFAULT 1,
  xp integer DEFAULT 0,
  net_worth integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_active timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create policies
-- Anyone can view the leaderboard (read profiles)
CREATE POLICY "Public profiles are viewable by everyone." 
ON public.profiles FOR SELECT 
USING ( true );

-- Users can only insert their own profile
CREATE POLICY "Users can insert their own profile." 
ON public.profiles FOR INSERT 
WITH CHECK ( auth.uid() = id );

-- Users can only update their own profile
CREATE POLICY "Users can update own profile." 
ON public.profiles FOR UPDATE 
USING ( auth.uid() = id );

-- 4. Create trigger to update last_active
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_active = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
