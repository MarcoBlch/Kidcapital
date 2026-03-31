import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '../store/uiStore';
import { useSupabaseStore } from '../store/supabaseStore';
import { useGameStore } from '../store/gameStore';
import { supabase } from '../lib/supabase';
import type { MultiplayerGame, MultiplayerGamePlayer } from '../types';
import AvatarImage from '../components/ui/AvatarImage';

export default function MultiplayerLobbyScreen() {
    const { t } = useTranslation();
    const setScreen = useUIStore(s => s.setScreen);
    const inviteCode = useUIStore(s => s.multiplayerLobbyCode);
    const session = useSupabaseStore(s => s.session);
    const startMultiplayerGame = useSupabaseStore(s => s.startMultiplayerGame);
    const syncTurnToCloud = useSupabaseStore(s => s.syncTurnToCloud);
    const initMultiplayerLocalGame = useGameStore(s => s.initMultiplayerLocalGame);
    const hydrateFromMultiplayer = useGameStore(s => s.hydrateFromMultiplayer);

    const [game, setGame] = useState<MultiplayerGame | null>(null);
    const [players, setPlayers] = useState<MultiplayerGamePlayer[]>([]);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const myUserId = session?.user.id;
    const isHost = game?.created_by === myUserId;
    const canStart = isHost && players.length >= 2;

    // Fetch initial game data
    const fetchGame = useCallback(async () => {
        if (!inviteCode) return;
        const { data } = await supabase
            .from('multiplayer_games')
            .select('*, players:multiplayer_game_players(*)')
            .eq('invite_code', inviteCode)
            .single();

        if (data) {
            setGame(data as MultiplayerGame);
            setPlayers((data.players as MultiplayerGamePlayer[]).sort((a, b) => a.player_index - b.player_index));

            // If game already became active (e.g. joiner loaded late), hydrate and go to game
            if (data.status === 'active' && data.game_state) {
                hydrateFromMultiplayer(data.game_state);
                setScreen('game');
            }
        }
    }, [inviteCode, hydrateFromMultiplayer, setScreen]);

    useEffect(() => {
        fetchGame();
    }, [fetchGame]);

    // Subscribe to Realtime updates on multiplayer_game_players (new players joining)
    useEffect(() => {
        if (!game?.id) return;

        const playersChannel = supabase
            .channel(`lobby_players_${game.id}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'multiplayer_game_players', filter: `game_id=eq.${game.id}` },
                (payload) => {
                    const newPlayer = payload.new as MultiplayerGamePlayer;
                    setPlayers(prev => {
                        if (prev.some(p => p.user_id === newPlayer.user_id)) return prev;
                        return [...prev, newPlayer].sort((a, b) => a.player_index - b.player_index);
                    });
                },
            )
            .subscribe();

        // Subscribe to game status changes (to detect host starting)
        const gameChannel = supabase
            .channel(`lobby_game_${game.id}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'multiplayer_games', filter: `id=eq.${game.id}` },
                (payload) => {
                    const updated = payload.new as { status: string; game_state: unknown };
                    if (updated.status === 'active' && updated.game_state) {
                        hydrateFromMultiplayer(updated.game_state as ReturnType<typeof useGameStore.getState>);
                        setScreen('game');
                    }
                },
            )
            .subscribe();

        return () => {
            supabase.removeChannel(playersChannel);
            supabase.removeChannel(gameChannel);
        };
    }, [game?.id, hydrateFromMultiplayer, setScreen]);

    const handleCopyCode = () => {
        if (!inviteCode) return;
        navigator.clipboard.writeText(inviteCode).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleStart = async () => {
        if (!game || !myUserId) return;
        setLoading(true);
        try {
            // 1. Mark game as active in DB
            await startMultiplayerGame(game.id, players);

            // 2. Build local game state
            initMultiplayerLocalGame(players, game.difficulty, game.id);

            // 3. Sync initial state to cloud (host's turn first)
            const freshState = useGameStore.getState();
            await syncTurnToCloud(game.id, freshState, myUserId);

            // 4. Navigate to game
            setScreen('game');
        } catch (err) {
            console.error('Failed to start multiplayer game:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!inviteCode) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="min-h-dvh w-full flex flex-col items-center px-5 py-6 safe-top"
            style={{ background: '#FFF8F0' }}
        >
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => setScreen('multiplayer')}
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold cursor-pointer"
                        style={{ background: '#F0EDE8', color: '#5D5D6E' }}
                    >
                        ←
                    </button>
                    <h1 className="font-display text-2xl font-bold" style={{ color: '#1A1A2E' }}>
                        {t('multiplayer.lobby_title')}
                    </h1>
                </div>

                {/* Invite code */}
                <div
                    className="rounded-2xl p-5 mb-6 text-center"
                    style={{ background: '#FFFFFF', border: '2px solid #E0E0E0', boxShadow: '0 3px 0 rgba(0,0,0,0.06)' }}
                >
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#9E9EAF' }}>
                        {t('multiplayer.invite_label')}
                    </p>
                    <p
                        className="font-mono text-4xl font-bold tracking-widest mb-3"
                        style={{ color: '#1A1A2E', letterSpacing: '0.3em' }}
                    >
                        {inviteCode}
                    </p>
                    <button
                        onClick={handleCopyCode}
                        className="px-4 py-1.5 rounded-full text-sm font-bold cursor-pointer transition-all"
                        style={{
                            background: copied ? '#E8F5E9' : '#FFF8E1',
                            color: copied ? '#2E7D32' : '#DAA520',
                            border: `1.5px solid ${copied ? '#4CAF50' : '#FFD700'}`,
                        }}
                    >
                        {copied ? t('multiplayer.copied') : t('multiplayer.copy_code')}
                    </button>
                </div>

                {/* Players list */}
                <div className="mb-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#9E9EAF' }}>
                        {t('multiplayer.players_label', { count: players.length })}
                    </p>
                    <div className="space-y-2">
                        {players.map((p) => (
                            <motion.div
                                key={p.user_id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                                style={{ background: '#FFFFFF', border: '2px solid #E0E0E0', boxShadow: '0 2px 0 rgba(0,0,0,0.05)' }}
                            >
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden shrink-0"
                                    style={{ background: '#F0EDE8' }}
                                >
                                    <AvatarImage avatar={p.avatar} size={32} />
                                </div>
                                <div className="flex-1">
                                    <span className="font-bold text-sm" style={{ color: '#1A1A2E' }}>
                                        {p.username}
                                    </span>
                                    {p.user_id === myUserId && (
                                        <span className="ml-1 text-[10px]" style={{ color: '#9E9EAF' }}>
                                            {t('multiplayer.you')}
                                        </span>
                                    )}
                                </div>
                                {p.player_index === 0 && (
                                    <span className="text-sm">👑</span>
                                )}
                            </motion.div>
                        ))}

                        {/* Empty slots */}
                        {Array.from({ length: Math.max(0, 2 - players.length) }).map((_, i) => (
                            <div
                                key={`empty_${i}`}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                                style={{ background: '#F9F7F4', border: '2px dashed #E0E0E0' }}
                            >
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xl"
                                    style={{ background: '#F0EDE8' }}
                                >
                                    ⏳
                                </div>
                                <span className="text-sm" style={{ color: '#C0BDB8' }}>
                                    {t('multiplayer.waiting_players')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Start button (host only) */}
                {isHost && (
                    <motion.button
                        whileTap={{ y: canStart ? 3 : 0 }}
                        onClick={handleStart}
                        disabled={!canStart || loading}
                        className="w-full py-4 rounded-2xl font-display text-base font-bold cursor-pointer"
                        style={{
                            background: canStart && !loading ? '#FFD700' : '#E0E0E0',
                            color: canStart && !loading ? '#4A3800' : '#9E9EAF',
                            boxShadow: canStart && !loading ? '0 5px 0 #B8860B' : 'none',
                            cursor: canStart && !loading ? 'pointer' : 'not-allowed',
                        }}
                    >
                        {loading
                            ? t('multiplayer.creating')
                            : canStart
                              ? t('multiplayer.start_btn')
                              : t('multiplayer.start_need_2')}
                    </motion.button>
                )}

                {/* Non-host waiting message */}
                {!isHost && (
                    <div
                        className="w-full py-4 rounded-2xl text-center text-sm font-medium"
                        style={{ background: '#F0EDE8', color: '#9E9EAF' }}
                    >
                        {t('multiplayer.waiting_players')}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
