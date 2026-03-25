import { useMemo, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { useAchievementStore } from '../../store/achievementStore';
import { getRandomTemptation } from '../../data/temptations';
import Button from '../ui/Button';
import { useTranslation } from 'react-i18next';

export default function TemptationModal() {
    const { t } = useTranslation();
    const players = useGameStore(s => s.players);
    const currentPlayerIndex = useGameStore(s => s.currentPlayerIndex);
    const playerBuyTemptation = useGameStore(s => s.playerBuyTemptation);
    const playerSkipTemptation = useGameStore(s => s.playerSkipTemptation);
    const closeModal = useUIStore(s => s.closeModal);
    const showCoin = useUIStore(s => s.showCoin);

    const player = players[currentPlayerIndex];
    const temptation = useMemo(() => getRandomTemptation(), []);
    const canAfford = player.cash >= temptation.cost;
    const [decided, setDecided] = useState(false);
    const [choice, setChoice] = useState<'buy' | 'skip' | null>(null);

    const handleBuy = () => {
        if (!canAfford || decided) return;
        setDecided(true);
        setChoice('buy');
        playerBuyTemptation(player.id, temptation.cost);
        showCoin(-temptation.cost);
        if (player.isHuman) {
            useAchievementStore.getState().resetTemptationStreak();
        }
    };

    const handleSkip = () => {
        if (decided) return;
        setDecided(true);
        setChoice('skip');
        playerSkipTemptation(player.id);
        showCoin(5); // savings reward!
        if (player.isHuman) {
            useAchievementStore.getState().recordTemptationSkip();
        }
    };

    const handleClose = () => closeModal();

    return (
        <div>
            <h2 className="font-display text-lg text-pink-500 mb-1">
                {t('modals.temptation.title')}
            </h2>
            <p className="text-[10px] text-slate-400 mb-3">
                {t('modals.temptation.subtitle')}
            </p>

            {/* Item card */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-4 mb-4 border border-pink-100 text-center">
                <span className="text-4xl block mb-2">{temptation.icon}</span>
                <h3 className="font-display text-base font-bold text-slate-800">
                    {temptation.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 mb-3">
                    {temptation.text}
                </p>
                <div className="font-display text-2xl font-extrabold text-pink-500">
                    ${temptation.cost}
                </div>
            </div>

            {/* Dilemma info */}
            {!decided && (
                <div className="bg-amber-50 rounded-xl p-3 mb-4 border border-amber-100">
                    <p className="text-xs text-amber-700 leading-relaxed">
                        {t('modals.temptation.dilemma')}
                    </p>
                </div>
            )}

            {/* Decision result */}
            {decided && choice === 'buy' && (
                <div className="bg-pink-50 rounded-xl p-3 mb-4 border border-pink-200">
                    <p className="text-sm font-bold text-pink-600 mb-1">{t('modals.temptation.bought_title')}</p>
                    <p className="text-xs text-slate-500">
                        {t('modals.temptation.bought_text')}
                    </p>
                </div>
            )}

            {decided && choice === 'skip' && (
                <div className="bg-emerald-50 rounded-xl p-3 mb-4 border border-emerald-200">
                    <p className="text-sm font-bold text-emerald-600 mb-1">{t('modals.temptation.skip_title')}</p>
                    <p className="text-xs text-slate-500">
                        {t('modals.temptation.skip_text')}
                    </p>
                </div>
            )}

            {/* Action buttons */}
            {!decided ? (
                <div className="flex gap-3">
                    <Button
                        fullWidth
                        variant="danger"
                        onClick={handleBuy}
                        disabled={!canAfford}
                    >
                        {t('modals.temptation.buy_btn', { cost: temptation.cost })}
                    </Button>
                    <Button fullWidth variant="success" onClick={handleSkip}>
                        {t('modals.temptation.skip_btn')}
                    </Button>
                </div>
            ) : (
                <Button fullWidth onClick={handleClose}>
                    {t('modals.continue')}
                </Button>
            )}

            {!canAfford && !decided && (
                <p className="text-[10px] text-rose-400 text-center mt-2">
                    {t('modals.temptation.not_enough')}
                </p>
            )}
        </div>
    );
}
