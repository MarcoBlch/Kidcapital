import { getFreedomPercent } from '../../engine/WinCondition';
import type { Player } from '../../types';
import ProgressBar from './ProgressBar';

interface PlayerRowProps {
    player: Player;
    isActive: boolean;
}

export default function PlayerRow({ player, isActive }: PlayerRowProps) {
    const freedomPct = getFreedomPercent(player);
    const passiveIncome = player.assets.reduce((s, a) => s + a.income, 0);

    // SVG progress ring
    const radius = 14;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (freedomPct / 100) * circumference;

    return (
        <div
            className={`
                flex flex-col gap-1.5 px-3 py-2 rounded-2xl transition-all duration-300
                ${isActive
                    ? 'bg-white/15 border border-amber-400/40 pulse-ring'
                    : 'bg-white/5 border border-white/5'
                }
            `}
        >
            <div className="flex items-center gap-2.5">
                {/* Avatar with progress ring */}
                <div className="relative flex-shrink-0">
                    <svg width="36" height="36" className="-rotate-90">
                        <circle
                            cx="18" cy="18" r={radius}
                            fill="rgba(255,255,255,0.06)"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="2.5"
                        />
                        <circle
                            cx="18" cy="18" r={radius}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            className="transition-all duration-700"
                        />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-base">
                        {player.avatar}
                    </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white truncate">
                            {player.name}
                        </span>
                        {isActive && (
                            <span className="text-[7px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded-full font-bold leading-none uppercase tracking-wider">
                                Turn
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-bold text-amber-300">
                            ${player.cash}
                        </span>
                        {passiveIncome > 0 && (
                            <span className="text-[10px] text-emerald-400">
                                +${passiveIncome}/mo
                            </span>
                        )}
                        {player.debt > 0 && (
                            <span className="text-[10px] text-rose-400">
                                -${player.debt}
                            </span>
                        )}
                    </div>
                </div>

                {/* Business dots */}
                <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                        <div
                            key={i}
                            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i < player.assets.length
                                ? 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.5)]'
                                : 'bg-white/10'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Compact Progress Bar for this player */}
            <ProgressBar percent={freedomPct} player={player} />
        </div>
    );
}
