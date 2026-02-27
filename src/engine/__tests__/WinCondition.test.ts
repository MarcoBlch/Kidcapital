import { describe, it, expect } from 'vitest';
import { checkFreedom, getFreedomPercent } from '../WinCondition';
import type { Player, Asset } from '../../types';

// --- Test Helpers ---

function makePlayer(overrides: Partial<Player> = {}): Player {
    return {
        id: 0,
        name: 'Test',
        avatar: '😎',
        isHuman: true,
        cash: 100,
        savings: 0,
        salary: 35,
        baseExpenses: 30,
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

const ASSET_A: Asset = { id: 'a1', name: 'Lemonade', cost: 80, income: 6, maint: 2, icon: '🍋', tier: 1 };
const ASSET_B: Asset = { id: 'a2', name: 'Dog Walk', cost: 90, income: 7, maint: 2, icon: '🐕', tier: 1 };
const ASSET_C: Asset = { id: 'a3', name: 'Yard Care', cost: 120, income: 9, maint: 3, icon: '🌿', tier: 1 };
const ASSET_BIG: Asset = { id: 'a4', name: 'Candy Shop', cost: 200, income: 14, maint: 5, icon: '🍬', tier: 2 };

// --- checkFreedom Tests ---
// Win requires: debt=0, assets>=3, savings>=50, quiz>=50%, passive>=expenses

describe('checkFreedom', () => {
    it('should return false with no assets', () => {
        const player = makePlayer({ savings: 100, quizCorrect: 3, quizTotal: 5 });
        expect(checkFreedom(player)).toBe(false);
    });

    it('should return false with only 2 assets (need 3)', () => {
        const player = makePlayer({
            assets: [ASSET_A, ASSET_BIG],
            savings: 100,
            quizCorrect: 3,
            quizTotal: 5,
        });
        expect(checkFreedom(player)).toBe(false);
    });

    it('should return false with debt > 0', () => {
        const player = makePlayer({
            assets: [ASSET_A, ASSET_B, ASSET_C],
            savings: 100,
            debt: 10,
            quizCorrect: 3,
            quizTotal: 5,
        });
        expect(checkFreedom(player)).toBe(false);
    });

    it('should return false with insufficient savings (need $50)', () => {
        const player = makePlayer({
            baseExpenses: 5,
            assets: [ASSET_A, ASSET_B, ASSET_C],
            savings: 30, // < 50
            quizCorrect: 3,
            quizTotal: 5,
        });
        expect(checkFreedom(player)).toBe(false);
    });

    it('should return false with low quiz accuracy (need 50%)', () => {
        const player = makePlayer({
            baseExpenses: 5,
            assets: [ASSET_A, ASSET_B, ASSET_C],
            savings: 100,
            quizCorrect: 1,
            quizTotal: 5, // 20% < 50%
        });
        expect(checkFreedom(player)).toBe(false);
    });

    it('should return true when all 5 conditions met', () => {
        const player = makePlayer({
            baseExpenses: 10,
            assets: [ASSET_A, ASSET_B, ASSET_C],
            savings: 60,
            quizCorrect: 3,
            quizTotal: 5,
            // passive: 6+7+9=22, expenses: 10+2+2+3=17 → 22 >= 17 ✓
        });
        expect(checkFreedom(player)).toBe(true);
    });

    it('should return true when passive income exactly equals expenses', () => {
        const player = makePlayer({
            baseExpenses: 15,
            assets: [ASSET_A, ASSET_B, ASSET_C],
            savings: 50,
            quizCorrect: 5,
            quizTotal: 5,
            // passive: 6+7+9=22, expenses: 15+2+2+3=22 → 22 >= 22 ✓
        });
        expect(checkFreedom(player)).toBe(true);
    });
});

// --- getFreedomPercent Tests ---
// Weighted: income 40%, assets 25%, savings 20%, knowledge 15%

describe('getFreedomPercent', () => {
    it('should return low % with no assets, no savings, no quiz', () => {
        const player = makePlayer();
        const pct = getFreedomPercent(player);
        // No assets: income=0, assetRatio=0, savingsRatio=0
        // debtScore=1 (no debt), quizScore=0 → knowledge=0.5
        // 0*0.4 + 0*0.25 + 0*0.20 + 0.5*0.15 = 0.075 → round(7.5)=8
        expect(pct).toBe(8);
    });

    it('should return correct weighted value with one asset', () => {
        const player = makePlayer({
            assets: [ASSET_A], // passive=6, expenses=30+2=32
            savings: 25,       // 25/50 = 0.5
            quizCorrect: 1,
            quizTotal: 2,      // 50%, so quizScore = 1
        });
        const pct = getFreedomPercent(player);
        // incomeRatio = 6/32 = 0.1875
        // assetsRatio = 1/3 = 0.333
        // savingsRatio = 25/50 = 0.5
        // debtScore=1, quizScore=1 → knowledge=1
        // 0.1875*0.4 + 0.333*0.25 + 0.5*0.20 + 1*0.15
        // = 0.075 + 0.083 + 0.1 + 0.15 = 0.408 → 41%
        expect(pct).toBe(41);
    });

    it('should return 100 when fully meeting all conditions with surplus', () => {
        const player = makePlayer({
            baseExpenses: 5,
            assets: [ASSET_A, ASSET_B, ASSET_C, ASSET_BIG],
            savings: 100,
            quizCorrect: 5,
            quizTotal: 5,
            // passive=6+7+9+14=36, expenses=5+2+2+3+5=17, ratio=36/17>1→clamped 1
            // assets=4/3>1→clamped 1, savings=100/50>1→clamped 1
            // knowledge=(1+1)/2=1, weighted=1*0.4+1*0.25+1*0.2+1*0.15=1 → 100%
        });
        expect(getFreedomPercent(player)).toBe(100);
    });

    it('should include loanPayment in expenses', () => {
        const player = makePlayer({
            assets: [ASSET_A],
            loanPayment: 10,
            // passive=6, expenses=30+2+10=42 → incomeRatio = 6/42 ≈ 0.143
        });
        const pct = getFreedomPercent(player);
        // income: 0.143*0.4=0.057, assets: 0.333*0.25=0.083
        // savings: 0*0.20=0, knowledge: (1+0)/2*0.15=0.075
        // total ≈ 0.215 → 22%
        expect(pct).toBe(22);
    });
});
