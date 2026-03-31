-- KidCapital V4 — Multiplayer tables (idempotent)
-- Safe to run multiple times.

-- ----------------------------------------------------------------
-- Tables
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS multiplayer_games (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_code           TEXT UNIQUE NOT NULL,
  status                TEXT NOT NULL DEFAULT 'waiting',
  difficulty            TEXT NOT NULL,
  current_player_user_id UUID REFERENCES auth.users(id),
  game_state            JSONB,
  winner_user_id        UUID REFERENCES auth.users(id),
  created_by            UUID REFERENCES auth.users(id) NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

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
-- updated_at trigger
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS multiplayer_games_updated_at ON multiplayer_games;
CREATE TRIGGER multiplayer_games_updated_at
  BEFORE UPDATE ON multiplayer_games
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------
ALTER TABLE multiplayer_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE multiplayer_game_players ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "multiplayer_games_read_all" ON multiplayer_games;
CREATE POLICY "multiplayer_games_read_all"
  ON multiplayer_games FOR SELECT USING (true);

DROP POLICY IF EXISTS "multiplayer_games_insert_auth" ON multiplayer_games;
CREATE POLICY "multiplayer_games_insert_auth"
  ON multiplayer_games FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "multiplayer_games_update_participant" ON multiplayer_games;
CREATE POLICY "multiplayer_games_update_participant"
  ON multiplayer_games FOR UPDATE
  USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM multiplayer_game_players
      WHERE game_id = multiplayer_games.id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "multiplayer_game_players_read_all" ON multiplayer_game_players;
CREATE POLICY "multiplayer_game_players_read_all"
  ON multiplayer_game_players FOR SELECT USING (true);

DROP POLICY IF EXISTS "multiplayer_game_players_insert_self" ON multiplayer_game_players;
CREATE POLICY "multiplayer_game_players_insert_self"
  ON multiplayer_game_players FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------------------------------
-- Realtime
-- ----------------------------------------------------------------
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'multiplayer_games'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE multiplayer_games;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'multiplayer_game_players'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE multiplayer_game_players;
  END IF;
END $$;
