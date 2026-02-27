import type { DifficultyConfig, AssetTier } from '../types';

// ============================================
// KidCapital — Constants & Configuration
// ============================================

// --- Board ---
export const BOARD_SIZE = 20;
export const GO_BONUS = 10;

// --- Financial Rates ---
export const SAVINGS_INTEREST_RATE = 0.05;
export const LOAN_INTEREST_RATE = 0.15;   // harder loans
export const LOAN_MONTHLY_RATE = 0.15;    // slower repayment = longer burden
export const DOWN_PAYMENT_RATE = 0.40;    // need more upfront

// --- Animation Timing (milliseconds) ---
// Slowed down so kids can read and understand
export const TIMING = {
    DICE_ROLL: 1800,
    DICE_RESULT_DISPLAY: 1500,
    TOKEN_MOVE_PER_SPACE: 350,
    SPACE_ARRIVAL_PAUSE: 1200,
    BOTTOM_SHEET_ENTRANCE: 400,
    COIN_ANIMATION: 1200,
    POST_ACTION_PAUSE: 1800,
    PENNY_DELAY_AFTER_ACTION: 800,
    PENNY_BUBBLE_DURATION: 7000,
    PENNY_TYPEWRITER_CPS: 20,    // slower typing = easier to read
    BOT_TURN_TOTAL: 5000,
    BOT_STEP_PAUSE: 1200,        // pause between bot actions
} as const;

// --- Difficulty Presets ---
export const DIFFICULTY_CONFIGS: Record<string, DifficultyConfig> = {
    standard: {
        cash: 100,          // was 200
        salary: 35,         // was 50
        baseExpenses: 30,   // was 20
        availableTiers: [1, 2] as AssetTier[],
    },
    medium: {
        cash: 80,
        salary: 30,
        baseExpenses: 35,
        availableTiers: [1, 2, 3] as AssetTier[],
    },
    hard: {
        cash: 60,
        salary: 25,
        baseExpenses: 40,
        availableTiers: [1, 2, 3] as AssetTier[],
    },
};

// --- Premium ---
export const MAX_AI_CALLS_PER_GAME = 3;
export const MAX_FREE_BOTS = 1;
export const MAX_PREMIUM_BOTS = 3;
export const FREE_QUIZ_COUNT = 5;

// --- Player ---
export const MAX_PLAYERS = 4; // 1 human + 3 bots
export const MAX_NAME_LENGTH = 14;

// --- Win condition thresholds ---
export const MIN_ASSETS_TO_WIN = 3;        // was 2
export const MIN_SAVINGS_TO_WIN = 50;      // need emergency fund
export const QUIZ_ACCURACY_TO_WIN = 0.5;   // must answer >= 50% correctly

// --- Available Avatars ---
export const PLAYER_AVATARS = [
    '😎', '🤠', '🧑‍🚀', '🦸', '🧙', '🎤', '🏄', '🤓',
    '🥷', '🧑‍🎨', '🧑‍🔬', '🦊',
] as const;
