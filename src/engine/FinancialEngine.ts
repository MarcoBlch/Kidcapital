import type { Player, Asset, PaydayReport } from '../types';
import { GO_BONUS, DOWN_PAYMENT_RATE, LOAN_INTEREST_RATE, LOAN_MONTHLY_RATE } from '../utils/constants';

// ============================================
// KidCapital — Financial Engine
// Pure functions, no side effects
// All money values are integers (no floating point)
// ============================================

/**
 * Calculate payday report for a player.
 * Shows full income statement breakdown.
 */
export function calculatePayday(player: Player): PaydayReport {
    const passiveIncome = player.assets.reduce((sum, a) => sum + a.income, 0);
    const savingsInterest = Math.floor(player.savings * 0.05);

    const totalIncome = player.salary + passiveIncome + savingsInterest;

    const maintenanceCosts = player.assets.reduce((sum, a) => sum + a.maint, 0);
    const totalExpenses = player.baseExpenses + maintenanceCosts + player.loanPayment;

    const net = totalIncome - totalExpenses;
    const newCash = Math.max(0, player.cash + net);

    // Debt reduction
    let newDebt = player.debt;
    let debtPaid = 0;
    if (player.debt > 0) {
        debtPaid = Math.min(player.loanPayment, player.debt);
        newDebt = Math.max(0, player.debt - debtPaid);
    }

    return {
        salary: player.salary,
        passiveIncome,
        savingsInterest,
        totalIncome,
        baseExpenses: player.baseExpenses,
        maintenanceCosts,
        loanPayment: player.loanPayment,
        totalExpenses,
        net,
        newCash,
        newDebt,
        debtPaid,
    };
}

/**
 * Apply a payday report to a player, returning updated player.
 */
export function applyPayday(player: Player, report: PaydayReport): Player {
    return {
        ...player,
        cash: report.newCash,
        debt: report.newDebt,
        loanPayment: report.newDebt === 0 ? 0 : player.loanPayment,
    };
}

/**
 * Check if a player can buy an asset with cash.
 */
export function canBuyCash(player: Player, asset: Asset): boolean {
    return player.debt === 0 && player.cash >= asset.cost;
}

/**
 * Check if a player can buy an asset with a loan (40% down).
 */
export function canBuyLoan(player: Player, asset: Asset): boolean {
    const downPayment = Math.ceil(asset.cost * DOWN_PAYMENT_RATE);
    return player.debt === 0 && player.cash >= downPayment;
}

/**
 * Check purchase options for a player and asset.
 */
export function canBuyAsset(player: Player, asset: Asset): { cash: boolean; loan: boolean } {
    return {
        cash: canBuyCash(player, asset),
        loan: canBuyLoan(player, asset),
    };
}

/**
 * Buy an asset with full cash payment.
 * Returns null if purchase is not possible.
 */
export function buyAssetCash(player: Player, asset: Asset): Player | null {
    if (!canBuyCash(player, asset)) return null;

    return {
        ...player,
        cash: player.cash - asset.cost,
        assets: [...player.assets, asset],
    };
}

/**
 * Buy an asset with a loan (40% down, 15% interest, 15% monthly payment).
 * Returns null if purchase is not possible.
 */
export function buyAssetLoan(player: Player, asset: Asset): Player | null {
    if (!canBuyLoan(player, asset)) return null;

    const downPayment = Math.ceil(asset.cost * DOWN_PAYMENT_RATE);
    const loanAmount = asset.cost - downPayment;
    const loanWithInterest = Math.ceil(loanAmount * (1 + LOAN_INTEREST_RATE));
    const monthlyPayment = Math.ceil(loanWithInterest * LOAN_MONTHLY_RATE);

    return {
        ...player,
        cash: player.cash - downPayment,
        debt: player.debt + loanWithInterest,
        loanPayment: player.loanPayment + monthlyPayment,
        assets: [...player.assets, asset],
    };
}

/**
 * Deposit cash into savings.
 * Returns null if insufficient cash.
 */
export function deposit(player: Player, amount: number): Player | null {
    if (amount <= 0 || player.cash < amount) return null;

    return {
        ...player,
        cash: player.cash - amount,
        savings: player.savings + amount,
    };
}

/**
 * Withdraw from savings to cash.
 * Returns null if insufficient savings.
 */
export function withdraw(player: Player, amount: number): Player | null {
    if (amount <= 0 || player.savings < amount) return null;

    return {
        ...player,
        cash: player.cash + amount,
        savings: player.savings - amount,
    };
}

/**
 * Apply a life event (positive or negative) to player.
 */
export function applyLifeEvent(player: Player, amount: number): Player {
    return {
        ...player,
        cash: Math.max(0, player.cash + amount),
    };
}

/**
 * Apply a hustle (active income) to player.
 */
export function applyHustle(player: Player, amount: number): Player {
    return {
        ...player,
        cash: player.cash + amount,
    };
}

/**
 * Apply temptation purchase to player.
 * Returns null if insufficient cash.
 */
export function buyTemptation(player: Player, cost: number): Player | null {
    if (player.cash < cost) return null;

    return {
        ...player,
        cash: player.cash - cost,
        wantsSpent: player.wantsSpent + 1,
    };
}

/**
 * Record skipping a temptation. Rewards discipline with a small savings bonus.
 */
export function skipTemptation(player: Player): Player {
    return {
        ...player,
        wantsSkipped: player.wantsSkipped + 1,
        savings: player.savings + 5,  // Discipline reward!
    };
}

/**
 * Apply passing GO bonus.
 */
export function applyGoBonus(player: Player): Player {
    return {
        ...player,
        cash: player.cash + GO_BONUS,
    };
}

/**
 * Create a default player with starting values.
 */
export function createDefaultPlayer(
    id: number,
    name: string,
    avatar: string,
    isHuman: boolean,
    personality?: Player['personality'],
): Player {
    return {
        id,
        name,
        avatar,
        isHuman,
        personality,
        cash: 100,          // was 200
        savings: 0,
        salary: 35,         // was 50
        baseExpenses: 30,   // was 20
        debt: 0,
        loanPayment: 0,
        assets: [],
        position: 0,
        wantsSpent: 0,
        wantsSkipped: 0,
        quizCorrect: 0,
        quizTotal: 0,
    };
}
