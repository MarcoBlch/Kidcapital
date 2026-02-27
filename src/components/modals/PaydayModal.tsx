import { useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { calculatePayday } from '../../engine/FinancialEngine';
import Button from '../ui/Button';

export default function PaydayModal() {
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
                💰 Payday
            </h2>
            <p className="text-xs text-slate-400 mb-4">
                Monthly Income Statement
            </p>

            {/* Income */}
            <div className="bg-emerald-50 rounded-xl p-3 mb-3">
                <div className="text-xs font-bold text-emerald-700 mb-2">📥 INCOME</div>
                <Row label="Salary" value={report.salary} color="emerald" />
                {report.passiveIncome > 0 && (
                    <Row label="Passive Income" value={report.passiveIncome} color="emerald" />
                )}
                {report.savingsInterest > 0 && (
                    <Row label="Savings Interest (5%)" value={report.savingsInterest} color="emerald" />
                )}
                <div className="border-t border-emerald-200 mt-2 pt-2">
                    <Row label="Total Income" value={report.totalIncome} color="emerald" bold />
                </div>
            </div>

            {/* Expenses */}
            <div className="bg-rose-50 rounded-xl p-3 mb-3">
                <div className="text-xs font-bold text-rose-700 mb-2">📤 EXPENSES</div>
                <Row label="Living Costs" value={-report.baseExpenses} color="rose" />
                {report.maintenanceCosts > 0 && (
                    <Row label="Maintenance" value={-report.maintenanceCosts} color="rose" />
                )}
                {report.loanPayment > 0 && (
                    <Row label="Loan Payment" value={-report.loanPayment} color="rose" />
                )}
                <div className="border-t border-rose-200 mt-2 pt-2">
                    <Row label="Total Expenses" value={-report.totalExpenses} color="rose" bold />
                </div>
            </div>

            {/* Net */}
            <div
                className={`rounded-xl p-3 mb-4 ${report.net >= 0 ? 'bg-emerald-100' : 'bg-rose-100'
                    }`}
            >
                <div className="flex items-center justify-between">
                    <span className="font-display text-sm font-bold text-slate-800">
                        NET THIS MONTH
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
                        💳 Debt reduced by ${report.debtPaid} → ${report.newDebt} remaining
                    </div>
                )}
            </div>

            <Button fullWidth onClick={handleCollect}>
                Collect 💵
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
