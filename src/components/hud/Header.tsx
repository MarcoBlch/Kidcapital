import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { getFreedomPercent } from '../../engine/WinCondition';
import AvatarImage from '../ui/AvatarImage';
import { useTranslation } from 'react-i18next';

export default function Header() {
    const { t } = useTranslation();
    const month = useGameStore(s => s.month);
    const players = useGameStore(s => s.players);
    const currentPlayerIndex = useGameStore(s => s.currentPlayerIndex);
    const currentPlayer = players[currentPlayerIndex];

    if (!currentPlayer) return null;

    const freedomPct = getFreedomPercent(currentPlayer);

    const handleBackToMenu = () => {
        if (window.confirm(t('game.quit_confirm', { defaultValue: 'Return to main menu? Progress will be lost.' }))) {
            useGameStore.getState().resetGame();
            useUIStore.getState().setScreen('setup');
        }
    };

    return (
        <div className="flex items-center justify-between px-3 md:px-6 lg:px-8 py-2 md:py-3 safe-top">
            {/* Menu button */}
            <button
                onClick={handleBackToMenu}
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 cursor-pointer"
                style={{ background: 'rgba(0,0,0,0.25)' }}
                aria-label={t('game.menu', { defaultValue: 'Menu' })}
            >
                <span className="text-white text-sm font-bold">←</span>
            </button>

            {/* Center: Month + Player turn */}
            <div className="flex items-center gap-2">
                <div
                    className="flex items-center gap-1 rounded-full px-2.5 py-0.5"
                    style={{ background: 'rgba(0,0,0,0.2)' }}
                >
                    <span className="text-[9px] font-bold uppercase" style={{ color: '#DAA520' }}>{t('game.month')}</span>
                    <span className="font-display text-sm font-bold" style={{ color: '#FFD700' }}>{month}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div
                        className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden"
                        style={{ background: 'rgba(0,0,0,0.2)', border: '1.5px solid rgba(255,255,255,0.15)' }}
                    >
                        <AvatarImage avatar={currentPlayer.avatar} size={16} />
                    </div>
                    <span className="font-display text-xs md:text-sm text-white font-semibold truncate max-w-[120px]">
                        {t('game.turn', { name: currentPlayer.name })}
                    </span>
                </div>
            </div>

            {/* Freedom % */}
            <div
                className="rounded-full px-2.5 py-0.5 shrink-0"
                style={{ background: '#2E7D32' }}
            >
                <span className="font-display text-sm text-white font-bold">
                    {freedomPct}%
                </span>
            </div>
        </div>
    );
}
