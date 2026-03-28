import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { getFreedomPercent } from '../../engine/WinCondition';
import AvatarImage from '../ui/AvatarImage';
import { useTranslation } from 'react-i18next';

interface PlayersOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PlayersOverlay({ isOpen, onClose }: PlayersOverlayProps) {
    const { t } = useTranslation();
    const players = useGameStore(s => s.players);
    const currentPlayerIndex = useGameStore(s => s.currentPlayerIndex);
    const currentPlayer = players[currentPlayerIndex];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div
                className="fixed inset-0 z-[90] flex items-end justify-center"
                onClick={onClose}
            >
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0"
                    style={{ background: 'rgba(0,0,0,0.4)' }}
                />

                {/* Sheet */}
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="relative z-10 w-full max-w-lg rounded-t-3xl overflow-hidden"
                    style={{ background: '#FFFFFF' }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Handle */}
                    <div className="flex justify-center py-3">
                        <div className="w-10 h-1 rounded-full" style={{ background: '#E0E0E0' }} />
                    </div>

                    {/* Title */}
                    <div className="px-5 pb-3">
                        <h3 className="font-display text-lg font-bold" style={{ color: '#1A1A2E' }}>
                            {t('game.players', { defaultValue: 'Players' })}
                        </h3>
                    </div>

                    {/* Player list */}
                    <div className="px-5 pb-6 space-y-2">
                        {players.map(player => {
                            const isActive = player.id === currentPlayer?.id;
                            const passiveIncome = player.assets.reduce((s, a) => s + a.income, 0);
                            const freedomPct = getFreedomPercent(player);

                            return (
                                <div
                                    key={player.id}
                                    className="flex items-center gap-3 p-3 rounded-2xl transition-all"
                                    style={{
                                        background: isActive ? '#FFF8E1' : '#FAFAFA',
                                        border: isActive ? '2px solid #FFD700' : '2px solid #F0F0F0',
                                    }}
                                >
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden shrink-0"
                                        style={{
                                            background: isActive ? 'rgba(255,215,0,0.1)' : '#F5F0E8',
                                            border: isActive ? '2px solid #FFD700' : '2px solid #E0E0E0',
                                        }}
                                    >
                                        <AvatarImage avatar={player.avatar} size={28} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-sm font-bold truncate" style={{ color: '#1A1A2E' }}>
                                                {player.name}
                                            </span>
                                            {isActive && (
                                                <span
                                                    className="text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider"
                                                    style={{ background: '#FFD700', color: '#4A3800' }}
                                                >
                                                    {t('game.turn_badge')}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs font-bold" style={{ color: '#DAA520' }}>
                                                ${player.cash}
                                            </span>
                                            {passiveIncome > 0 && (
                                                <span className="text-[10px]" style={{ color: '#4CAF50' }}>
                                                    +${passiveIncome}/mo
                                                </span>
                                            )}
                                            {player.debt > 0 && (
                                                <span className="text-[10px]" style={{ color: '#EF5350' }}>
                                                    -${player.debt}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-right shrink-0">
                                        <div className="text-xs font-bold" style={{ color: '#4CAF50' }}>
                                            {freedomPct}%
                                        </div>
                                        <div className="flex gap-0.5 justify-end mt-0.5">
                                            {[0, 1, 2].map(i => (
                                                <div
                                                    key={i}
                                                    className="w-2 h-2 rounded-full"
                                                    style={{
                                                        background: i < player.assets.length ? '#4CAF50' : '#E0E0E0',
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
