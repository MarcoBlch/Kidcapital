import { getFreedomPercent } from '../../engine/WinCondition';
import type { Player } from '../../types';
import ProgressBar from './ProgressBar';
import AvatarImage from '../ui/AvatarImage';
import { useTranslation } from 'react-i18next';

interface PlayerRowProps {
    player: Player;
    isActive: boolean;
}

export default function PlayerRow({ player, isActive }: PlayerRowProps) {
    const { t } = useTranslation();
    const freedomPct = getFreedomPercent(player);
    const passiveIncome = player.assets.reduce((s, a) => s + a.income, 0);

    // SVG progress ring
    const radius = 14;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (freedomPct / 100) * circumference;

    return (
        <div
            className="flex flex-col gap-1.5 px-3 md:px-5 lg:px-6 py-2 md:py-3 lg:py-4 rounded-2xl transition-all duration-300"
            style={{
                background: isActive ? 'rgba(255,215,0,0.12)' : 'rgba(0,0,0,0.15)',
                border: isActive ? '3px solid #FFD700' : '2px solid rgba(255,255,255,0.08)',
            }}
        >
            <div className="flex items-center gap-2.5">
                {/* Avatar with progress ring */}
                <div className="relative flex-shrink-0">
                    <svg width="36" height="36" className="-rotate-90">
                        <circle
                            cx="18" cy="18" r={radius}
                            fill="rgba(0,0,0,0.15)"
                            stroke="rgba(255,255,255,0.15)"
                            strokeWidth="2.5"
                        />
                        <circle
                            cx="18" cy="18" r={radius}
                            fill="none"
                            stroke="#4CAF50"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            className="transition-all duration-700"
                        />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center">
                        <AvatarImage avatar={player.avatar} size={20} />
                    </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs md:text-sm lg:text-base font-bold text-white truncate">
                            {player.name}
                        </span>
                        {isActive && (
                            <span
                                className="text-[7px] px-1.5 py-0.5 rounded-full font-bold leading-none uppercase tracking-wider"
                                style={{ background: 'rgba(255,215,0,0.25)', color: '#FFD700' }}
                            >
                                {t('game.turn_badge')}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] md:text-sm lg:text-base font-bold" style={{ color: '#FFD700' }}>
                            ${player.cash}
                        </span>
                        {passiveIncome > 0 && (
                            <span className="text-[10px]" style={{ color: '#66BB6A' }}>
                                +${passiveIncome}/mo
                            </span>
                        )}
                        {player.debt > 0 && (
                            <span className="text-[10px]" style={{ color: '#EF5350' }}>
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
                            className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full transition-all duration-300"
                            style={{
                                background: i < player.assets.length ? '#4CAF50' : 'rgba(255,255,255,0.1)',
                                boxShadow: i < player.assets.length ? '0 2px 0 #2E7D32' : 'none',
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Compact Progress Bar for this player */}
            <ProgressBar percent={freedomPct} player={player} />
        </div>
    );
}
