import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/uiStore';
import { supabase } from '../../lib/supabase';
import { useSupabaseStore } from '../../store/supabaseStore';
import { useTranslation } from 'react-i18next';
import AvatarImage from '../ui/AvatarImage';

interface Profile {
    id: string;
    username: string;
    avatar: string;
    level: number;
    net_worth: number;
}

export default function LeaderboardModal() {
    const { t } = useTranslation();
    const activeModal = useUIStore(s => s.activeModal);
    const closeModal = useUIStore(s => s.closeModal);
    const session = useSupabaseStore(s => s.session);

    const [leaders, setLeaders] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const isOpen = activeModal === 'leaderboard';

    useEffect(() => {
        if (isOpen) {
            fetchLeaderboard();
        }
    }, [isOpen]);

    const fetchLeaderboard = async () => {
        setLoading(true);
        setError('');
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, username, avatar, level, net_worth')
                .order('net_worth', { ascending: false })
                .limit(50);

            if (error) throw error;
            setLeaders(data || []);
        } catch (err: any) {
            console.error('Leaderboard error:', err);
            setError(t('modals.leaderboard.error'));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const myId = session?.user?.id;

    return (
        <AnimatePresence>
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ background: 'rgba(0,0,0,0.5)' }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="w-full max-w-sm md:max-w-lg lg:max-w-xl rounded-3xl overflow-hidden flex flex-col max-h-[85vh]"
                    style={{
                        background: '#FFFFFF',
                        border: '2px solid #E0E0E0',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    }}
                >
                    {/* Header */}
                    <div
                        className="px-5 py-4 flex justify-between items-center shrink-0"
                        style={{ background: '#FFF8E1', borderBottom: '2px solid #FFD700' }}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🏆</span>
                            <h2 className="text-xl lg:text-2xl font-bold" style={{ color: '#DAA520' }}>
                                {t('modals.leaderboard.title')}
                            </h2>
                        </div>
                        <button
                            onClick={closeModal}
                            className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-colors"
                            style={{ background: '#F5F0E8', color: '#9E9EAF' }}
                        >
                            ✕
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                        {loading ? (
                            <div className="py-8 text-center text-sm" style={{ color: '#9E9EAF' }}>
                                {t('modals.leaderboard.loading')}
                            </div>
                        ) : error ? (
                            <div className="py-8 text-center text-sm" style={{ color: '#EF5350' }}>
                                {error}
                            </div>
                        ) : leaders.length === 0 ? (
                            <div className="py-8 text-center text-sm" style={{ color: '#9E9EAF' }}>
                                {t('modals.leaderboard.empty')}
                            </div>
                        ) : (
                            leaders.map((p, index) => {
                                const isMe = p.id === myId;
                                return (
                                    <div
                                        key={p.id}
                                        className="flex items-center gap-3 p-3 lg:p-4 rounded-2xl transition-all"
                                        style={{
                                            background: isMe ? '#FFF8E1' : '#FAFAFA',
                                            border: isMe ? '2px solid #FFD700' : '2px solid #F0F0F0',
                                            boxShadow: isMe ? '0 3px 0 #B8860B' : 'none',
                                        }}
                                    >
                                        <div
                                            className="w-6 text-center font-bold text-sm"
                                            style={{
                                                color: index === 0 ? '#FFD700'
                                                    : index === 1 ? '#9E9EAF'
                                                    : index === 2 ? '#CD7F32'
                                                    : '#9E9EAF',
                                            }}
                                        >
                                            #{index + 1}
                                        </div>
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 overflow-hidden"
                                            style={{ background: '#F5F0E8', border: '2px solid #E0E0E0' }}
                                        >
                                            <AvatarImage avatar={p.avatar} size={28} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold truncate text-sm flex items-center gap-1.5" style={{ color: '#1A1A2E' }}>
                                                {p.username}
                                                {isMe && (
                                                    <span
                                                        className="text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                                                        style={{ background: '#FFD700', color: '#4A3800' }}
                                                    >
                                                        {t('modals.leaderboard.you')}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[10px]" style={{ color: '#9E9EAF' }}>
                                                {t('modals.leaderboard.level', { level: p.level })}
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="font-black" style={{ color: '#4CAF50' }}>
                                                ${p.net_worth.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
