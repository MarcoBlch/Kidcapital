import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '../store/uiStore';
import { useSupabaseStore } from '../store/supabaseStore';
import { useGameStore } from '../store/gameStore';
import { safeGetItem } from '../utils/safeStorage';
import { PLAYER_AVATARS } from '../utils/constants';
import type { Difficulty } from '../types';

type Tab = 'create' | 'join';

export default function MultiplayerScreen() {
    const { t } = useTranslation();
    const setScreen = useUIStore(s => s.setScreen);
    const createMultiplayerGame = useSupabaseStore(s => s.createMultiplayerGame);
    const joinMultiplayerGame = useSupabaseStore(s => s.joinMultiplayerGame);
    const session = useSupabaseStore(s => s.session);

    const savedName = safeGetItem('kidcapital_player_name') || '';
    const players = useGameStore(s => s.players);
    const humanPlayer = players.find(p => p.isHuman);
    const username = humanPlayer?.name || savedName || 'Player';
    const avatar = humanPlayer?.avatar || PLAYER_AVATARS[0];

    const [tab, setTab] = useState<Tab>('create');
    const [difficulty, setDifficulty] = useState<Difficulty>('11-14');
    const [inviteCodeInput, setInviteCodeInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Store invite code in store for lobby to read
    const [createdInviteCode, setCreatedInviteCode] = useState<string | null>(null);

    if (!session) return null;

    const handleCreate = async () => {
        setLoading(true);
        setError(null);
        try {
            const inviteCode = await createMultiplayerGame(difficulty, username, avatar);
            setCreatedInviteCode(inviteCode);
            // Navigate to lobby — pass code via local state embedded in uiStore or just go
            useUIStore.getState().setMultiplayerLobbyCode(inviteCode);
            setScreen('multiplayer_lobby');
        } catch {
            setError(t('multiplayer.error_create'));
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        const code = inviteCodeInput.trim().toUpperCase();
        if (code.length !== 6) return;

        setLoading(true);
        setError(null);
        try {
            const game = await joinMultiplayerGame(code, username, avatar);
            if (!game) {
                setError(t('multiplayer.game_not_found'));
                return;
            }
            useUIStore.getState().setMultiplayerLobbyCode(code);
            setScreen('multiplayer_lobby');
        } catch {
            setError(t('multiplayer.error_join'));
        } finally {
            setLoading(false);
        }
    };

    const difficultyOptions: { value: Difficulty; label: string }[] = [
        { value: '8-10', label: t('setup.diff_easy') },
        { value: '11-14', label: t('setup.diff_med') },
        { value: '15-18', label: t('setup.diff_hard') },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="min-h-dvh w-full flex flex-col items-center px-5 py-6 safe-top"
            style={{ background: '#FFF8F0' }}
        >
            <div className="w-full max-w-md">
                {/* Back button + title */}
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => setScreen('setup')}
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold cursor-pointer"
                        style={{ background: '#F0EDE8', color: '#5D5D6E' }}
                    >
                        ←
                    </button>
                    <h1 className="font-display text-2xl font-bold" style={{ color: '#1A1A2E' }}>
                        {t('multiplayer.title')}
                    </h1>
                </div>

                {/* Tab switcher */}
                <div
                    className="flex rounded-2xl p-1 mb-6"
                    style={{ background: '#F0EDE8' }}
                >
                    {(['create', 'join'] as Tab[]).map(tabKey => (
                        <button
                            key={tabKey}
                            onClick={() => { setTab(tabKey); setError(null); }}
                            className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer"
                            style={{
                                background: tab === tabKey ? '#FFD700' : 'transparent',
                                color: tab === tabKey ? '#4A3800' : '#9E9EAF',
                                boxShadow: tab === tabKey ? '0 2px 0 #B8860B' : 'none',
                            }}
                        >
                            {t(`multiplayer.tab_${tabKey}`)}
                        </button>
                    ))}
                </div>

                {/* Create tab */}
                {tab === 'create' && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: '#9E9EAF' }}>
                                {t('multiplayer.difficulty_label')}
                            </label>
                            <div className="flex gap-2">
                                {difficultyOptions.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setDifficulty(opt.value)}
                                        className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer"
                                        style={{
                                            background: difficulty === opt.value ? '#FFF8E1' : '#FFFFFF',
                                            border: `2px solid ${difficulty === opt.value ? '#FFD700' : '#E0E0E0'}`,
                                            color: difficulty === opt.value ? '#DAA520' : '#9E9EAF',
                                            boxShadow: difficulty === opt.value ? '0 3px 0 #B8860B' : '0 2px 0 rgba(0,0,0,0.05)',
                                        }}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <motion.button
                            whileTap={{ y: 3 }}
                            onClick={handleCreate}
                            disabled={loading}
                            className="w-full py-4 rounded-2xl font-display text-base font-bold cursor-pointer"
                            style={{
                                background: loading ? '#E0E0E0' : '#FFD700',
                                color: loading ? '#9E9EAF' : '#4A3800',
                                boxShadow: loading ? 'none' : '0 5px 0 #B8860B',
                            }}
                        >
                            {loading ? t('multiplayer.creating') : t('multiplayer.create_btn')}
                        </motion.button>
                    </div>
                )}

                {/* Join tab */}
                {tab === 'join' && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: '#9E9EAF' }}>
                                {t('multiplayer.invite_label')}
                            </label>
                            <input
                                type="text"
                                value={inviteCodeInput}
                                onChange={e => setInviteCodeInput(e.target.value.toUpperCase().slice(0, 6))}
                                placeholder={t('multiplayer.join_placeholder')}
                                maxLength={6}
                                className="w-full px-4 py-3 rounded-xl font-mono text-2xl font-bold text-center tracking-widest transition-all"
                                style={{
                                    background: '#FFFFFF',
                                    border: '2px solid #E0E0E0',
                                    color: '#1A1A2E',
                                    outline: 'none',
                                    letterSpacing: '0.3em',
                                }}
                                onFocus={e => { e.target.style.borderColor = '#FFD700'; }}
                                onBlur={e => { e.target.style.borderColor = '#E0E0E0'; }}
                            />
                        </div>

                        <motion.button
                            whileTap={{ y: 3 }}
                            onClick={handleJoin}
                            disabled={loading || inviteCodeInput.trim().length !== 6}
                            className="w-full py-4 rounded-2xl font-display text-base font-bold cursor-pointer"
                            style={{
                                background: (!loading && inviteCodeInput.trim().length === 6) ? '#FFD700' : '#E0E0E0',
                                color: (!loading && inviteCodeInput.trim().length === 6) ? '#4A3800' : '#9E9EAF',
                                boxShadow: (!loading && inviteCodeInput.trim().length === 6) ? '0 5px 0 #B8860B' : 'none',
                            }}
                        >
                            {loading ? t('multiplayer.joining') : t('multiplayer.join_btn')}
                        </motion.button>
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 px-4 py-3 rounded-xl text-sm font-medium text-center"
                        style={{ background: '#FFEBEE', color: '#C62828' }}
                    >
                        {error}
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
