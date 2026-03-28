import { useState, useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { getRandomHustle } from '../../data/hustles';
import Button from '../ui/Button';
import { useTranslation } from 'react-i18next';

export default function HustleModal() {
    const { t } = useTranslation();
    const playerApplyHustle = useGameStore(s => s.playerApplyHustle);
    const currentPlayerIndex = useGameStore(s => s.currentPlayerIndex);
    const players = useGameStore(s => s.players);
    const closeModal = useUIStore(s => s.closeModal);
    const showCoin = useUIStore(s => s.showCoin);

    const player = players[currentPlayerIndex];
    const hustle = useMemo(() => getRandomHustle(), []);
    const [collected, setCollected] = useState(false);

    const handleCollect = () => {
        if (collected) return;
        setCollected(true);
        playerApplyHustle(player.id, hustle.amount);
        showCoin(hustle.amount);
        setTimeout(() => closeModal(), 600);
    };

    return (
        <div className="text-center">
            <span className="text-5xl">{hustle.icon}</span>
            <h2 className="font-display text-xl mt-3 mb-1" style={{ color: '#8E24AA' }}>
                💼 {t(`data.hustles.${hustle.id}_title`, { defaultValue: hustle.title })}
            </h2>
            <p className="text-sm mb-4" style={{ color: '#5D5D6E' }}>{t(`data.hustles.${hustle.id}_text`, { defaultValue: hustle.text })}</p>

            <div
                className="inline-block px-6 py-3 rounded-2xl font-display text-2xl font-extrabold mb-5"
                style={{ background: '#F3E5F5', color: '#8E24AA', border: '2px solid #AB47BC' }}
            >
                +${hustle.amount}
            </div>

            <Button fullWidth variant="success" onClick={handleCollect} disabled={collected}>
                {t('modals.hustle.collect')}
            </Button>
        </div>
    );
}
