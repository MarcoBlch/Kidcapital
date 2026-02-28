// ============================================
// KidCapital — Achievement Definitions
// ============================================

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    /** XP reward when unlocked */
    xp: number;
    /** Category for grouping */
    category: 'investor' | 'saver' | 'scholar' | 'discipline' | 'mastery';
    /** Check function — receives player stats */
    check: (stats: AchievementStats) => boolean;
}

export interface AchievementStats {
    totalGamesPlayed: number;
    totalGamesWon: number;
    totalAssetsEverBought: number;
    maxAssetsInOneGame: number;
    totalTemptationsSkipped: number;
    temptationsSkippedStreak: number;  // consecutive in one game
    totalQuizCorrect: number;
    totalQuizTotal: number;
    quizCorrectStreak: number;  // consecutive in one game
    bestWinMonths: number;  // fewest months to win
    totalSavingsEverReached: number;  // highest savings in any game
    totalDebtPaidOff: number;  // number of times debt went from >0 to 0
    fastestWin: number | null;  // fewest months, null if never won
}

export const INITIAL_STATS: AchievementStats = {
    totalGamesPlayed: 0,
    totalGamesWon: 0,
    totalAssetsEverBought: 0,
    maxAssetsInOneGame: 0,
    totalTemptationsSkipped: 0,
    temptationsSkippedStreak: 0,
    totalQuizCorrect: 0,
    totalQuizTotal: 0,
    quizCorrectStreak: 0,
    bestWinMonths: 999,
    totalSavingsEverReached: 0,
    totalDebtPaidOff: 0,
    fastestWin: null,
};

// ============================================
// Achievement Definitions
// ============================================

export const ACHIEVEMENTS: Achievement[] = [
    // --- Investor ---
    {
        id: 'first_business',
        title: 'First Business!',
        description: 'Buy your very first asset',
        icon: '🏪',
        xp: 20,
        category: 'investor',
        check: s => s.totalAssetsEverBought >= 1,
    },
    {
        id: 'diversified',
        title: 'Diversified!',
        description: 'Own 3 businesses in one game',
        icon: '📊',
        xp: 50,
        category: 'investor',
        check: s => s.maxAssetsInOneGame >= 3,
    },
    {
        id: 'empire_builder',
        title: 'Empire Builder',
        description: 'Buy 10 businesses total across all games',
        icon: '🏗️',
        xp: 100,
        category: 'investor',
        check: s => s.totalAssetsEverBought >= 10,
    },

    // --- Saver ---
    {
        id: 'piggy_bank',
        title: 'Piggy Bank',
        description: 'Save $50 in one game',
        icon: '🐷',
        xp: 25,
        category: 'saver',
        check: s => s.totalSavingsEverReached >= 50,
    },
    {
        id: 'emergency_fund',
        title: 'Emergency Fund',
        description: 'Save $100 in one game',
        icon: '🏦',
        xp: 50,
        category: 'saver',
        check: s => s.totalSavingsEverReached >= 100,
    },
    {
        id: 'debt_destroyer',
        title: 'Debt Destroyer',
        description: 'Pay off all your debt',
        icon: '💪',
        xp: 40,
        category: 'saver',
        check: s => s.totalDebtPaidOff >= 1,
    },

    // --- Scholar ---
    {
        id: 'quiz_starter',
        title: 'Quiz Starter',
        description: 'Answer your first quiz correctly',
        icon: '🧠',
        xp: 15,
        category: 'scholar',
        check: s => s.totalQuizCorrect >= 1,
    },
    {
        id: 'quiz_whiz',
        title: 'Quiz Whiz!',
        description: 'Answer 5 quizzes correctly in a row',
        icon: '🎓',
        xp: 75,
        category: 'scholar',
        check: s => s.quizCorrectStreak >= 5,
    },
    {
        id: 'financial_expert',
        title: 'Financial Expert',
        description: 'Answer 20 quizzes correctly total',
        icon: '📚',
        xp: 100,
        category: 'scholar',
        check: s => s.totalQuizCorrect >= 20,
    },

    // --- Discipline ---
    {
        id: 'no_impulse',
        title: 'No Impulse!',
        description: 'Skip 3 temptations in a row',
        icon: '🛑',
        xp: 40,
        category: 'discipline',
        check: s => s.temptationsSkippedStreak >= 3,
    },
    {
        id: 'self_control_master',
        title: 'Self-Control Master',
        description: 'Skip 10 temptations total',
        icon: '🧘',
        xp: 75,
        category: 'discipline',
        check: s => s.totalTemptationsSkipped >= 10,
    },

    // --- Mastery ---
    {
        id: 'first_win',
        title: 'Financial Freedom!',
        description: 'Win your first game',
        icon: '🏆',
        xp: 100,
        category: 'mastery',
        check: s => s.totalGamesWon >= 1,
    },
    {
        id: 'speed_runner',
        title: 'Speed Runner',
        description: 'Win in 12 months or less',
        icon: '⚡',
        xp: 150,
        category: 'mastery',
        check: s => s.fastestWin !== null && s.fastestWin <= 12,
    },
    {
        id: 'veteran',
        title: 'Veteran Player',
        description: 'Play 5 games',
        icon: '🎮',
        xp: 50,
        category: 'mastery',
        check: s => s.totalGamesPlayed >= 5,
    },
    {
        id: 'triple_crown',
        title: 'Triple Crown',
        description: 'Win 3 games',
        icon: '👑',
        xp: 200,
        category: 'mastery',
        check: s => s.totalGamesWon >= 3,
    },
];

// ============================================
// XP Level System
// ============================================

export interface Level {
    level: number;
    title: string;
    icon: string;
    xpRequired: number;
}

export const LEVELS: Level[] = [
    { level: 1, title: 'Piggy Banker', icon: '💰', xpRequired: 0 },
    { level: 2, title: 'Smart Saver', icon: '📊', xpRequired: 100 },
    { level: 3, title: 'Business Kid', icon: '🏪', xpRequired: 300 },
    { level: 4, title: 'Young Investor', icon: '📈', xpRequired: 600 },
    { level: 5, title: 'Money Shark', icon: '🦈', xpRequired: 1000 },
    { level: 6, title: 'Freedom Master', icon: '👑', xpRequired: 2000 },
];

export function getLevelForXP(xp: number): Level {
    let result = LEVELS[0];
    for (const level of LEVELS) {
        if (xp >= level.xpRequired) {
            result = level;
        }
    }
    return result;
}

export function getXPToNextLevel(xp: number): { current: number; next: number; progress: number } {
    const currentLevel = getLevelForXP(xp);
    const nextLevel = LEVELS.find(l => l.xpRequired > xp);
    if (!nextLevel) {
        return { current: currentLevel.xpRequired, next: currentLevel.xpRequired, progress: 100 };
    }
    const range = nextLevel.xpRequired - currentLevel.xpRequired;
    const progress = Math.round(((xp - currentLevel.xpRequired) / range) * 100);
    return { current: currentLevel.xpRequired, next: nextLevel.xpRequired, progress };
}
