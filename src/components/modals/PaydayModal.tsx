import { useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { calculatePayday } from '../../engine/FinancialEngine';
import Button from '../ui/Button';
import { useTranslation } from 'react-i18next';

export default function PaydayModal() {
    const { t } = useTranslation();
    const players = useGameStore(s => s.players);
    const currentPlayerIndex = useGameStore(s => s.currentPlayerIndex);
    const playerPayday = useGameStore(s => s.playerPayday);
    const closeModal = useUIStore(s => s.closeModal);
    const showCoin = useUIStore(s => s.showCoin);

    const player = players[currentPlayerIndex];

    const report = useMemo(() => calculatePayday(player), [player]);

    const handleCollect = () => {
        playerPayday(player.id);
        showCoin(report.net);
        closeModal();
    };

    return (
        <div>
            <h2 className="font-display text-xl text-amber-600 mb-1">
                {t('modals.payday.title')}
            </h2>
            <p className="text-xs text-slate-400 mb-4">
                {t('modals.payday.subtitle')}
            </p>

            {/* Income */}
            <div className="bg-emerald-50 rounded-xl p-3 mb-3">
                <div className="text-xs font-bold text-emerald-700 mb-2">{t('modals.payday.income_header')}</div>
                <Row label={t('modals.payday.salary')} value={report.salary} color="emerald" />
                {report.passiveIncome > 0 && (
                    <Row label={t('modals.payday.passive_income')} value={report.passiveIncome} color="emerald" />
                )}
                {report.savingsInterest > 0 && (
                    <Row label={t('modals.payday.savings_interest')} value={report.savingsInterest} color="emerald" />
                )}
                <div className="border-t border-emerald-200 mt-2 pt-2">
                    <Row label={t('modals.payday.total_income')} value={report.totalIncome} color="emerald" bold />
                </div>
            </div>

            {/* Expenses */}
            <div className="bg-rose-50 rounded-xl p-3 mb-3">
                <div className="text-xs font-bold text-rose-700 mb-2">{t('modals.payday.expenses_header')}</div>
                <Row label={t('modals.payday.living_costs')} value={-report.baseExpenses} color="rose" />
                {report.maintenanceCosts > 0 && (
                    <Row label={t('modals.payday.maintenance')} value={-report.maintenanceCosts} color="rose" />
                )}
                {report.loanPayment > 0 && (
                    <Row label={t('modals.payday.loan_payment')} value={-report.loanPayment} color="rose" />
                )}
                <div className="border-t border-rose-200 mt-2 pt-2">
                    <Row label={t('modals.payday.total_expenses')} value={-report.totalExpenses} color="rose" bold />
                </div>
            </div>

            {/* Net */}
            <div
                className={`rounded-xl p-3 mb-4 ${report.net >= 0 ? 'bg-emerald-100' : 'bg-rose-100'
                    }`}
            >
                <div className="flex items-center justify-between">
                    <span className="font-display text-sm font-bold text-slate-800">
                        {t('modals.payday.net_this_month')}
                    </span>
                    <span
                        className={`font-display text-xl font-extrabold ${report.net >= 0 ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                    >
                        {report.net >= 0 ? '+' : ''}${report.net}
                    </span>
                </div>
                {report.debtPaid > 0 && (
                    <div className="text-xs text-slate-500 mt-1">
                        {t('modals.payday.debt_reduced', { paid: report.debtPaid, remaining: report.newDebt })}
                    </div>
                )}
            </div>

            <Button fullWidth onClick={handleCollect}>
                {t('modals.payday.collect')}
            </Button>
        </div>
    );
}

function Row({
    label,
    value,
    color,
    bold = false,
}: {
    label: string;
    value: number;
    color: 'emerald' | 'rose';
    bold?: boolean;
}) {
    return (
        <div className="flex justify-between items-center py-0.5">
            <span className={`text-xs ${bold ? 'font-bold' : ''} text-slate-600`}>
                {label}
            </span>
            <span
                className={`text-xs ${bold ? 'font-bold' : ''} ${color === 'emerald' ? 'text-emerald-600' : 'text-rose-600'
                    }`}
            >
                {value >= 0 ? '+' : ''}${value}
            </span>
        </div>
    );
}
