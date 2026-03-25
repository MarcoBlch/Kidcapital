import { useGameStore } from '../../store/gameStore';
import { getFreedomPercent } from '../../engine/WinCondition';
import { useTranslation } from 'react-i18next';

export default function Header() {
    const { t } = useTranslation();
    const month = useGameStore(s => s.month);
    const players = useGameStore(s => s.players);
    const currentPlayerIndex = useGameStore(s => s.currentPlayerIndex);
    const currentPlayer = players[currentPlayerIndex];

    if (!currentPlayer) return null;

    const hasDebt = currentPlayer.debt > 0;
    const freedomPct = getFreedomPercent(currentPlayer);

    return (
        <div className="flex items-center justify-between px-3 md:px-6 lg:px-8 py-2 md:py-3 lg:py-4 safe-top">
            {/* Month badge */}
            <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
                <span className="text-[10px] text-amber-200/70">{t('game.month')}</span>
                <span className="font-display text-sm md:text-base lg:text-lg text-amber-300 font-bold">
                    {month}
                </span>
            </div>

            {/* Active player */}
            <div className="flex items-center gap-2">
                <div className="w-7 h-7 lg:w-9 lg:h-9 rounded-full bg-white/10 flex items-center justify-center text-base lg:text-lg">
                    {currentPlayer.avatar}
                </div>
                <span className="font-display text-sm md:text-base lg:text-lg text-white font-semibold">
                    {t('game.turn', { name: currentPlayer.name })}
                </span>
                {hasDebt && (
                    <span className="text-[8px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                        {t('game.debt')}
                    </span>
                )}
            </div>

            {/* Freedom % */}
            <div className="bg-emerald-500/15 rounded-full px-3 py-1">
                <span className="font-display text-sm md:text-base lg:text-lg text-emerald-400 font-bold">
                    {freedomPct}%
                </span>
            </div>
        </div>
    );
}
