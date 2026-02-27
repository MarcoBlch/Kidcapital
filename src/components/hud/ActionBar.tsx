import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';

interface ActionBarProps {
    onRoll: () => void;
    onNext: () => void;
}

export default function ActionBar({ onRoll, onNext }: ActionBarProps) {
    const turnPhase = useGameStore(s => s.turnPhase);
    const diceResult = useGameStore(s => s.diceResult);
    const currentPlayer = useGameStore(s => s.players[s.currentPlayerIndex]);

    const canRoll = turnPhase === 'idle' && currentPlayer?.isHuman;
    const showNext = turnPhase === 'turn_end' && currentPlayer?.isHuman;

    return (
        <div className="glass-dark border-t border-white/10 px-4 py-3 safe-bottom flex-shrink-0">
            <div className="flex items-center justify-between gap-3">
                {/* Left: player badge */}
                <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-lg">
                        {currentPlayer?.avatar}
                    </div>
                    <div>
                        <div className="text-xs font-bold text-white truncate">
                            {currentPlayer?.name}
                        </div>
                        <div className="text-[10px] text-amber-300 font-medium">
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

                {/* Right: action button */}
                <div className="flex-shrink-0">
                    {canRoll && (
                        <motion.button
                            whileTap={{ scale: 0.92 }}
                            whileHover={{ scale: 1.05 }}
                            onClick={onRoll}
                            className="
                                px-6 py-2.5 rounded-2xl font-display text-sm font-bold
                                bg-gradient-to-r from-amber-400 to-amber-500
                                text-amber-900 shadow-glow-gold
                                active:from-amber-500 active:to-amber-600
                                cursor-pointer transition-all
                            "
                        >
                            🎲 Roll!
                        </motion.button>
                    )}
                    {showNext && (
                        <motion.button
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            whileTap={{ scale: 0.92 }}
                            onClick={onNext}
                            className="
                                px-5 py-2.5 rounded-2xl font-display text-sm font-bold
                                bg-white/10 border border-white/20 text-white
                                hover:bg-white/15 cursor-pointer transition-all
                            "
                        >
                            Next →
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
                                Bot thinking...
                            </span>
                        </div>
                    )}
                    {(turnPhase === 'rolling' || turnPhase === 'moving') && (
                        <div className="px-4 py-2.5">
                            <span className="text-[11px] text-amber-300/60 font-medium animate-pulse">
                                Moving...
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
