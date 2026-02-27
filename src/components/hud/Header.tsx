import { useGameStore } from '../../store/gameStore';
import { getFreedomPercent } from '../../engine/WinCondition';

export default function Header() {
    const month = useGameStore(s => s.month);
    const players = useGameStore(s => s.players);
    const currentPlayerIndex = useGameStore(s => s.currentPlayerIndex);
    const currentPlayer = players[currentPlayerIndex];

    if (!currentPlayer) return null;

    const hasDebt = currentPlayer.debt > 0;
    const freedomPct = getFreedomPercent(currentPlayer);

    return (
        <div className="flex items-center justify-between px-3 py-2 safe-top">
            {/* Month badge */}
            <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
                <span className="text-[10px] text-amber-200/70">Month</span>
                <span className="font-display text-sm text-amber-300 font-bold">
                    {month}
                </span>
            </div>

            {/* Active player */}
            <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-base">
                    {currentPlayer.avatar}
                </div>
                <span className="font-display text-sm text-white font-semibold">
                    {currentPlayer.name}'s Turn
                </span>
                {hasDebt && (
                    <span className="text-[8px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                        DEBT
                    </span>
                )}
            </div>

            {/* Freedom % */}
            <div className="bg-emerald-500/15 rounded-full px-3 py-1">
                <span className="font-display text-sm text-emerald-400 font-bold">
                    {freedomPct}%
                </span>
            </div>
        </div>
    );
}
