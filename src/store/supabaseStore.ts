import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import type { Difficulty, GameState, MultiplayerGame, MultiplayerGamePlayer } from '../types';

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------

function generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1 to avoid confusion
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

// ---------------------------------------------------------------
// Store interface
// ---------------------------------------------------------------

interface SupabaseStore {
    session: Session | null;
    isInitializing: boolean;
    initializeSession: () => Promise<void>;
    updateProfile: (data: { level: number; xp: number; net_worth: number; avatar: string; username: string }) => Promise<void>;

    // Multiplayer
    createMultiplayerGame: (difficulty: Difficulty, username: string, avatar: string) => Promise<string>;
    joinMultiplayerGame: (inviteCode: string, username: string, avatar: string) => Promise<MultiplayerGame | null>;
    fetchMyPendingGames: () => Promise<MultiplayerGame[]>;
    syncTurnToCloud: (gameId: string, gameState: GameState, nextPlayerUserId: string) => Promise<void>;
    loadMultiplayerGame: (gameId: string) => Promise<GameState | null>;
    startMultiplayerGame: (gameId: string, players: MultiplayerGamePlayer[]) => Promise<void>;
    finishMultiplayerGame: (gameId: string, winnerUserId: string) => Promise<void>;
}

export const useSupabaseStore = create<SupabaseStore>((set, get) => ({
    session: null,
    isInitializing: true,

    initializeSession: async () => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) throw error;

            if (session) {
                set({ session, isInitializing: false });
            } else {
                // Create an anonymous session automatically
                const { data: { session: newSession }, error: signInError } = await supabase.auth.signInAnonymously();
                if (signInError) throw signInError;
                set({ session: newSession, isInitializing: false });
            }
        } catch (error) {
            console.error('Failed to initialize Supabase session:', error);
            set({ isInitializing: false });
        }
    },

    updateProfile: async ({ level, xp, net_worth, avatar, username }) => {
        const { session } = get();
        if (!session?.user) return;

        try {
            const { error } = await supabase.from('profiles').upsert({
                id: session.user.id,
                username,
                avatar,
                level,
                xp,
                net_worth,
            });

            if (error) {
                console.error('Error updating profile in Supabase:', error.message);
            }
        } catch (error) {
            console.error('Exception updating profile:', error);
        }
    },

    // --- Multiplayer ---

    createMultiplayerGame: async (difficulty, username, avatar) => {
        const { session } = get();
        if (!session?.user) throw new Error('Not authenticated');

        const userId = session.user.id;
        // Try up to 3 times to get a unique invite code
        for (let attempt = 0; attempt < 3; attempt++) {
            const inviteCode = generateInviteCode();

            const { data: game, error: gameError } = await supabase
                .from('multiplayer_games')
                .insert({
                    invite_code: inviteCode,
                    difficulty,
                    created_by: userId,
                    current_player_user_id: userId,
                })
                .select('id')
                .single();

            if (gameError) {
                // Unique violation on invite_code → retry
                if (gameError.code === '23505') continue;
                throw gameError;
            }

            // Insert host as player_index=0
            const { error: playerError } = await supabase
                .from('multiplayer_game_players')
                .insert({
                    game_id: game.id,
                    user_id: userId,
                    player_index: 0,
                    username,
                    avatar,
                });

            if (playerError) throw playerError;

            return inviteCode;
        }

        throw new Error('Failed to generate unique invite code after 3 attempts');
    },

    joinMultiplayerGame: async (inviteCode, username, avatar) => {
        const { session } = get();
        if (!session?.user) throw new Error('Not authenticated');

        const userId = session.user.id;
        const code = inviteCode.toUpperCase().trim();

        // Find the game
        const { data: game, error: findError } = await supabase
            .from('multiplayer_games')
            .select('*, players:multiplayer_game_players(*)')
            .eq('invite_code', code)
            .single();

        if (findError || !game) return null;
        if (game.status !== 'waiting') return null;

        // Check if already joined
        const alreadyJoined = game.players.some((p: MultiplayerGamePlayer) => p.user_id === userId);
        if (alreadyJoined) return game as MultiplayerGame;

        // Determine next player_index
        const nextIndex = game.players.length;
        if (nextIndex >= 4) return null; // max 4 players

        const { error: joinError } = await supabase
            .from('multiplayer_game_players')
            .insert({
                game_id: game.id,
                user_id: userId,
                player_index: nextIndex,
                username,
                avatar,
            });

        if (joinError) throw joinError;

        // Return fresh game data with players
        const { data: updatedGame } = await supabase
            .from('multiplayer_games')
            .select('*, players:multiplayer_game_players(*)')
            .eq('id', game.id)
            .single();

        return updatedGame as MultiplayerGame | null;
    },

    fetchMyPendingGames: async () => {
        const { session } = get();
        if (!session?.user) return [];

        const userId = session.user.id;

        const { data, error } = await supabase
            .from('multiplayer_games')
            .select('*, players:multiplayer_game_players(*)')
            .eq('current_player_user_id', userId)
            .eq('status', 'active')
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('fetchMyPendingGames error:', error.message);
            return [];
        }

        return (data ?? []) as MultiplayerGame[];
    },

    syncTurnToCloud: async (gameId, gameState, nextPlayerUserId) => {
        const { error } = await supabase
            .from('multiplayer_games')
            .update({
                game_state: gameState,
                current_player_user_id: nextPlayerUserId,
            })
            .eq('id', gameId);

        if (error) {
            console.error('syncTurnToCloud error:', error.message);
            throw error;
        }
    },

    loadMultiplayerGame: async (gameId) => {
        const { data, error } = await supabase
            .from('multiplayer_games')
            .select('game_state')
            .eq('id', gameId)
            .single();

        if (error || !data?.game_state) return null;

        return data.game_state as GameState;
    },

    startMultiplayerGame: async (gameId, players) => {
        if (players.length < 2) throw new Error('Need at least 2 players to start');

        const hostUserId = players.find(p => p.player_index === 0)?.user_id;
        if (!hostUserId) throw new Error('Host not found');

        const { error } = await supabase
            .from('multiplayer_games')
            .update({
                status: 'active',
                current_player_user_id: hostUserId,
            })
            .eq('id', gameId);

        if (error) throw error;
    },

    finishMultiplayerGame: async (gameId, winnerUserId) => {
        const { error } = await supabase
            .from('multiplayer_games')
            .update({
                status: 'finished',
                winner_user_id: winnerUserId,
            })
            .eq('id', gameId);

        if (error) {
            console.error('finishMultiplayerGame error:', error.message);
        }
    },
}));
