import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { useTranslation } from 'react-i18next';

// We import Button variants but ActionBar currently uses custom styled motion.buttons.
// Let's stick with the existing styling conventions for alignment.

interface ActionBarProps {
    onRoll: () => void;
    onNext: () => void;
}

export default function ActionBar({ onRoll, onNext }: ActionBarProps) {
    const { t } = useTranslation();
    const turnPhase = useGameStore(s => s.turnPhase);
    const diceResult = useGameStore(s => s.diceResult);
    const currentPlayer = useGameStore(s => s.players[s.currentPlayerIndex]);
    const showModal = useUIStore(s => s.showModal);

    const canRoll = turnPhase === 'idle' && currentPlayer?.isHuman;
    const showNext = turnPhase === 'turn_end' && currentPlayer?.isHuman;

    return (
        <div className="glass-dark border-t border-white/10 px-4 md:px-8 lg:px-10 py-3 md:py-4 lg:py-5 safe-bottom flex-shrink-0">
            <div className="flex items-center justify-between gap-3 md:max-w-3xl lg:max-w-5xl md:mx-auto">
                {/* Left: player badge */}
                <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-white/10 flex items-center justify-center text-lg lg:text-xl">
                        {currentPlayer?.avatar}
                    </div>
                    <div>
                        <div className="text-xs lg:text-sm font-bold text-white truncate">
                            {currentPlayer?.name}
                        </div>
                        <div className="text-[10px] lg:text-xs text-amber-300 font-medium">
                            💵 ${currentPlayer?.cash}
                        </div>
                    </div>
                </div>

                {/* Center: dice result */}
                {diceResult && turnPhase !== 'idle' && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center"
                    >
                        <span className="font-display text-xl text-amber-300 font-extrabold">
                            {diceResult}
                        </span>
                    </motion.div>
                )}

                {/* Right: action buttons */}
                <div className="flex flex-shrink-0 items-center gap-2">
                    {/* Always allow viewing portfolio on your turn, unless it's over */}
                    {currentPlayer?.isHuman && (
                        <motion.button
                            whileTap={{ scale: 0.92 }}
                            onClick={() => showModal('portfolio' as any)}
                            className="
                                px-4 lg:px-5 py-2.5 lg:py-3 rounded-2xl font-display text-sm lg:text-base font-bold
                                bg-white/10 border border-white/20 text-white
                                hover:bg-white/15 cursor-pointer transition-all
                            "
                        >
                            💼
                        </motion.button>
                    )}

                    {canRoll && (
                        <motion.button
                            whileTap={{ scale: 0.92 }}
                            whileHover={{ scale: 1.05 }}
                            onClick={onRoll}
                            className="
                                px-6 lg:px-8 py-2.5 lg:py-3 rounded-2xl font-display text-sm lg:text-base font-bold
                                bg-gradient-to-r from-amber-400 to-amber-500
                                text-amber-900 shadow-glow-gold
                                active:from-amber-500 active:to-amber-600
                                cursor-pointer transition-all
                            "
                        >
                            {t('game.roll')}
                        </motion.button>
                    )}
                    {showNext && (
                        <motion.button
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            whileTap={{ scale: 0.92 }}
                            onClick={onNext}
                            className="
                                px-5 lg:px-6 py-2.5 lg:py-3 rounded-2xl font-display text-sm lg:text-base font-bold
                                bg-white/10 border border-white/20 text-white
                                hover:bg-white/15 cursor-pointer transition-all
                            "
                        >
                            {t('game.next')}
                        </motion.button>
                    )}
                    {turnPhase === 'bot_acting' && (
                        <div className="flex items-center gap-1.5 px-4 py-2.5">
                            <div className="flex gap-1">
                                {[0, 1, 2].map(i => (
                                    <motion.div
                                        key={i}
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                        className="w-1.5 h-1.5 rounded-full bg-amber-400"
                                    />
                                ))}
                            </div>
                            <span className="text-[11px] text-white/50 font-medium">
                                {t('game.bot_thinking')}
                            </span>
                        </div>
                    )}
                    {(turnPhase === 'rolling' || turnPhase === 'moving') && (
                        <div className="px-4 py-2.5">
                            <span className="text-[11px] text-amber-300/60 font-medium animate-pulse">
                                {t('game.moving')}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
