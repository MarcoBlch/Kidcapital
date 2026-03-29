import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { audioManager } from '../../audio/AudioManager';
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
    const skipReward = Math.round(temptation.cost * 0.25);

    const handleBuy = () => {
        if (!canAfford || decided) return;
        setDecided(true);
        setChoice('buy');
        audioManager.play('temptation_buy');
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
        audioManager.play('temptation_skip');
        playerSkipTemptation(player.id, temptation.cost);
        showCoin(skipReward);
        if (player.isHuman) {
            useAchievementStore.getState().recordTemptationSkip();
        }
    };

    const handleClose = () => closeModal();

    return (
        <div>
            <h2 className="font-display text-lg mb-1" style={{ color: '#EC407A' }}>
                {t('modals.temptation.title')}
            </h2>
            <p className="text-[10px] mb-3" style={{ color: '#9E9EAF' }}>
                {t('modals.temptation.subtitle')}
            </p>

            {/* Item card */}
            <div
                className="rounded-2xl p-4 mb-4 text-center"
                style={{ background: '#FFF0F3', border: '2px solid #FF8FAB' }}
            >
                {/* Animated icon — bounces on buy */}
                <motion.span
                    className="text-4xl block mb-2"
                    animate={choice === 'buy' ? { scale: [1, 1.4, 1.2, 0], opacity: [1, 1, 1, 0] } : {}}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                    {temptation.icon}
                </motion.span>
                <h3 className="font-display text-base font-bold" style={{ color: '#1A1A2E' }}>
                    {t(`data.temptations.${temptation.id}_name`, { defaultValue: temptation.name })}
                </h3>
                <p className="text-xs mt-1 mb-3" style={{ color: '#5D5D6E' }}>
                    {t(`data.temptations.${temptation.id}_text`, { defaultValue: temptation.text })}
                </p>
                <div className="font-display text-2xl font-extrabold" style={{ color: '#EC407A' }}>
                    ${temptation.cost}
                </div>
            </div>

            {/* Dilemma info */}
            {!decided && (
                <div
                    className="rounded-xl p-3 mb-4"
                    style={{ background: '#FFF8E1', border: '2px solid #FFD700' }}
                >
                    <p className="text-xs leading-relaxed" style={{ color: '#78350f' }}>
                        {t('modals.temptation.dilemma')}
                    </p>
                </div>
            )}

            {/* Decision result */}
            {decided && choice === 'buy' && (
                <div
                    className="rounded-xl p-3 mb-4"
                    style={{ background: '#FFEBEE', border: '2px solid #EF5350' }}
                >
                    <p className="text-sm font-bold mb-1" style={{ color: '#C62828' }}>{t('modals.temptation.bought_title')}</p>
                    <p className="text-xs" style={{ color: '#5D5D6E' }}>
                        {t('modals.temptation.bought_text')}
                    </p>
                </div>
            )}

            {decided && choice === 'skip' && (
                <div
                    className="rounded-xl p-3 mb-4"
                    style={{ background: '#E8F5E9', border: '2px solid #4CAF50' }}
                >
                    <p className="text-sm font-bold mb-1" style={{ color: '#2E7D32' }}>
                        {t('modals.temptation.skip_title')} +${skipReward} 🏦
                    </p>
                    <p className="text-xs" style={{ color: '#5D5D6E' }}>
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
                <p className="text-[10px] text-center mt-2" style={{ color: '#EF5350' }}>
                    {t('modals.temptation.not_enough')}
                </p>
            )}
        </div>
    );
}
