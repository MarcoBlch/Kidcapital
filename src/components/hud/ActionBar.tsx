import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { useTranslation } from 'react-i18next';

interface ActionBarProps {
    onOpenPlayers: () => void;
}

export default function ActionBar({ onOpenPlayers }: ActionBarProps) {
    const { t } = useTranslation();
    const currentPlayer = useGameStore(s => s.players[s.currentPlayerIndex]);
    const showModal = useUIStore(s => s.showModal);

    return (
        <nav
            className="px-4 md:px-8 py-2 md:py-3 safe-bottom shrink-0"
            style={{
                background: 'rgba(0,0,0,0.35)',
                borderTop: '1px solid rgba(255,255,255,0.08)',
            }}
        >
            <div className="flex justify-around items-center">
                {/* Portfolio */}
                {currentPlayer?.isHuman && (
                    <button
                        onClick={() => showModal('portfolio' as any)}
                        className="flex flex-col items-center gap-0.5 px-4 py-1 min-h-11 min-w-11 justify-center cursor-pointer transition-colors"
                    >
                        <span className="text-lg">💼</span>
                        <span className="font-display font-bold text-[9px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>
                            {t('game.portfolio', { defaultValue: 'Portfolio' })}
                        </span>
                    </button>
                )}

                {/* Players */}
                <button
                    onClick={onOpenPlayers}
                    className="flex flex-col items-center gap-0.5 px-4 py-1 min-h-11 min-w-11 justify-center cursor-pointer transition-colors"
                >
                    <span className="text-lg">👥</span>
                    <span className="font-display font-bold text-[9px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        {t('game.players', { defaultValue: 'Players' })}
                    </span>
                </button>

                {/* Leaderboard */}
                <button
                    onClick={() => showModal('leaderboard' as any)}
                    className="flex flex-col items-center gap-0.5 px-4 py-1 min-h-11 min-w-11 justify-center cursor-pointer transition-colors"
                >
                    <span className="text-lg">🏆</span>
                    <span className="font-display font-bold text-[9px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        {t('game.leaderboard', { defaultValue: 'Ranking' })}
                    </span>
                </button>
            </div>
        </nav>
    );
}
