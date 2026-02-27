import { useState, useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { getRandomHustle } from '../../data/hustles';
import Button from '../ui/Button';

export default function HustleModal() {
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
            <h2 className="font-display text-xl text-purple-600 mt-3 mb-1">
                💼 {hustle.title}
            </h2>
            <p className="text-sm text-slate-500 mb-4">{hustle.text}</p>

            <div className="inline-block px-6 py-3 rounded-2xl font-display text-2xl font-extrabold bg-purple-50 text-purple-600 border border-purple-200 mb-5">
                +${hustle.amount}
            </div>

            <Button fullWidth variant="success" onClick={handleCollect} disabled={collected}>
                Collect! 💪
            </Button>
        </div>
    );
}
