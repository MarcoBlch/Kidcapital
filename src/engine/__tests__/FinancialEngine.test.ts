import { describe, it, expect } from 'vitest';
import {
    calculatePayday,
    applyPayday,
    canBuyAsset,
    buyAssetCash,
    buyAssetLoan,
    deposit,
    withdraw,
    applyLifeEvent,
    applyHustle,
    buyTemptation,
    skipTemptation,
    applyGoBonus,
    createDefaultPlayer,
} from '../FinancialEngine';
import type { Player, Asset } from '../../types';

// --- Test Helpers ---

function makePlayer(overrides: Partial<Player> = {}): Player {
    return {
        id: 0,
        name: 'Test',
        avatar: '😎',
        isHuman: true,
        cash: 200,
        savings: 0,
        salary: 50,
        baseExpenses: 20,
        debt: 0,
        loanPayment: 0,
        assets: [],
        position: 0,
        wantsSpent: 0,
        wantsSkipped: 0,
        quizCorrect: 0,
        quizTotal: 0,
        ...overrides,
    };
}

const CHEAP_ASSET: Asset = {
    id: 'a1',
    name: 'Lemonade Stand',
    cost: 50,
    income: 8,
    maint: 2,
    icon: '🍋',
    tier: 1,
};

const EXPENSIVE_ASSET: Asset = {
    id: 'a9',
    name: 'Food Truck',
    cost: 300,
    income: 48,
    maint: 15,
    icon: '🚚',
    tier: 3,
};

// --- Payday Tests ---

describe('calculatePayday', () => {
    it('should calculate net = salary - baseExpenses with no assets', () => {
        const player = makePlayer();
        const report = calculatePayday(player);

        expect(report.salary).toBe(50);
        expect(report.passiveIncome).toBe(0);
        expect(report.savingsInterest).toBe(0);
        expect(report.totalIncome).toBe(50);
        expect(report.baseExpenses).toBe(20);
        expect(report.maintenanceCosts).toBe(0);
        expect(report.loanPayment).toBe(0);
        expect(report.totalExpenses).toBe(20);
        expect(report.net).toBe(30);
        expect(report.newCash).toBe(230); // 200 + 30
    });

    it('should include passive income and maintenance from assets', () => {
        const player = makePlayer({
            assets: [CHEAP_ASSET],
        });
        const report = calculatePayday(player);

        expect(report.passiveIncome).toBe(8);
        expect(report.maintenanceCosts).toBe(2);
        expect(report.totalIncome).toBe(58); // 50 + 8
        expect(report.totalExpenses).toBe(22); // 20 + 2
        expect(report.net).toBe(36);
    });

    it('should add 5% savings interest (floored)', () => {
        const player = makePlayer({ savings: 100 });
        const report = calculatePayday(player);

        expect(report.savingsInterest).toBe(5); // floor(100 * 0.05)
        expect(report.totalIncome).toBe(55); // 50 + 5
    });

    it('should floor savings interest for non-round values', () => {
        const player = makePlayer({ savings: 37 });
        const report = calculatePayday(player);

        expect(report.savingsInterest).toBe(1); // floor(37 * 0.05) = floor(1.85) = 1
    });

    it('should reduce debt on payday', () => {
        const player = makePlayer({ debt: 50, loanPayment: 20 });
        const report = calculatePayday(player);

        expect(report.debtPaid).toBe(20);
        expect(report.newDebt).toBe(30);
    });

    it('should zero out debt when payment exceeds remaining', () => {
        const player = makePlayer({ debt: 10, loanPayment: 20 });
        const report = calculatePayday(player);

        expect(report.debtPaid).toBe(10);
        expect(report.newDebt).toBe(0);
    });

    it('should not let cash go below 0', () => {
        const player = makePlayer({ cash: 5, salary: 10, baseExpenses: 50 });
        const report = calculatePayday(player);

        expect(report.net).toBe(-40); // 10 - 50
        expect(report.newCash).toBe(0); // max(0, 5 + (-40)) = 0
    });
});

describe('applyPayday', () => {
    it('should update player cash and debt from report', () => {
        const player = makePlayer({ debt: 50, loanPayment: 20 });
        const report = calculatePayday(player);
        const updated = applyPayday(player, report);

        expect(updated.cash).toBe(report.newCash);
        expect(updated.debt).toBe(report.newDebt);
    });

    it('should zero out loanPayment when debt reaches 0', () => {
        const player = makePlayer({ debt: 10, loanPayment: 20 });
        const report = calculatePayday(player);
        const updated = applyPayday(player, report);

        expect(updated.debt).toBe(0);
        expect(updated.loanPayment).toBe(0);
    });
});

// --- Asset Purchase Tests ---

describe('canBuyAsset', () => {
    it('should allow cash purchase when debt is 0 and cash sufficient', () => {
        const player = makePlayer({ cash: 100 });
        const result = canBuyAsset(player, CHEAP_ASSET);
        expect(result.cash).toBe(true);
        expect(result.loan).toBe(true);
    });

    it('should block all purchases when player has debt', () => {
        const player = makePlayer({ cash: 500, debt: 10 });
        const result = canBuyAsset(player, CHEAP_ASSET);
        expect(result.cash).toBe(false);
        expect(result.loan).toBe(false);
    });

    it('should allow loan but not cash for expensive assets', () => {
        const player = makePlayer({ cash: 150 }); // 150 >= 300*0.40=120
        const result = canBuyAsset(player, EXPENSIVE_ASSET);
        expect(result.cash).toBe(false);
        expect(result.loan).toBe(true);
    });

    it('should block loan when insufficient for down payment', () => {
        const player = makePlayer({ cash: 100 }); // 100 < 300*0.40=120
        const result = canBuyAsset(player, EXPENSIVE_ASSET);
        expect(result.cash).toBe(false);
        expect(result.loan).toBe(false);
    });
});

describe('buyAssetCash', () => {
    it('should deduct cost and add asset', () => {
        const player = makePlayer({ cash: 200 });
        const updated = buyAssetCash(player, CHEAP_ASSET);

        expect(updated).not.toBeNull();
        expect(updated!.cash).toBe(150); // 200 - 50
        expect(updated!.assets).toHaveLength(1);
        expect(updated!.assets[0].id).toBe('a1');
    });

    it('should return null when insufficient cash', () => {
        const player = makePlayer({ cash: 30 });
        const updated = buyAssetCash(player, CHEAP_ASSET);
        expect(updated).toBeNull();
    });

    it('should return null when player has debt', () => {
        const player = makePlayer({ cash: 200, debt: 10 });
        const updated = buyAssetCash(player, CHEAP_ASSET);
        expect(updated).toBeNull();
    });
});

describe('buyAssetLoan', () => {
    it('should calculate loan correctly', () => {
        const player = makePlayer({ cash: 150 });
        const updated = buyAssetLoan(player, EXPENSIVE_ASSET);

        expect(updated).not.toBeNull();

        // 300 * 0.40 = 120 down payment
        const downPayment = Math.ceil(300 * 0.40);
        expect(downPayment).toBe(120);
        expect(updated!.cash).toBe(30); // 150 - 120

        // Loan: 300 - 120 = 180, with 15% interest: ceil(180 * 1.15) = 207
        const loanWithInterest = Math.ceil(180 * 1.15);
        expect(loanWithInterest).toBe(207);
        expect(updated!.debt).toBe(207);

        // Monthly: ceil(207 * 0.15) = 32
        const monthly = Math.ceil(207 * 0.15);
        expect(monthly).toBe(32);
        expect(updated!.loanPayment).toBe(32);

        expect(updated!.assets).toHaveLength(1);
    });

    it('should return null when insufficient for down payment', () => {
        const player = makePlayer({ cash: 100 }); // 100 < 300*0.40=120
        const updated = buyAssetLoan(player, EXPENSIVE_ASSET);
        expect(updated).toBeNull();
    });

    it('should return null when player has debt', () => {
        const player = makePlayer({ cash: 200, debt: 5 });
        const updated = buyAssetLoan(player, EXPENSIVE_ASSET);
        expect(updated).toBeNull();
    });
});

// --- Banking Tests ---

describe('deposit', () => {
    it('should move cash to savings', () => {
        const player = makePlayer({ cash: 100, savings: 50 });
        const updated = deposit(player, 30);

        expect(updated).not.toBeNull();
        expect(updated!.cash).toBe(70);
        expect(updated!.savings).toBe(80);
    });

    it('should return null for insufficient cash', () => {
        const player = makePlayer({ cash: 10 });
        const updated = deposit(player, 20);
        expect(updated).toBeNull();
    });

    it('should return null for zero/negative amount', () => {
        const player = makePlayer({ cash: 100 });
        expect(deposit(player, 0)).toBeNull();
        expect(deposit(player, -5)).toBeNull();
    });
});

describe('withdraw', () => {
    it('should move savings to cash', () => {
        const player = makePlayer({ cash: 50, savings: 100 });
        const updated = withdraw(player, 40);

        expect(updated).not.toBeNull();
        expect(updated!.cash).toBe(90);
        expect(updated!.savings).toBe(60);
    });

    it('should return null for insufficient savings', () => {
        const player = makePlayer({ savings: 10 });
        const updated = withdraw(player, 20);
        expect(updated).toBeNull();
    });
});

// --- Event / Hustle / Temptation Tests ---

describe('applyLifeEvent', () => {
    it('should add positive amount to cash', () => {
        const player = makePlayer({ cash: 100 });
        const updated = applyLifeEvent(player, 25);
        expect(updated.cash).toBe(125);
    });

    it('should subtract negative amount but not below 0', () => {
        const player = makePlayer({ cash: 10 });
        const updated = applyLifeEvent(player, -20);
        expect(updated.cash).toBe(0);
    });
});

describe('applyHustle', () => {
    it('should add amount to cash', () => {
        const player = makePlayer({ cash: 100 });
        const updated = applyHustle(player, 25);
        expect(updated.cash).toBe(125);
    });
});

describe('buyTemptation', () => {
    it('should deduct cost and increment wantsSpent', () => {
        const player = makePlayer({ cash: 100 });
        const updated = buyTemptation(player, 25);

        expect(updated).not.toBeNull();
        expect(updated!.cash).toBe(75);
        expect(updated!.wantsSpent).toBe(1);
    });

    it('should return null for insufficient cash', () => {
        const player = makePlayer({ cash: 5 });
        const updated = buyTemptation(player, 25);
        expect(updated).toBeNull();
    });
});

describe('skipTemptation', () => {
    it('should increment wantsSkipped', () => {
        const player = makePlayer({ wantsSkipped: 2, savings: 10 });
        const updated = skipTemptation(player);
        expect(updated.wantsSkipped).toBe(3);
        expect(updated.savings).toBe(15); // +$5 discipline reward
    });
});

// --- GO Bonus ---

describe('applyGoBonus', () => {
    it('should add $10 to cash', () => {
        const player = makePlayer({ cash: 100 });
        const updated = applyGoBonus(player);
        expect(updated.cash).toBe(110);
    });
});

// --- Default Player ---

describe('createDefaultPlayer', () => {
    it('should create a player with standard starting values', () => {
        const player = createDefaultPlayer(0, 'Alice', '😎', true);

        expect(player.id).toBe(0);
        expect(player.name).toBe('Alice');
        expect(player.avatar).toBe('😎');
        expect(player.isHuman).toBe(true);
        expect(player.cash).toBe(100);
        expect(player.salary).toBe(35);
        expect(player.baseExpenses).toBe(30);
        expect(player.savings).toBe(0);
        expect(player.debt).toBe(0);
        expect(player.loanPayment).toBe(0);
        expect(player.assets).toEqual([]);
        expect(player.position).toBe(0);
    });

    it('should set bot personality if provided', () => {
        const bot = createDefaultPlayer(1, 'Chloe', '🐢', false, 'conservative');
        expect(bot.isHuman).toBe(false);
        expect(bot.personality).toBe('conservative');
    });
});
