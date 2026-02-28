-- Run this script in your Supabase SQL Editor

-- 1. Create the games table for realtime multiplayer
CREATE TABLE IF NOT EXISTS public.games (
  id text PRIMARY KEY, -- We'll use a 5-letter code (e.g. AX7BQ)
  host_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'waiting', -- 'waiting', 'playing', 'finished'
  max_players integer NOT NULL DEFAULT 4,
  state_json jsonb, -- The full Zustand gameStore state
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the game_players table
CREATE TABLE IF NOT EXISTS public.game_players (
  game_id text REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (game_id, profile_id)
);

-- 3. Enable RLS
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_players ENABLE ROW LEVEL SECURITY;

-- 4. Policies for games table
-- Anyone can view games
CREATE POLICY "Public games are viewable by everyone." 
ON public.games FOR SELECT USING (true);

-- Authenticated users can create a game
CREATE POLICY "Users can create a game." 
ON public.games FOR INSERT WITH CHECK (auth.uid() = host_id);

-- Only the host or players in the game can update the state
CREATE POLICY "Players can update the game state." 
ON public.games FOR UPDATE USING (
  auth.uid() = host_id OR 
  auth.uid() IN (SELECT profile_id FROM public.game_players WHERE game_id = id)
);

-- 5. Policies for game_players table
-- Anyone can view players in a game
CREATE POLICY "Public game players are viewable by everyone." 
ON public.game_players FOR SELECT USING (true);

-- A user can join a game
CREATE POLICY "Users can join a game." 
ON public.game_players FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- A user can leave a game
CREATE POLICY "Users can leave a game." 
ON public.game_players FOR DELETE USING (auth.uid() = profile_id);

-- 6. Enable Realtime on the games table
-- (This is required to listen to state_json updates)
alter publication supabase_realtime add table public.games;
