import { useState, useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { getRandomEvent } from '../../data/events';
import { getPennyPhrase } from '../../data/penny-phrases';
import Button from '../ui/Button';

export default function LifeEventModal() {
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
                className={`font-display text-xl mt-3 mb-1 ${isGood ? 'text-emerald-600' : 'text-rose-600'
                    }`}
            >
                {event.title}
            </h2>
            <p className="text-sm text-slate-500 mb-4">{event.text}</p>

            <div
                className={`inline-block px-6 py-3 rounded-2xl font-display text-2xl font-extrabold mb-5 ${isGood
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : 'bg-rose-50 text-rose-600 border border-rose-200'
                    }`}
            >
                {isGood ? '+' : ''}${event.amount}
            </div>

            <Button fullWidth onClick={handleCollect} disabled={collected}>
                {isGood ? 'Sweet! 🎉' : 'Ouch! 😅'}
            </Button>
        </div>
    );
}
