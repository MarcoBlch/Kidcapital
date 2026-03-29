import { motion } from 'framer-motion';
import { MIN_ASSETS_TO_WIN, MIN_SAVINGS_TO_WIN } from '../../utils/constants';
import type { Player } from '../../types';
import { useTranslation } from 'react-i18next';

interface ProgressBarProps {
    percent: number;
    player: Player;
}

export default function ProgressBar({ percent, player }: ProgressBarProps) {
    const { t } = useTranslation();
    const clamped = Math.max(0, Math.min(100, percent));

    const assetCount = player.assets.length;
    const savings = player.savings;
    const quizCorrect = player.quizCorrect;
    const quizTotal = player.quizTotal;
    const debt = player.debt;
    const passiveIncome = player.assets.reduce((sum, a) => sum + a.income, 0);
    const totalExpenses = player.baseExpenses
        + player.assets.reduce((sum, a) => sum + a.maint, 0)
        + player.loanPayment;

    const milestones = [
        { label: '🏪', done: assetCount >= MIN_ASSETS_TO_WIN, tip: t('game.biz', { count: assetCount, target: MIN_ASSETS_TO_WIN }) },
        { label: '🏦', done: savings >= MIN_SAVINGS_TO_WIN, tip: `$${savings}/$${MIN_SAVINGS_TO_WIN}` },
        { label: '🧠', done: quizTotal > 0 && (quizCorrect / quizTotal) >= 0.5, tip: quizTotal > 0 ? `${Math.round(quizCorrect / quizTotal * 100)}%` : '0%' },
        { label: '💰', done: debt === 0, tip: debt > 0 ? t('game.debt_amount', { amount: debt }) : t('game.no_debt') },
        { label: '📈', done: totalExpenses > 0 && passiveIncome >= totalExpenses, tip: `$${passiveIncome}/$${totalExpenses}` },
    ];

    return (
        <div className="w-full">
            {/* Progress bar */}
            <div
                className="h-2 rounded-full overflow-hidden"
                style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
                <motion.div
                    className="h-full rounded-full"
                    style={{
                        background: clamped >= 100
                            ? 'linear-gradient(90deg, #4CAF50, #66BB6A, #81C784)'
                            : 'linear-gradient(90deg, #FFD700, #FFC107, #4CAF50)',
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${clamped}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                />
            </div>

            {/* Win condition milestones */}
            <div className="flex items-center justify-between mt-1 px-0.5">
                {milestones.map((m, i) => (
                    <div key={i} className="flex items-center gap-0.5">
                        <span className={`text-[10px] ${m.done ? '' : 'grayscale opacity-40'}`}>
                            {m.label}
                        </span>
                        <span
                            className="text-[7px] md:text-[8px] font-bold"
                            style={{ color: m.done ? '#66BB6A' : 'rgba(255,255,255,0.35)' }}
                        >
                            {m.tip}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
