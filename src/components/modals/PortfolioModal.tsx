import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { getAssetImage } from '../../data/assets';
import Button from '../ui/Button';
import { useTranslation } from 'react-i18next';

export default function PortfolioModal() {
    const { t } = useTranslation();
    const players = useGameStore(s => s.players);
    const currentPlayerIndex = useGameStore(s => s.currentPlayerIndex);
    const closeModal = useUIStore(s => s.closeModal);

    // Get the human player. The portfolio is typically viewed by the human.
    // If we trigger this during the human's turn, currentPlayer[currentPlayerIndex] is fine.
    // Since it's access via UI button, it should be the human.
    const player = players.find(p => p.isHuman) || players[currentPlayerIndex];

    const netWorth =
        player.cash +
        player.savings +
        player.assets.reduce((sum, a) => sum + a.cost, 0) -
        player.debt;

    const passiveIncome = player.assets.reduce((sum, a) => sum + a.income, 0);

    return (
        <div className="flex flex-col h-full max-h-[75vh]">
            <div className="shrink-0 mb-4">
                <h2 className="font-display text-2xl mb-1" style={{ color: '#1A1A2E' }}>
                    {t('modals.portfolio.title')}
                </h2>
                <p className="text-xs" style={{ color: '#9E9EAF' }}>
                    {t('modals.portfolio.subtitle')}
                </p>
            </div>

            {/* High-level stats */}
            <div className="shrink-0 grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-2xl p-3" style={{ background: '#E8F5E9', border: '2px solid #4CAF50' }}>
                    <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#2E7D32' }}>{t('modals.portfolio.net_worth')}</div>
                    <div className="font-display text-2xl font-bold" style={{ color: '#4CAF50' }}>${netWorth}</div>
                </div>
                <div className="rounded-2xl p-3" style={{ background: '#FFF8E1', border: '2px solid #FFD700' }}>
                    <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#DAA520' }}>{t('modals.portfolio.passive_income')}</div>
                    <div className="font-display text-2xl font-bold" style={{ color: '#DAA520' }}>${passiveIncome}/mo</div>
                </div>
            </div>

            {/* Asset List */}
            <div className="flex-1 overflow-y-auto space-y-3 pb-4">
                {player.assets.length === 0 ? (
                    <div
                        className="text-center rounded-2xl p-6 h-full flex flex-col justify-center items-center"
                        style={{ background: '#FFF8F0', border: '2px solid #E0E0E0' }}
                    >
                        <span className="text-4xl mb-3 block opacity-50">🏪</span>
                        <h3 className="font-display text-sm font-bold mb-1" style={{ color: '#1A1A2E' }}>{t('modals.portfolio.no_biz_title')}</h3>
                        <p className="text-xs max-w-[200px] mx-auto leading-relaxed" style={{ color: '#9E9EAF' }}>
                            {t('modals.portfolio.no_biz_text')}
                        </p>
                    </div>
                ) : (
                    player.assets.map((asset, i) => {
                        const assetImg = getAssetImage(asset.id);
                        return (
                            <div
                                key={asset.id + i}
                                className="rounded-2xl p-3 flex items-center gap-3"
                                style={{ background: '#FFFFFF', border: '2px solid #E0E0E0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                            >
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                                    style={{ background: '#FFF8F0', border: '2px solid #E0E0E0' }}
                                >
                                    {assetImg ? (
                                        <img src={assetImg} alt={t(`data.assets.${asset.id}_name`, { defaultValue: asset.name })} width={32} height={32} className="object-contain" draggable={false} />
                                    ) : (
                                        <span className="text-2xl">{asset.icon}</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-display text-sm font-bold truncate" style={{ color: '#1A1A2E' }}>{t(`data.assets.${asset.id}_name`, { defaultValue: asset.name })}</div>
                                    <div className="text-[10px] mt-0.5" style={{ color: '#9E9EAF' }}>{t('modals.portfolio.bought_for', { cost: asset.cost })}</div>
                                </div>
                                <div className="text-right shrink-0">
                                    <div
                                        className="font-display text-sm font-bold px-2 py-1 rounded-lg"
                                        style={{ color: '#4CAF50', background: '#E8F5E9' }}
                                    >
                                        +${asset.income - asset.maint}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="shrink-0 pt-2" style={{ borderTop: '1px solid #E0E0E0' }}>
                <Button fullWidth onClick={closeModal}>
                    {t('modals.portfolio.close')}
                </Button>
            </div>
        </div>
    );
}
