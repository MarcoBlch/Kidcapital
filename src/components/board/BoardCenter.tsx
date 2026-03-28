import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { getFreedomPercent } from '../../engine/WinCondition';
import AvatarImage from '../ui/AvatarImage';
import ProgressBar from '../hud/ProgressBar';
import { useTranslation } from 'react-i18next';
import BotActionFeed from './BotActionFeed';

interface BoardCenterProps {
    onRoll: () => void;
    onNext: () => void;
}

export default function BoardCenter({ onRoll, onNext }: BoardCenterProps) {
    const { t } = useTranslation();
    const turnPhase = useGameStore(s => s.turnPhase);
    const diceResult = useGameStore(s => s.diceResult);
    const currentPlayer = useGameStore(s => s.players[s.currentPlayerIndex]);
    const showModal = useUIStore(s => s.showModal);

    if (!currentPlayer) return null;

    const canRoll = turnPhase === 'idle' && currentPlayer.isHuman;
    const showNext = turnPhase === 'turn_end' && currentPlayer.isHuman;
    const isBotActing = turnPhase === 'bot_acting';
    const isMoving = turnPhase === 'rolling' || turnPhase === 'moving';
    const freedomPct = getFreedomPercent(currentPlayer);

    return (
        <div
            className="flex flex-col items-center justify-center h-full w-full rounded-2xl p-2 md:p-4"
            style={{
                gridColumn: '2 / 6',
                gridRow: '2 / 6',
                background: 'rgba(0,0,0,0.12)',
                border: '2px dashed rgba(255,215,0,0.2)',
            }}
        >
            {/* Player avatar */}
            <div className="relative mb-2">
                <div
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center overflow-hidden"
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: '3px solid rgba(255,255,255,0.2)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    }}
                >
                    <AvatarImage avatar={currentPlayer.avatar} size={48} />
                </div>
                {/* Turn badge */}
                <div
                    className="absolute -top-1 -right-6 md:-right-8 px-2 py-0.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest whitespace-nowrap"
                    style={{ background: '#FFD700', color: '#4A3800', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                >
                    {t('game.turn_badge_short', { defaultValue: currentPlayer.name })}
                </div>
            </div>

            {/* Cash display */}
            <div className="text-center mb-2">
                <span className="font-display text-lg md:text-xl font-black" style={{ color: '#FFD700' }}>
                    ${currentPlayer.cash}
                </span>
            </div>

            {/* Dice result (during/after roll) */}
            {diceResult && (isMoving || isBotActing || turnPhase === 'penny_speak' || turnPhase === 'modal_open' || turnPhase === 'action_done' || turnPhase === 'turn_end') && (
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-2"
                    style={{
                        background: 'rgba(255,215,0,0.15)',
                        border: '2px solid rgba(255,215,0,0.3)',
                    }}
                >
                    <span className="font-display text-xl md:text-2xl font-extrabold" style={{ color: '#FFD700' }}>
                        {diceResult}
                    </span>
                </motion.div>
            )}

            {/* Roll button */}
            {canRoll && (
                <motion.button
                    whileTap={{ y: 4 }}
                    onClick={onRoll}
                    data-tutorial="roll-btn"
                    className="px-8 md:px-10 py-3 md:py-4 rounded-2xl font-display text-sm md:text-base font-bold cursor-pointer transition-all"
                    style={{
                        background: '#FFD700',
                        color: '#4A3800',
                        boxShadow: '0 5px 0 #B8860B, 0 8px 16px rgba(0,0,0,0.2)',
                    }}
                >
                    🎲 {t('game.roll')}
                </motion.button>
            )}

            {/* Next turn button */}
            {showNext && (
                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileTap={{ y: 3 }}
                    onClick={onNext}
                    className="px-6 md:px-8 py-2.5 md:py-3 rounded-2xl font-display text-sm md:text-base font-bold cursor-pointer transition-all"
                    style={{
                        background: 'rgba(255,255,255,0.15)',
                        border: '2px solid rgba(255,255,255,0.2)',
                        color: 'white',
                        boxShadow: '0 3px 0 rgba(0,0,0,0.2)',
                    }}
                >
                    {t('game.next')}
                </motion.button>
            )}

            {/* Bot action feed */}
            {isBotActing && <BotActionFeed />}

            {/* Moving indicator */}
            {isMoving && (
                <span className="text-[10px] font-medium animate-pulse" style={{ color: 'rgba(255,215,0,0.6)' }}>
                    {t('game.moving')}
                </span>
            )}

            {/* Portfolio quick access */}
            {currentPlayer.isHuman && !canRoll && !showNext && !isBotActing && !isMoving && (
                <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={() => showModal('portfolio' as any)}
                    className="mt-1 px-4 py-2 rounded-xl font-display text-xs font-bold cursor-pointer transition-all"
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: '1.5px solid rgba(255,255,255,0.15)',
                        color: 'rgba(255,255,255,0.6)',
                    }}
                >
                    💼 {t('game.portfolio', { defaultValue: 'Portfolio' })}
                </motion.button>
            )}

            {/* Freedom progress bar with milestones */}
            <div className="w-full max-w-[200px] md:max-w-[240px] mt-2">
                <ProgressBar percent={freedomPct} player={currentPlayer} />
            </div>
        </div>
    );
}
