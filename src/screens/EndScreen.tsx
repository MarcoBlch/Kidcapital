import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';
import { useAchievementStore } from '../store/achievementStore';
import { useSupabaseStore } from '../store/supabaseStore';
import { getFreedomPercent } from '../engine/WinCondition';
import { getLevelForXP, getXPToNextLevel } from '../data/achievements';

export default function EndScreen() {
    const players = useGameStore(s => s.players);
    const winnerId = useGameStore(s => s.winnerId);
    const month = useGameStore(s => s.month);
    const resetGame = useGameStore(s => s.resetGame);
    const setScreen = useUIStore(s => s.setScreen);

    const winner = players.find(p => p.id === winnerId);
    const humanPlayer = players.find(p => p.isHuman);

    if (!winner || !humanPlayer) return null;

    const netWorth =
        humanPlayer.cash +
        humanPlayer.savings +
        humanPlayer.assets.reduce((s, a) => s + a.cost, 0) -
        humanPlayer.debt;

    const passiveIncome = humanPlayer.assets.reduce((s, a) => s + a.income, 0);
    const impulseTotal = humanPlayer.wantsSpent + humanPlayer.wantsSkipped;
    const impulseScore =
        impulseTotal > 0
            ? Math.round((humanPlayer.wantsSkipped / impulseTotal) * 100)
            : 100;

    const quizAccuracy =
        humanPlayer.quizTotal > 0
            ? Math.round((humanPlayer.quizCorrect / humanPlayer.quizTotal) * 100)
            : 0;

    const isHumanWinner = winner.id === humanPlayer.id;

    // Record game end for achievements (once)
    const recordedRef = useRef(false);
    const xp = useAchievementStore(s => s.xp);
    const level = getLevelForXP(xp);
    const xpProgress = getXPToNextLevel(xp);

    useEffect(() => {
        if (recordedRef.current) return;
        recordedRef.current = true;

        // 1. Give XP locally
        useAchievementStore.getState().recordGameEnd(isHumanWinner, month);

        // 2. Sync to Supabase Leaderboard
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

    const handlePlayAgain = () => {
        useAchievementStore.getState().resetSession();
        resetGame();
        setScreen('setup');
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-dvh px-5 py-8 safe-top"
            style={{
                background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            }}
        >
            <div className="max-w-md mx-auto text-center">
                {/* Winner */}
                <motion.div
                    initial={{ scale: 0.5, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                    <div className="text-6xl mb-3">
                        {isHumanWinner ? '🏆' : '🎮'}
                    </div>
                    <h1 className="font-display text-3xl text-amber-400 mb-1">
                        {isHumanWinner ? 'YOU WIN!' : `${winner.name} Wins!`}
                    </h1>
                    <p className="text-sm text-white/40 mb-6">
                        {isHumanWinner
                            ? 'Financial Freedom achieved! 🦋'
                            : `${winner.avatar} reached freedom first!`}
                    </p>
                </motion.div>

                {/* Stats Report Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/5 rounded-2xl p-5 mb-6 text-left border border-white/10"
                >
                    <h2 className="font-display text-lg text-white mb-4">
                        📊 Your Report Card
                    </h2>

                    <div className="space-y-2.5">
                        <StatRow label="Months Played" value={`${month}`} icon="📅" />
                        <StatRow
                            label="Net Worth"
                            value={`$${netWorth}`}
                            icon="💰"
                            highlight={netWorth > 0 ? 'positive' : 'negative'}
                        />
                        <StatRow
                            label="Passive Income"
                            value={`$${passiveIncome}/mo`}
                            icon="📈"
                            highlight="positive"
                        />
                        <StatRow
                            label="Businesses Owned"
                            value={`${humanPlayer.assets.length}`}
                            icon="🏪"
                        />
                        <StatRow
                            label="Savings"
                            value={`$${humanPlayer.savings}`}
                            icon="🏦"
                        />
                        <StatRow
                            label="Freedom"
                            value={`${getFreedomPercent(humanPlayer)}%`}
                            icon="🦋"
                            highlight="positive"
                        />

                        <div className="border-t border-white/10 pt-2.5 mt-2.5">
                            <StatRow
                                label="Impulse Control"
                                value={`${impulseScore}%`}
                                icon="💪"
                                highlight={impulseScore >= 50 ? 'positive' : 'negative'}
                            />
                            <StatRow
                                label="Quiz Accuracy"
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
                    className="bg-gradient-to-r from-amber-400/10 to-amber-500/10 rounded-2xl p-4 mb-4 border border-amber-400/20"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-amber-400/20 flex items-center justify-center text-2xl">
                            {level.icon}
                        </div>
                        <div className="flex-1">
                            <div className="text-[9px] text-amber-300/50 uppercase tracking-wider font-bold">Level {level.level}</div>
                            <div className="font-display text-base text-amber-300 font-bold">{level.title}</div>
                            <div className="text-[10px] text-white/30">{xp} XP total</div>
                        </div>
                    </div>
                    {/* XP progress bar */}
                    <div className="mt-3 h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${xpProgress.progress}%` }}
                            transition={{ duration: 1, delay: 0.6 }}
                        />
                    </div>
                    <div className="flex justify-between mt-1">
                        <span className="text-[9px] text-white/20">{xpProgress.current} XP</span>
                        <span className="text-[9px] text-white/20">{xpProgress.next} XP</span>
                    </div>
                </motion.div>

                {/* Penny's final lesson */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-amber-400/10 rounded-2xl p-4 mb-6 border border-amber-400/20"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">🐷</span>
                        <span className="font-display text-sm font-bold text-amber-300">
                            Penny says:
                        </span>
                    </div>
                    <p className="text-sm text-white/60 leading-relaxed">
                        {isHumanWinner
                            ? "Amazing job! You learned that passive income = freedom. Your money works for YOU now! Keep these skills in real life! 🌟"
                            : "Great effort! Every game teaches you something new about money. Try again and see if you can be the first to reach Financial Freedom! 💪"}
                    </p>
                </motion.div>

                {/* Actions */}
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePlayAgain}
                    className="
            w-full py-3.5 rounded-2xl font-display text-base font-bold
            bg-gradient-to-r from-amber-400 to-amber-500 text-amber-900
            shadow-glow-gold cursor-pointer transition-all
          "
                >
                    🎲 Play Again
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
            <span className="text-xs text-white/40 flex items-center gap-1.5">
                <span>{icon}</span> {label}
            </span>
            <span
                className={`text-sm font-bold ${highlight === 'positive'
                    ? 'text-emerald-400'
                    : highlight === 'negative'
                        ? 'text-rose-400'
                        : 'text-white'
                    }`}
            >
                {value}
            </span>
        </div>
    );
}
