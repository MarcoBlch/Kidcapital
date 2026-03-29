import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';
import { useAchievementStore } from '../store/achievementStore';
import { useSupabaseStore } from '../store/supabaseStore';
import { getFreedomPercent } from '../engine/WinCondition';
import { getLevelForXP, getXPToNextLevel } from '../data/achievements';
import { useTranslation } from 'react-i18next';
import PennyAvatar from '../components/ui/PennyAvatar';

export default function EndScreen() {
    const { t } = useTranslation();
    const players = useGameStore(s => s.players);
    const winnerId = useGameStore(s => s.winnerId);
    const month = useGameStore(s => s.month);
    const resetGame = useGameStore(s => s.resetGame);
    const setScreen = useUIStore(s => s.setScreen);

    // All hooks MUST be called before any conditional return (React rules)
    const recordedRef = useRef(false);
    const xp = useAchievementStore(s => s.xp);

    const winner = players.find(p => p.id === winnerId);
    const humanPlayer = players.find(p => p.isHuman);

    const netWorth = humanPlayer
        ? humanPlayer.cash +
          humanPlayer.savings +
          humanPlayer.assets.reduce((s, a) => s + a.cost, 0) -
          humanPlayer.debt
        : 0;

    const passiveIncome = humanPlayer
        ? humanPlayer.assets.reduce((s, a) => s + a.income, 0)
        : 0;

    const impulseTotal = humanPlayer
        ? humanPlayer.wantsSpent + humanPlayer.wantsSkipped
        : 0;
    const impulseScore =
        impulseTotal > 0 && humanPlayer
            ? Math.round((humanPlayer.wantsSkipped / impulseTotal) * 100)
            : 100;

    const quizAccuracy =
        humanPlayer && humanPlayer.quizTotal > 0
            ? Math.round((humanPlayer.quizCorrect / humanPlayer.quizTotal) * 100)
            : 0;

    const isHumanWinner = winner && humanPlayer ? winner.id === humanPlayer.id : false;

    const level = getLevelForXP(xp);
    const xpProgress = getXPToNextLevel(xp);

    // Record game end for achievements (once)
    useEffect(() => {
        if (recordedRef.current || !humanPlayer) return;
        recordedRef.current = true;

        useAchievementStore.getState().recordGameEnd(isHumanWinner, month);

        const finalXp = useAchievementStore.getState().xp;
        const currentLevel = getLevelForXP(finalXp);

        useSupabaseStore.getState().updateProfile({
            username: humanPlayer.name,
            avatar: humanPlayer.avatar,
            level: currentLevel.level,
            xp: finalXp,
            net_worth: netWorth
        });
    }, []);

    if (!winner || !humanPlayer) return null;

    const handlePlayAgain = () => {
        useAchievementStore.getState().resetSession();
        resetGame();
        setScreen('setup');
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-dvh w-full flex flex-col items-center px-5 md:px-12 lg:px-16 py-8 md:py-12 lg:py-14 safe-top"
            style={{
                background: 'linear-gradient(180deg, #FFE082 0%, #FFD54F 30%, #FFC107 100%)',
            }}
        >
            <div className="max-w-md md:max-w-2xl lg:max-w-3xl mx-auto text-center">
                {/* Winner */}
                <motion.div
                    initial={{ scale: 0.5, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                    <div className="flex justify-center mb-3 md:mb-5">
                        {isHumanWinner
                            ? <PennyAvatar pose="celebrate" size={120} />
                            : <span className="text-6xl md:text-8xl">🎮</span>
                        }
                    </div>
                    <h1 className="font-display text-3xl md:text-4xl lg:text-5xl mb-1" style={{ color: '#4A3800' }}>
                        {isHumanWinner ? t('end.you_win') : t('end.name_wins', { name: winner.name })}
                    </h1>
                    <p className="text-sm md:text-base mb-6 md:mb-8" style={{ color: '#78350f' }}>
                        {isHumanWinner
                            ? t('end.freedom_achieved')
                            : t('end.reached_first', { avatar: winner.avatar })}
                    </p>
                </motion.div>

                {/* Stats Report Card — white card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-2xl p-5 lg:p-6 mb-6 text-left"
                    style={{
                        background: '#FFFFFF',
                        border: '2px solid #E0E0E0',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                >
                    <h2 className="font-display text-lg mb-4" style={{ color: '#1A1A2E' }}>
                        {t('end.report_card')}
                    </h2>

                    <div className="space-y-2.5">
                        <StatRow label={t('end.months')} value={`${month}`} icon="📅" />
                        <StatRow
                            label={t('end.net_worth')}
                            value={`$${netWorth}`}
                            icon="💰"
                            highlight={netWorth > 0 ? 'positive' : 'negative'}
                        />
                        <StatRow
                            label={t('end.passive_income')}
                            value={`$${passiveIncome}/mo`}
                            icon="📈"
                            highlight="positive"
                        />
                        <StatRow
                            label={t('end.businesses')}
                            value={`${humanPlayer.assets.length}`}
                            icon="🏪"
                        />
                        <StatRow
                            label={t('end.savings')}
                            value={`$${humanPlayer.savings}`}
                            icon="🏦"
                        />
                        <StatRow
                            label={t('end.freedom')}
                            value={`${getFreedomPercent(humanPlayer)}%`}
                            icon="🦋"
                            highlight="positive"
                        />

                        <div className="pt-2.5 mt-2.5" style={{ borderTop: '1px solid #E0E0E0' }}>
                            <StatRow
                                label={t('end.impulse')}
                                value={`${impulseScore}%`}
                                icon="💪"
                                highlight={impulseScore >= 50 ? 'positive' : 'negative'}
                            />
                            <StatRow
                                label={t('end.quiz')}
                                value={`${quizAccuracy}% (${humanPlayer.quizCorrect}/${humanPlayer.quizTotal})`}
                                icon="🧠"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* XP Level Card */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-2xl p-4 mb-4"
                    style={{
                        background: '#FFFFFF',
                        border: '2px solid #FFD700',
                        boxShadow: '0 4px 0 #B8860B',
                    }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                            style={{ background: '#FFF8E1', border: '2px solid #FFD700' }}
                        >
                            {level.icon}
                        </div>
                        <div className="flex-1">
                            <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: '#DAA520' }}>
                                {t('end.level', { level: level.level })}
                            </div>
                            <div className="font-display text-base font-bold" style={{ color: '#4A3800' }}>{level.title}</div>
                            <div className="text-[10px]" style={{ color: '#9E9EAF' }}>{t('end.xp_total', { xp })}</div>
                        </div>
                    </div>
                    {/* XP progress bar */}
                    <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: '#F5F0E8' }}>
                        <motion.div
                            className="h-full rounded-full"
                            style={{ background: 'linear-gradient(90deg, #FFD700, #FFC107)' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${xpProgress.progress}%` }}
                            transition={{ duration: 1, delay: 0.6 }}
                        />
                    </div>
                    <div className="flex justify-between mt-1">
                        <span className="text-[9px]" style={{ color: '#9E9EAF' }}>{xpProgress.current} XP</span>
                        <span className="text-[9px]" style={{ color: '#9E9EAF' }}>{xpProgress.next} XP</span>
                    </div>
                </motion.div>

                {/* Penny's final lesson */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="rounded-2xl p-4 mb-6"
                    style={{
                        background: '#FFFFFF',
                        border: '2px solid #FF8FAB',
                        boxShadow: '0 4px 0 rgba(255,143,171,0.3)',
                    }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <PennyAvatar pose={isHumanWinner ? 'proud' : 'wave'} size={32} />
                        <span className="font-display text-sm font-bold" style={{ color: '#FF6B8A' }}>
                            {t('end.penny_says')}
                        </span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: '#5D5D6E' }}>
                        {isHumanWinner ? t('end.penny_win') : t('end.penny_lose')}
                    </p>
                </motion.div>

                {/* Play Again — BIG 3D gold button */}
                <motion.button
                    whileTap={{ y: 4 }}
                    onClick={handlePlayAgain}
                    className="w-full py-3.5 lg:py-5 rounded-2xl font-display text-base lg:text-xl font-bold cursor-pointer transition-all"
                    style={{
                        background: '#FFD700',
                        color: '#4A3800',
                        boxShadow: '0 5px 0 #B8860B, 0 8px 16px rgba(0,0,0,0.2)',
                    }}
                >
                    {t('end.play_again')}
                </motion.button>
            </div>
        </motion.div>
    );
}

function StatRow({
    label,
    value,
    icon,
    highlight,
}: {
    label: string;
    value: string;
    icon: string;
    highlight?: 'positive' | 'negative';
}) {
    return (
        <div className="flex items-center justify-between py-1">
            <span className="text-xs flex items-center gap-1.5" style={{ color: '#9E9EAF' }}>
                <span>{icon}</span> {label}
            </span>
            <span
                className="text-sm font-bold"
                style={{
                    color: highlight === 'positive'
                        ? '#4CAF50'
                        : highlight === 'negative'
                            ? '#EF5350'
                            : '#1A1A2E',
                }}
            >
                {value}
            </span>
        </div>
    );
}
