import { useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { calculatePayday } from '../../engine/FinancialEngine';
import { audioManager } from '../../audio/AudioManager';
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
        audioManager.play('payday');
        playerPayday(player.id);
        showCoin(report.net);
        closeModal();
    };

    return (
        <div>
            <h2 className="font-display text-xl mb-1" style={{ color: '#DAA520' }}>
                {t('modals.payday.title')}
            </h2>
            <p className="text-xs mb-4" style={{ color: '#9E9EAF' }}>
                {t('modals.payday.subtitle')}
            </p>

            {/* Income */}
            <div className="rounded-xl p-3 mb-3" style={{ background: '#E8F5E9', border: '2px solid #4CAF50' }}>
                <div className="text-xs font-bold mb-2" style={{ color: '#2E7D32' }}>{t('modals.payday.income_header')}</div>
                <Row label={t('modals.payday.salary')} value={report.salary} positive />
                {report.passiveIncome > 0 && (
                    <Row label={t('modals.payday.passive_income')} value={report.passiveIncome} positive />
                )}
                {report.savingsInterest > 0 && (
                    <Row label={t('modals.payday.savings_interest')} value={report.savingsInterest} positive />
                )}
                <div className="mt-2 pt-2" style={{ borderTop: '1px solid #4CAF50' }}>
                    <Row label={t('modals.payday.total_income')} value={report.totalIncome} positive bold />
                </div>
            </div>

            {/* Expenses */}
            <div className="rounded-xl p-3 mb-3" style={{ background: '#FFEBEE', border: '2px solid #EF5350' }}>
                <div className="text-xs font-bold mb-2" style={{ color: '#C62828' }}>{t('modals.payday.expenses_header')}</div>
                <Row label={t('modals.payday.living_costs')} value={-report.baseExpenses} />
                {report.maintenanceCosts > 0 && (
                    <Row label={t('modals.payday.maintenance')} value={-report.maintenanceCosts} />
                )}
                {report.loanPayment > 0 && (
                    <Row label={t('modals.payday.loan_payment')} value={-report.loanPayment} />
                )}
                <div className="mt-2 pt-2" style={{ borderTop: '1px solid #EF5350' }}>
                    <Row label={t('modals.payday.total_expenses')} value={-report.totalExpenses} bold />
                </div>
            </div>

            {/* Net */}
            <div
                className="rounded-xl p-3 mb-4"
                style={{
                    background: report.net >= 0 ? '#C8E6C9' : '#FFCDD2',
                    border: `2px solid ${report.net >= 0 ? '#4CAF50' : '#EF5350'}`,
                }}
            >
                <div className="flex items-center justify-between">
                    <span className="font-display text-sm font-bold" style={{ color: '#1A1A2E' }}>
                        {t('modals.payday.net_this_month')}
                    </span>
                    <span
                        className="font-display text-xl font-extrabold"
                        style={{ color: report.net >= 0 ? '#2E7D32' : '#C62828' }}
                    >
                        {report.net >= 0 ? '+' : ''}${report.net}
                    </span>
                </div>
                {report.debtPaid > 0 && (
                    <div className="text-xs mt-1" style={{ color: '#5D5D6E' }}>
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
    positive = false,
    bold = false,
}: {
    label: string;
    value: number;
    positive?: boolean;
    bold?: boolean;
}) {
    return (
        <div className="flex justify-between items-center gap-2 py-0.5">
            <span className={`text-xs min-w-0 truncate ${bold ? 'font-bold' : ''}`} style={{ color: '#5D5D6E' }}>
                {label}
            </span>
            <span
                className={`text-xs shrink-0 whitespace-nowrap ${bold ? 'font-bold' : ''}`}
                style={{ color: positive ? '#4CAF50' : '#EF5350' }}
            >
                {value >= 0 ? '+' : ''}${value}
            </span>
        </div>
    );
}
