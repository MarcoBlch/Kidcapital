import { create } from 'zustand';
import { useGameStore } from './gameStore';

// ============================================
// Tutorial Steps — "Penny Teaches You" 🐷
// ============================================

export interface TutorialStep {
    id: string;
    title: string;
    message: string;
    /** CSS selector to highlight (spotlight). Null = no spotlight, center overlay */
    spotlightSelector: string | null;
    /** Where to place the bubble relative to spotlight */
    bubblePosition: 'above' | 'below' | 'center';
    /** If set, tutorial auto-advances when this happens */
    waitFor: 'tap' | 'roll' | 'modal_close' | 'next_turn';
}

export const TUTORIAL_STEPS: TutorialStep[] = [
    {
        id: 'welcome',
        title: '🐷 Hi! I\'m Penny!',
        message: 'I\'m your money coach! I\'ll teach you how to become financially free. Let\'s play!',
        spotlightSelector: null,
        bubblePosition: 'center',
        waitFor: 'tap',
    },
    {
        id: 'goal',
        title: '🎯 Your Goal',
        message: 'Make your money work FOR you! Buy businesses that earn income every month. When your passive income covers your expenses, you win!',
        spotlightSelector: null,
        bubblePosition: 'center',
        waitFor: 'tap',
    },
    {
        id: 'win_conditions',
        title: '🏆 How to Win',
        message: 'You need ALL of these:\n🏪 Own 3+ businesses\n🏦 Save $50+\n🧠 Quiz accuracy 50%+\n💰 No debt\n📈 Passive income ≥ expenses',
        spotlightSelector: null,
        bubblePosition: 'center',
        waitFor: 'tap',
    },
    {
        id: 'roll_intro',
        title: '🎲 Let\'s Roll!',
        message: 'Tap the golden "Roll!" button to roll the dice and move around the board!',
        spotlightSelector: '[data-tutorial="roll-btn"]',
        bubblePosition: 'above',
        waitFor: 'roll',
    },
    {
        id: 'board_explain',
        title: '🗺️ The Board',
        message: 'Each space has a different action: 🏪 Buy businesses, 💰 Collect income, 🧠 Answer quizzes, and more! Watch where you land!',
        spotlightSelector: null,
        bubblePosition: 'center',
        waitFor: 'tap',
    },
    {
        id: 'modal_explain',
        title: '📋 Make Choices!',
        message: 'When you land on a space, a card pops up. Read carefully and decide! Every choice affects your money. Close the card to continue.',
        spotlightSelector: null,
        bubblePosition: 'center',
        waitFor: 'modal_close',
    },
    {
        id: 'progress_bar',
        title: '📊 Track Your Progress',
        message: 'See those icons at the top? 🏪🏦🧠💰 — they show what you still need to win. Fill them all up!',
        spotlightSelector: null,
        bubblePosition: 'center',
        waitFor: 'tap',
    },
    {
        id: 'penny_tips',
        title: '🐷 Look for my tips!',
        message: 'I\'ll pop up during the game with money tips. Tap me to dismiss, but try to read them — they\'ll help you win! Good luck! 🍀',
        spotlightSelector: null,
        bubblePosition: 'center',
        waitFor: 'tap',
    },
];

// ============================================
// Tutorial Store
// ============================================

interface TutorialStore {
    /** Whether the tutorial has been completed (persisted) */
    isCompleted: boolean;
    /** Whether the tutorial is currently active */
    isActive: boolean;
    /** Current step index */
    currentStepIndex: number;
    /** Get current step */
    getCurrentStep: () => TutorialStep | null;
    /** Start the tutorial */
    startTutorial: () => void;
    /** Advance to next step */
    nextStep: () => void;
    /** Skip / complete the tutorial */
    completeTutorial: () => void;
    /** Signal that a game event happened (roll, modal_close, etc.) */
    signalEvent: (event: TutorialStep['waitFor']) => void;
}

const STORAGE_KEY = 'kidcapital_tutorial_done';

export const useTutorialStore = create<TutorialStore>((set, get) => ({
    isCompleted: localStorage.getItem(STORAGE_KEY) === 'true',
    isActive: false,
    currentStepIndex: 0,

    getCurrentStep: () => {
        const { isActive, currentStepIndex } = get();
        if (!isActive) return null;
        return TUTORIAL_STEPS[currentStepIndex] ?? null;
    },

    startTutorial: () => {
        set({ isActive: true, currentStepIndex: 0 });
    },

    nextStep: () => {
        const { currentStepIndex } = get();
        const nextIndex = currentStepIndex + 1;
        if (nextIndex >= TUTORIAL_STEPS.length) {
            get().completeTutorial();
        } else {
            set({ currentStepIndex: nextIndex });
        }
    },

    completeTutorial: () => {
        localStorage.setItem(STORAGE_KEY, 'true');
        set({ isActive: false, isCompleted: true });

        // Restart the game automatically so the user starts fresh after the tutorial
        const restartGame = useGameStore.getState().restartCurrentGame;
        if (restartGame) {
            restartGame();
        }
    },

    signalEvent: (event) => {
        const step = get().getCurrentStep();
        if (step && step.waitFor === event) {
            get().nextStep();
        }
    },
}));
