import { useMemo, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { getRandomTemptation } from '../../data/temptations';
import Button from '../ui/Button';

export default function TemptationModal() {
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
    };

    const handleSkip = () => {
        if (decided) return;
        setDecided(true);
        setChoice('skip');
        playerSkipTemptation(player.id);
        showCoin(5); // savings reward!
    };

    const handleClose = () => closeModal();

    return (
        <div>
            <h2 className="font-display text-lg text-pink-500 mb-1">
                🛍️ Temptation!
            </h2>
            <p className="text-[10px] text-slate-400 mb-3">
                Want vs. Need — what will you choose?
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
                        🐷 This is a "want", not a "need". If you skip it, you'll save <strong>+$5</strong> in your savings account! But buying feels fun too... What's more important to you?
                    </p>
                </div>
            )}

            {/* Decision result */}
            {decided && choice === 'buy' && (
                <div className="bg-pink-50 rounded-xl p-3 mb-4 border border-pink-200">
                    <p className="text-sm font-bold text-pink-600 mb-1">🛍️ You bought it!</p>
                    <p className="text-xs text-slate-500">
                        It feels good now, but that money is gone. Was it worth it? 🤔
                    </p>
                </div>
            )}

            {decided && choice === 'skip' && (
                <div className="bg-emerald-50 rounded-xl p-3 mb-4 border border-emerald-200">
                    <p className="text-sm font-bold text-emerald-600 mb-1">💪 Great self-control!</p>
                    <p className="text-xs text-slate-500">
                        You saved $5 into your savings! Saying "no" to wants now means more freedom later. Smart choice!
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
                        🛒 Buy ${temptation.cost}
                    </Button>
                    <Button fullWidth variant="success" onClick={handleSkip}>
                        💪 Skip (+$5 saved)
                    </Button>
                </div>
            ) : (
                <Button fullWidth onClick={handleClose}>
                    Continue
                </Button>
            )}

            {!canAfford && !decided && (
                <p className="text-[10px] text-rose-400 text-center mt-2">
                    You don't have enough cash!
                </p>
            )}
        </div>
    );
}
