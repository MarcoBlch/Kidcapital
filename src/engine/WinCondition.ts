import type { Player } from '../types';
import { MIN_ASSETS_TO_WIN, MIN_SAVINGS_TO_WIN, QUIZ_ACCURACY_TO_WIN } from '../utils/constants';

// ============================================
// KidCapital — Win Condition: Financial Freedom
// Harder to win — requires real financial discipline
// ============================================

/**
 * Check if a player has achieved Financial Freedom.
 *
 * ALL conditions must be true:
 * 1. passive income >= total expenses
 * 2. debt == 0
 * 3. owns >= 3 assets (diversification)
 * 4. savings >= $50 (emergency fund)
 * 5. quiz accuracy >= 50% (financial knowledge)
 */
export function checkFreedom(player: Player): boolean {
    // Must be debt-free
    if (player.debt !== 0) return false;

    // Must own enough assets (diversification lesson)
    if (player.assets.length < MIN_ASSETS_TO_WIN) return false;

    // Must have emergency fund (savings lesson)
    if (player.savings < MIN_SAVINGS_TO_WIN) return false;

    // Must have financial knowledge (quiz lesson)
    if (player.quizTotal > 0) {
        const accuracy = player.quizCorrect / player.quizTotal;
        if (accuracy < QUIZ_ACCURACY_TO_WIN) return false;
    }

    // Passive income must cover all expenses
    const passiveIncome = player.assets.reduce((sum, a) => sum + a.income, 0);
    const totalExpenses =
        player.baseExpenses +
        player.assets.reduce((sum, a) => sum + a.maint, 0) +
        player.loanPayment;

    return passiveIncome >= totalExpenses;
}

/**
 * Get the Freedom Progress percentage (0–100, clamped).
 * Weighted across all 4 win dimensions.
 */
export function getFreedomPercent(player: Player): number {
    // 40% weight: passive income vs expenses
    const passiveIncome = player.assets.reduce((sum, a) => sum + a.income, 0);
    const totalExpenses =
        player.baseExpenses +
        player.assets.reduce((sum, a) => sum + a.maint, 0) +
        player.loanPayment;

    const incomeRatio = totalExpenses > 0
        ? Math.min(1, passiveIncome / totalExpenses)
        : 0;

    // 25% weight: assets count
    const assetsRatio = Math.min(1, player.assets.length / MIN_ASSETS_TO_WIN);

    // 20% weight: savings
    const savingsRatio = Math.min(1, player.savings / MIN_SAVINGS_TO_WIN);

    // 15% weight: debt-free + quiz
    const debtScore = player.debt === 0 ? 1 : 0;
    const quizScore = player.quizTotal > 0
        ? Math.min(1, (player.quizCorrect / player.quizTotal) / QUIZ_ACCURACY_TO_WIN)
        : 0;
    const knowledgeRatio = (debtScore + quizScore) / 2;

    const weighted =
        incomeRatio * 0.40 +
        assetsRatio * 0.25 +
        savingsRatio * 0.20 +
        knowledgeRatio * 0.15;

    return Math.round(weighted * 100);
}
