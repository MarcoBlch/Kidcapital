import { useState, useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { getRandomEvent } from '../../data/events';
import { getPennyPhrase } from '../../data/penny-phrases';
import Button from '../ui/Button';
import { useTranslation } from 'react-i18next';

export default function LifeEventModal() {
    const { t } = useTranslation();
    const playerApplyLifeEvent = useGameStore(s => s.playerApplyLifeEvent);
    const currentPlayerIndex = useGameStore(s => s.currentPlayerIndex);
    const players = useGameStore(s => s.players);
    const closeModal = useUIStore(s => s.closeModal);
    const showCoin = useUIStore(s => s.showCoin);

    const player = players[currentPlayerIndex];
    const event = useMemo(() => getRandomEvent(), []);
    const [collected, setCollected] = useState(false);

    const isGood = event.amount > 0;

    const handleCollect = () => {
        if (collected) return;
        setCollected(true);
        playerApplyLifeEvent(player.id, event.amount);
        showCoin(event.amount);

        // Penny reacts based on the event context
        const uiStore = useUIStore.getState();
        uiStore.showPenny(getPennyPhrase(isGood ? 'life_event_good' : 'life_event_bad'));

        setTimeout(() => closeModal(), 600);
    };

    return (
        <div className="text-center">
            <span className="text-5xl">{event.mood}</span>
            <h2
                className="font-display text-xl mt-3 mb-1"
                style={{ color: isGood ? '#4CAF50' : '#EF5350' }}
            >
                {t(`data.events.${event.id}_title`, { defaultValue: event.title })}
            </h2>
            <p className="text-sm mb-4" style={{ color: '#5D5D6E' }}>{t(`data.events.${event.id}_text`, { defaultValue: event.text })}</p>

            <div
                className="inline-block px-6 py-3 rounded-2xl font-display text-2xl font-extrabold mb-5"
                style={{
                    background: isGood ? '#E8F5E9' : '#FFEBEE',
                    color: isGood ? '#4CAF50' : '#EF5350',
                    border: `2px solid ${isGood ? '#4CAF50' : '#EF5350'}`,
                }}
            >
                {isGood ? '+' : ''}${event.amount}
            </div>

            <Button fullWidth onClick={handleCollect} disabled={collected}>
                {isGood ? t('modals.life_event.sweet') : t('modals.life_event.ouch')}
            </Button>
        </div>
    );
}
