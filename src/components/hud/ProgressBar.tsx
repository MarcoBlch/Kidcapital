import { motion } from 'framer-motion';
import { MIN_ASSETS_TO_WIN, MIN_SAVINGS_TO_WIN } from '../../utils/constants';
import { useGameStore } from '../../store/gameStore';

interface ProgressBarProps {
    percent: number;
}

export default function ProgressBar({ percent }: ProgressBarProps) {
    const clamped = Math.max(0, Math.min(100, percent));
    const players = useGameStore(s => s.players);
    const humanPlayer = players.find(p => p.isHuman);

    const assetCount = humanPlayer?.assets.length ?? 0;
    const savings = humanPlayer?.savings ?? 0;
    const quizCorrect = humanPlayer?.quizCorrect ?? 0;
    const quizTotal = humanPlayer?.quizTotal ?? 0;
    const debt = humanPlayer?.debt ?? 0;

    const milestones = [
        { label: '🏪', done: assetCount >= MIN_ASSETS_TO_WIN, tip: `${assetCount}/${MIN_ASSETS_TO_WIN} biz` },
        { label: '🏦', done: savings >= MIN_SAVINGS_TO_WIN, tip: `$${savings}/$${MIN_SAVINGS_TO_WIN}` },
        { label: '🧠', done: quizTotal > 0 && (quizCorrect / quizTotal) >= 0.5, tip: quizTotal > 0 ? `${Math.round(quizCorrect / quizTotal * 100)}%` : '0%' },
        { label: '💰', done: debt === 0, tip: debt > 0 ? `$${debt} debt` : 'No debt' },
    ];

    return (
        <div className="w-full px-4">
            {/* Progress bar */}
            <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <motion.div
                    className="h-full rounded-full"
                    style={{
                        background: clamped >= 100
                            ? 'linear-gradient(90deg, #10b981, #34d399, #6ee7b7)'
                            : 'linear-gradient(90deg, #f59e0b, #fbbf24, #10b981)',
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${clamped}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                />
            </div>

            {/* Win condition milestones */}
            <div className="flex items-center justify-between mt-1.5 px-1">
                {milestones.map((m, i) => (
                    <div key={i} className="flex items-center gap-1">
                        <span className={`text-xs ${m.done ? '' : 'grayscale opacity-40'}`}>
                            {m.label}
                        </span>
                        <span className={`text-[9px] font-medium ${m.done ? 'text-emerald-400' : 'text-white/30'
                            }`}>
                            {m.tip}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
