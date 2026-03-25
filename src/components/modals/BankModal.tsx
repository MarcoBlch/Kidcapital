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
    const closeModal = useUIStore(s => s.closeModal);
    const showCoin = useUIStore(s => s.showCoin);

    const player = players[currentPlayerIndex];

    const [tab, setTab] = useState<'deposit' | 'withdraw'>('deposit');
    const [amount, setAmount] = useState(0);

    const presets = [10, 25, 50];
    const maxDeposit = player.cash;
    const maxWithdraw = player.savings;

    const handlePreset = (value: number) => {
        const max = tab === 'deposit' ? maxDeposit : maxWithdraw;
        setAmount(Math.min(value, max));
    };

    const handleAll = () => {
        setAmount(tab === 'deposit' ? maxDeposit : maxWithdraw);
    };

    const handleConfirm = () => {
        if (amount <= 0) return;
        if (tab === 'deposit') {
            if (playerDeposit(player.id, amount)) {
                showCoin(-amount);
            }
        } else {
            if (playerWithdraw(player.id, amount)) {
                showCoin(amount);
            }
        }
        closeModal();
    };

    return (
        <div>
            <h2 className="font-display text-xl text-indigo-500 mb-1">
                {t('modals.bank.title')}
            </h2>
            <p className="text-xs text-slate-400 mb-4">
                {t('modals.bank.subtitle')}
            </p>

            {/* Balance display */}
            <div className="flex gap-3 mb-4">
                <div className="flex-1 bg-amber-50 rounded-xl p-3 text-center">
                    <div className="text-[10px] text-slate-400 mb-1">{t('modals.bank.cash')}</div>
                    <div className="font-display text-lg font-bold text-amber-600">
                        ${player.cash}
                    </div>
                </div>
                <div className="flex-1 bg-indigo-50 rounded-xl p-3 text-center">
                    <div className="text-[10px] text-slate-400 mb-1">{t('modals.bank.savings')}</div>
                    <div className="font-display text-lg font-bold text-indigo-600">
                        ${player.savings}
                    </div>
                </div>
            </div>

            {/* Tab selector */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => { setTab('deposit'); setAmount(0); }}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${tab === 'deposit'
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                >
                    {t('modals.bank.deposit')}
                </button>
                <button
                    onClick={() => { setTab('withdraw'); setAmount(0); }}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${tab === 'withdraw'
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                >
                    {t('modals.bank.withdraw')}
                </button>
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
                <div className="font-display text-3xl font-extrabold text-slate-800">
                    ${amount}
                </div>
                <div className="text-xs text-slate-400">
                    {tab === 'deposit' ? t('modals.bank.cash_to_savings') : t('modals.bank.savings_to_cash')}
                </div>
            </div>

            <div className="flex gap-3">
                <Button fullWidth onClick={handleConfirm} disabled={amount <= 0}>
                    {tab === 'deposit' ? t('modals.bank.deposit_btn') : t('modals.bank.withdraw_btn')}
                </Button>
                <Button variant="ghost" onClick={closeModal}>
                    {t('modals.skip')}
                </Button>
            </div>
        </div>
    );
}
