-- KidCapital V4 — Multiplayer tables
-- Run this via the Supabase SQL editor or `supabase db push`

-- ----------------------------------------------------------------
-- Table: multiplayer_games
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS multiplayer_games (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_code           TEXT UNIQUE NOT NULL,
  status                TEXT NOT NULL DEFAULT 'waiting',  -- 'waiting' | 'active' | 'finished'
  difficulty            TEXT NOT NULL,
  current_player_user_id UUID REFERENCES auth.users(id),
  game_state            JSONB,
  winner_user_id        UUID REFERENCES auth.users(id),
  created_by            UUID REFERENCES auth.users(id) NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER multiplayer_games_updated_at
  BEFORE UPDATE ON multiplayer_games
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------
-- Table: multiplayer_game_players
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS multiplayer_game_players (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id      UUID NOT NULL REFERENCES multiplayer_games(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id),
  player_index INT NOT NULL,
  username     TEXT NOT NULL,
  avatar       TEXT NOT NULL,
  joined_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(game_id, user_id),
  UNIQUE(game_id, player_index)
);

-- ----------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------
ALTER TABLE multiplayer_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE multiplayer_game_players ENABLE ROW LEVEL SECURITY;

-- multiplayer_games: anyone can read (needed to join by invite_code)
CREATE POLICY "multiplayer_games_read_all"
  ON multiplayer_games FOR SELECT
  USING (true);

-- multiplayer_games: only participants can update
CREATE POLICY "multiplayer_games_update_participant"
  ON multiplayer_games FOR UPDATE
  USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM multiplayer_game_players
      WHERE game_id = multiplayer_games.id
        AND user_id = auth.uid()
    )
  );

-- multiplayer_games: only authenticated users can insert
CREATE POLICY "multiplayer_games_insert_auth"
  ON multiplayer_games FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- multiplayer_game_players: anyone can read
CREATE POLICY "multiplayer_game_players_read_all"
  ON multiplayer_game_players FOR SELECT
  USING (true);

-- multiplayer_game_players: users can only insert their own row
CREATE POLICY "multiplayer_game_players_insert_self"
  ON multiplayer_game_players FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------------------------------
-- Realtime: enable publication for live lobby updates
-- ----------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE multiplayer_games;
ALTER PUBLICATION supabase_realtime ADD TABLE multiplayer_game_players;
