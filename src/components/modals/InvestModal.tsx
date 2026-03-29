import { useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { audioManager } from '../../audio/AudioManager';
import { useAchievementStore } from '../../store/achievementStore';
import { getAvailableAssets, getAssetImage } from '../../data/assets';
import { canBuyAsset } from '../../engine/FinancialEngine';
import Button from '../ui/Button';
import type { Asset } from '../../types';
import { useTranslation } from 'react-i18next';

export default function InvestModal() {
    const { t } = useTranslation();
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
            audioManager.play('buy_asset');
            showCoin(-asset.cost);
            if (player.isHuman) {
                useAchievementStore.getState().incrementStat('totalAssetsEverBought');
            }
            closeModal();
        }
    };

    const handleBuyLoan = (asset: Asset) => {
        const down = Math.ceil(asset.cost * 0.40);
        if (playerBuyAssetLoan(player.id, asset)) {
            audioManager.play('buy_asset');
            showCoin(-down);
            if (player.isHuman) {
                useAchievementStore.getState().incrementStat('totalAssetsEverBought');
            }
            closeModal();
        }
    };

    const handleSkip = () => {
        closeModal();
    };

    return (
        <div>
            <h2 className="font-display text-xl mb-1" style={{ color: '#4CAF50' }}>
                {t('modals.invest.title')}
            </h2>
            <p className="text-xs mb-4" style={{ color: '#9E9EAF' }}>
                {player.debt > 0
                    ? t('modals.invest.subtitle_debt')
                    : t('modals.invest.subtitle_normal')}
            </p>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                {available.map(asset => {
                    const buyOpts = canBuyAsset(player, asset);
                    const down = Math.ceil(asset.cost * 0.30);
                    const assetImg = getAssetImage(asset.id);

                    return (
                        <div
                            key={asset.id}
                            className="rounded-2xl p-3"
                            style={{ background: '#FFF8F0', border: '2px solid #E0E0E0' }}
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                                    style={{ background: '#FFFFFF', border: '2px solid #E0E0E0' }}
                                >
                                    {assetImg ? (
                                        <img src={assetImg} alt={t(`data.assets.${asset.id}_name`, { defaultValue: asset.name })} width={28} height={28} className="object-contain" draggable={false} />
                                    ) : (
                                        <span className="text-xl">{asset.icon}</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="font-display text-sm font-bold" style={{ color: '#1A1A2E' }}>
                                        {t(`data.assets.${asset.id}_name`, { defaultValue: asset.name })}
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 text-xs">
                                        <span style={{ color: '#5D5D6E' }}>💰 ${asset.cost}</span>
                                        <span style={{ color: '#4CAF50' }}>📈 +${asset.income}/mo</span>
                                        <span style={{ color: '#9E9EAF' }}>🔧 -${asset.maint}/mo</span>
                                    </div>
                                    <div className="text-[10px] mt-1" style={{ color: '#9E9EAF' }}>
                                        {t('modals.invest.net', { amount: asset.income - asset.maint, tier: asset.tier })}
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
                                    {t('modals.invest.buy', { cost: asset.cost })}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    fullWidth
                                    disabled={!buyOpts.loan}
                                    onClick={() => handleBuyLoan(asset)}
                                >
                                    {t('modals.invest.loan', { down })}
                                </Button>
                            </div>
                        </div>
                    );
                })}

                {available.length === 0 && (
                    <div className="text-center py-8" style={{ color: '#9E9EAF' }}>
                        <span className="text-3xl">🎉</span>
                        <p className="mt-2 font-medium">{t('modals.invest.own_all')}</p>
                    </div>
                )}
            </div>

            <Button
                variant="ghost"
                fullWidth
                className="mt-3"
                onClick={handleSkip}
            >
                {t('modals.invest.skip')}
            </Button>
        </div>
    );
}
