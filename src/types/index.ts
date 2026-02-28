// ============================================
// KidCapital — TypeScript Type Definitions
// ============================================

// --- Space Types ---

export type SpaceType =
    | 'start'
    | 'invest'
    | 'payday'
    | 'life'
    | 'hustle'
    | 'temptation'
    | 'challenge'
    | 'bank';

export interface Space {
    index: number;
    type: SpaceType;
    icon: string;
    label: string;
    color: string;
}

// --- Assets (Businesses) ---

export type AssetTier = 1 | 2 | 3;

export interface Asset {
    id: string;
    name: string;
    cost: number;
    income: number;
    maint: number;
    icon: string;
    tier: AssetTier;
}

// --- Life Events ---

export interface LifeEvent {
    id: string;
    title: string;
    text: string;
    amount: number; // positive = good, negative = bad
    mood: string;
}

// --- Hustles (Side Jobs) ---

export interface Hustle {
    id: string;
    title: string;
    text: string;
    amount: number;
    icon: string;
}

// --- Temptations ---

export interface Temptation {
    id: string;
    name: string;
    cost: number;
    icon: string;
    text: string;
}

// --- Financial Quizzes ---

export interface Challenge {
    id: string;
    question: string;
    options: [string, string, string, string];
    correctIndex: number;
    pennyExplanation: string;
    reward: number;
    difficulty: Difficulty | 'all';
}

// --- Bot Personality ---

export type BotPersonality = 'conservative' | 'aggressive' | 'balanced';

export interface BotProfile {
    id: string;
    name: string;
    avatar: string;
    personality: BotPersonality;
    description: string;
}

// --- Player ---

export interface Player {
    id: number;
    name: string;
    avatar: string;
    isHuman: boolean;
    personality?: BotPersonality;

    // Financial State
    cash: number;
    savings: number;
    salary: number;
    baseExpenses: number;
    debt: number;
    loanPayment: number;
    assets: Asset[];

    // Game State
    position: number;
    wantsSpent: number;
    wantsSkipped: number;
    quizCorrect: number;
    quizTotal: number;
}

// --- Turn System ---

export type TurnPhase =
    | 'idle'
    | 'rolling'
    | 'moving'
    | 'penny_speak'
    | 'modal_open'
    | 'action_done'
    | 'turn_end'
    | 'bot_acting';

// --- Difficulty ---

export type Difficulty = '8-10' | '11-14' | '15-18';

export interface DifficultyConfig {
    cash: number;
    salary: number;
    baseExpenses: number;
}

// --- Game State ---

export interface GameState {
    players: Player[];
    currentPlayerIndex: number;
    month: number;
    turnPhase: TurnPhase;
    diceResult: number | null;
    isGameOver: boolean;
    winnerId: number | null;
    difficulty: Difficulty;
    isPremium: boolean;
    soundEnabled: boolean;
    pennyMuted: boolean;
    dailyBonus: number;
}

// --- Penny Messages ---

export type PennyTrigger =
    | 'game_start'
    | 'first_roll'
    | 'land_invest'
    | 'first_asset_buy'
    | 'buy_with_loan'
    | 'cant_buy_debt'
    | 'payday_positive'
    | 'payday_negative'
    | 'temptation_skipped'
    | 'temptation_bought'
    | 'hustle'
    | 'quiz_correct'
    | 'quiz_wrong'
    | 'bank_deposit'
    | 'low_cash'
    | 'near_freedom'
    | 'win'
    | 'life_event_good'
    | 'life_event_bad'
    | 'generic';

export interface PennyMessage {
    trigger: PennyTrigger;
    messages: string[];
}

// --- Payday Report ---

export interface PaydayReport {
    salary: number;
    passiveIncome: number;
    savingsInterest: number;
    totalIncome: number;
    baseExpenses: number;
    maintenanceCosts: number;
    loanPayment: number;
    totalExpenses: number;
    net: number;
    newCash: number;
    newDebt: number;
    debtPaid: number;
}
