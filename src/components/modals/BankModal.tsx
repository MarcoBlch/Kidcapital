import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import Button from '../ui/Button';
import { useTranslation } from 'react-i18next';

export default function BankModal() {
    const { t } = useTranslation();
    const players = useGameStore(s => s.players);
    const currentPlayerIndex = useGameStore(s => s.currentPlayerIndex);
    const playerDeposit = useGameStore(s => s.playerDeposit);
    const playerWithdraw = useGameStore(s => s.playerWithdraw);
    const playerRepayDebt = useGameStore(s => s.playerRepayDebt);
    const closeModal = useUIStore(s => s.closeModal);
    const confirmModalAction = useUIStore(s => s.confirmModalAction);
    const showCoin = useUIStore(s => s.showCoin);

    const player = players[currentPlayerIndex];
    const hasDebt = player.debt > 0;

    const [tab, setTab] = useState<'deposit' | 'withdraw' | 'repay'>('deposit');
    const [amount, setAmount] = useState(0);

    const presets = [10, 25, 50];
    const maxDeposit = player.cash;
    const maxWithdraw = player.savings;
    const maxRepay = Math.min(player.cash, player.debt);

    const handlePreset = (value: number) => {
        const max = tab === 'deposit' ? maxDeposit : tab === 'withdraw' ? maxWithdraw : maxRepay;
        setAmount(Math.min(value, max));
    };

    const handleAll = () => {
        setAmount(tab === 'deposit' ? maxDeposit : tab === 'withdraw' ? maxWithdraw : maxRepay);
    };

    const handleConfirm = () => {
        if (amount <= 0) return;
        if (tab === 'deposit') {
            if (playerDeposit(player.id, amount)) showCoin(-amount);
        } else if (tab === 'withdraw') {
            if (playerWithdraw(player.id, amount)) showCoin(amount);
        } else {
            if (playerRepayDebt(player.id, amount)) showCoin(-amount);
        }
        confirmModalAction();
        closeModal();
    };

    const handleSkip = () => {
        confirmModalAction();
        closeModal();
    };

    const tabActive = (t: typeof tab) => tab === t;

    return (
        <div>
            <h2 className="font-display text-xl mb-1" style={{ color: '#3949AB' }}>
                {t('modals.bank.title')}
            </h2>
            <p className="text-xs mb-4" style={{ color: '#9E9EAF' }}>
                {t('modals.bank.subtitle')}
            </p>

            {/* Balance display */}
            <div className="flex gap-3 mb-4">
                <div className="flex-1 rounded-xl p-3 text-center" style={{ background: '#FFF8E1', border: '2px solid #FFD700' }}>
                    <div className="text-[10px] mb-1" style={{ color: '#9E9EAF' }}>{t('modals.bank.cash')}</div>
                    <div className="font-display text-lg font-bold" style={{ color: '#DAA520' }}>
                        ${player.cash}
                    </div>
                </div>
                <div className="flex-1 rounded-xl p-3 text-center" style={{ background: '#E8EAF6', border: '2px solid #5C6BC0' }}>
                    <div className="text-[10px] mb-1" style={{ color: '#9E9EAF' }}>{t('modals.bank.savings')}</div>
                    <div className="font-display text-lg font-bold" style={{ color: '#3949AB' }}>
                        ${player.savings}
                    </div>
                </div>
                {hasDebt && (
                    <div className="flex-1 rounded-xl p-3 text-center" style={{ background: '#FFEBEE', border: '2px solid #EF5350' }}>
                        <div className="text-[10px] mb-1" style={{ color: '#9E9EAF' }}>{t('modals.bank.debt')}</div>
                        <div className="font-display text-lg font-bold" style={{ color: '#C62828' }}>
                            ${player.debt}
                        </div>
                    </div>
                )}
            </div>

            {/* Tab selector */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => { setTab('deposit'); setAmount(0); }}
                    className="flex-1 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer"
                    style={{
                        background: tabActive('deposit') ? '#3949AB' : '#F0F0F0',
                        color: tabActive('deposit') ? '#FFFFFF' : '#9E9EAF',
                    }}
                >
                    {t('modals.bank.deposit')}
                </button>
                <button
                    onClick={() => { setTab('withdraw'); setAmount(0); }}
                    className="flex-1 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer"
                    style={{
                        background: tabActive('withdraw') ? '#DAA520' : '#F0F0F0',
                        color: tabActive('withdraw') ? '#FFFFFF' : '#9E9EAF',
                    }}
                >
                    {t('modals.bank.withdraw')}
                </button>
                {hasDebt && (
                    <button
                        onClick={() => { setTab('repay'); setAmount(0); }}
                        className="flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        style={{
                            background: tabActive('repay') ? '#EF5350' : '#F0F0F0',
                            color: tabActive('repay') ? '#FFFFFF' : '#9E9EAF',
                        }}
                    >
                        {t('modals.bank.repay')}
                    </button>
                )}
            </div>

            {/* Amount presets */}
            <div className="flex gap-2 mb-4">
                {presets.map(p => (
                    <Button
                        key={p}
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        onClick={() => handlePreset(p)}
                    >
                        ${p}
                    </Button>
                ))}
                <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={handleAll}
                >
                    {t('modals.bank.all')}
                </Button>
            </div>

            {/* Amount display */}
            <div className="text-center mb-4">
                <div className="font-display text-3xl font-extrabold" style={{ color: '#1A1A2E' }}>
                    ${amount}
                </div>
                <div className="text-xs" style={{ color: '#9E9EAF' }}>
                    {tab === 'deposit'
                        ? t('modals.bank.cash_to_savings')
                        : tab === 'withdraw'
                            ? t('modals.bank.savings_to_cash')
                            : t('modals.bank.cash_to_debt')}
                </div>
            </div>

            <div className="flex gap-3">
                <Button fullWidth onClick={handleConfirm} disabled={amount <= 0}>
                    {tab === 'deposit'
                        ? t('modals.bank.deposit_btn')
                        : tab === 'withdraw'
                            ? t('modals.bank.withdraw_btn')
                            : t('modals.bank.repay_btn')}
                </Button>
                <Button variant="ghost" onClick={handleSkip}>
                    {t('modals.skip')}
                </Button>
            </div>
        </div>
    );
}
