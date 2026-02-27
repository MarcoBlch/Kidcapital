import { useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { getAvailableAssets } from '../../data/assets';
import { canBuyAsset } from '../../engine/FinancialEngine';
import Button from '../ui/Button';
import type { Asset } from '../../types';

export default function InvestModal() {
    const players = useGameStore(s => s.players);
    const currentPlayerIndex = useGameStore(s => s.currentPlayerIndex);
    const playerBuyAssetCash = useGameStore(s => s.playerBuyAssetCash);
    const playerBuyAssetLoan = useGameStore(s => s.playerBuyAssetLoan);
    const closeModal = useUIStore(s => s.closeModal);
    const showCoin = useUIStore(s => s.showCoin);

    const player = players[currentPlayerIndex];

    const available = useMemo(() => {
        const ownedIds = player.assets.map(a => a.id);
        return getAvailableAssets(ownedIds, 3);
    }, [player.assets]);

    const handleBuyCash = (asset: Asset) => {
        if (playerBuyAssetCash(player.id, asset)) {
            showCoin(-asset.cost);
            closeModal();
        }
    };

    const handleBuyLoan = (asset: Asset) => {
        const down = Math.ceil(asset.cost * 0.30);
        if (playerBuyAssetLoan(player.id, asset)) {
            showCoin(-down);
            closeModal();
        }
    };

    const handleSkip = () => {
        closeModal();
    };

    return (
        <div>
            <h2 className="font-display text-xl text-emerald-600 mb-1">
                🏪 Business Market
            </h2>
            <p className="text-xs text-slate-400 mb-4">
                {player.debt > 0
                    ? '⚠️ Pay off debt before investing!'
                    : 'Choose a business to buy!'}
            </p>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                {available.map(asset => {
                    const buyOpts = canBuyAsset(player, asset);
                    const down = Math.ceil(asset.cost * 0.30);

                    return (
                        <div
                            key={asset.id}
                            className="bg-slate-50 rounded-2xl p-3 border border-slate-100"
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">{asset.icon}</span>
                                <div className="flex-1">
                                    <div className="font-display text-sm font-bold text-slate-800">
                                        {asset.name}
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 text-xs">
                                        <span className="text-slate-500">💰 ${asset.cost}</span>
                                        <span className="text-emerald-500">📈 +${asset.income}/mo</span>
                                        <span className="text-slate-400">🔧 -${asset.maint}/mo</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-1">
                                        Net +${asset.income - asset.maint}/mo • Tier {asset.tier}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-3">
                                <Button
                                    size="sm"
                                    variant="success"
                                    fullWidth
                                    disabled={!buyOpts.cash}
                                    onClick={() => handleBuyCash(asset)}
                                >
                                    Buy ${asset.cost}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    fullWidth
                                    disabled={!buyOpts.loan}
                                    onClick={() => handleBuyLoan(asset)}
                                >
                                    Loan (${down} down)
                                </Button>
                            </div>
                        </div>
                    );
                })}

                {available.length === 0 && (
                    <div className="text-center text-slate-400 py-8">
                        <span className="text-3xl">🎉</span>
                        <p className="mt-2 font-medium">You own all businesses!</p>
                    </div>
                )}
            </div>

            <Button
                variant="ghost"
                fullWidth
                className="mt-3"
                onClick={handleSkip}
            >
                Skip
            </Button>
        </div>
    );
}
