import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import Button from '../ui/Button';

export default function PortfolioModal() {
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
            <div className="flex-shrink-0 mb-4">
                <h2 className="font-display text-2xl text-slate-800 mb-1">
                    💼 Your Portfolio
                </h2>
                <p className="text-xs text-slate-400">
                    Track your business empire and see your wealth grow!
                </p>
            </div>

            {/* High-level stats */}
            <div className="flex-shrink-0 grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-3 border border-emerald-200">
                    <div className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest mb-1">Net Worth</div>
                    <div className="font-display text-2xl font-bold text-emerald-600">${netWorth}</div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl p-3 border border-amber-200">
                    <div className="text-[10px] font-bold text-amber-600/60 uppercase tracking-widest mb-1">Passive Income</div>
                    <div className="font-display text-2xl font-bold text-amber-600">${passiveIncome}/mo</div>
                </div>
            </div>

            {/* Asset List */}
            <div className="flex-1 overflow-y-auto space-y-3 pb-4">
                {player.assets.length === 0 ? (
                    <div className="text-center bg-slate-50 border border-slate-100 rounded-2xl p-6 h-full flex flex-col justify-center items-center">
                        <span className="text-4xl mb-3 block opacity-50 grayscale hover:grayscale-0 transition-all cursor-crosshair">🏪</span>
                        <h3 className="font-display text-sm font-bold text-slate-700 mb-1">No businesses yet!</h3>
                        <p className="text-xs text-slate-400 max-w-[200px] mx-auto leading-relaxed">
                            Land on an Invest space or buy from another player to start building your empire.
                        </p>
                    </div>
                ) : (
                    player.assets.map((asset, i) => (
                        <div key={asset.id + i} className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex items-center gap-3">
                            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                                {asset.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-display text-sm font-bold text-slate-800 truncate">{asset.name}</div>
                                <div className="text-[10px] text-slate-400 mt-0.5">Bought for ${asset.cost}</div>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <div className="font-display text-sm font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
                                    +${asset.income - asset.maint}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="flex-shrink-0 pt-2 border-t border-slate-100">
                <Button fullWidth onClick={closeModal}>
                    Close Portfolio
                </Button>
            </div>
        </div>
    );
}
