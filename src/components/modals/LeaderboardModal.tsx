import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/uiStore';
import { supabase } from '../../lib/supabase';
import { useSupabaseStore } from '../../store/supabaseStore';

interface Profile {
    id: string;
    username: string;
    avatar: string;
    level: number;
    net_worth: number;
}

export default function LeaderboardModal() {
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
            setError('Could not load leaderboard.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const myId = session?.user?.id;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="w-full max-w-sm bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                >
                    {/* Header */}
                    <div className="px-5 py-4 bg-gradient-to-br from-amber-500/20 to-amber-700/20 border-b border-amber-500/20 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🏆</span>
                            <h2 className="text-xl font-bold bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
                                Global Top 50
                            </h2>
                        </div>
                        <button
                            onClick={closeModal}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/60 transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                        {loading ? (
                            <div className="py-8 text-center text-amber-200/50 animate-pulse text-sm">
                                Loading top players...
                            </div>
                        ) : error ? (
                            <div className="py-8 text-center text-rose-400 text-sm">
                                {error}
                            </div>
                        ) : leaders.length === 0 ? (
                            <div className="py-8 text-center text-white/40 text-sm">
                                No players yet! Play a game to be the first!
                            </div>
                        ) : (
                            leaders.map((p, index) => {
                                const isMe = p.id === myId;
                                return (
                                    <div
                                        key={p.id}
                                        className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${isMe
                                                ? 'bg-amber-500/20 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                                                : 'bg-white/5 border-white/5'
                                            }`}
                                    >
                                        <div className={`w-6 text-center font-bold text-sm ${index === 0 ? 'text-amber-400' :
                                                index === 1 ? 'text-slate-300' :
                                                    index === 2 ? 'text-amber-700/80' :
                                                        'text-white/30'
                                            }`}>
                                            #{index + 1}
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl shrink-0">
                                            {p.avatar}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-white truncate text-sm flex items-center gap-1.5">
                                                {p.username}
                                                {isMe && <span className="text-[9px] bg-amber-500 text-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">You</span>}
                                            </div>
                                            <div className="text-[10px] text-amber-200/60">
                                                Level {p.level}
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="font-black text-emerald-400">
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
