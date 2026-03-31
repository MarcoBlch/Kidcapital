import { create } from 'zustand';
import type { SpaceType } from '../types';
import { audioManager } from '../audio/AudioManager';

export type Screen = 'splash' | 'setup' | 'game' | 'end' | 'multiplayer' | 'multiplayer_lobby';

export type ModalType =
    | 'invest'
    | 'payday'
    | 'life'
    | 'hustle'
    | 'temptation'
    | 'challenge'
    | 'bank'
    | 'portfolio'
    | 'leaderboard'
    | 'paywall'
    | null;

interface CoinAnim {
    amount: number;
    id: number;
}

interface UIStore {
    // Premium Lock
    isPremium: boolean;
    setPremium: (status: boolean) => void;

    // Screen
    currentScreen: Screen;
    setScreen: (screen: Screen) => void;

    // Modal
    activeModal: ModalType;
    modalSpaceColor: string;
    modalActionConfirmed: boolean;
    showModal: (type: SpaceType) => void;
    closeModal: () => void;
    confirmModalAction: () => void;

    // Penny
    pennyMessage: string | null;
    pennyVisible: boolean;
    showPenny: (message: string) => void;
    dismissPenny: () => void;

    // Coin Animation
    coinAnimations: CoinAnim[];
    showCoin: (amount: number) => void;
    removeCoin: (id: number) => void;

    // Turn log (visible bot actions)
    turnLog: string[];
    addLog: (message: string) => void;
    clearLog: () => void;

    // Multiplayer lobby routing
    multiplayerLobbyCode: string | null;
    setMultiplayerLobbyCode: (code: string | null) => void;
}

const SPACE_TYPE_TO_MODAL: Record<string, ModalType> = {
    invest: 'invest',
    payday: 'payday',
    life: 'life',
    hustle: 'hustle',
    temptation: 'temptation',
    challenge: 'challenge',
    bank: 'bank',
    portfolio: 'portfolio',
    leaderboard: 'leaderboard',
    paywall: 'paywall',
    start: null,
};

const SPACE_TYPE_TO_COLOR: Record<string, string> = {
    invest: '#10b981',
    payday: '#f59e0b',
    life: '#f43f5e',
    hustle: '#8b5cf6',
    temptation: '#ec4899',
    challenge: '#06b6d4',
    bank: '#6366f1',
    start: '#f59e0b',
};

let coinIdCounter = 0;

export const useUIStore = create<UIStore>((set) => ({
    // Premium Lock
    isPremium: false,
    setPremium: (status) => set({ isPremium: status }),

    // Screen
    currentScreen: 'splash',
    setScreen: (screen) => set({ currentScreen: screen }),

    // Modal
    activeModal: null,
    modalSpaceColor: '#f59e0b',
    modalActionConfirmed: false,
    showModal: (spaceType) =>
        set({
            activeModal: SPACE_TYPE_TO_MODAL[spaceType] ?? null,
            modalSpaceColor: SPACE_TYPE_TO_COLOR[spaceType] ?? '#f59e0b',
            modalActionConfirmed: false,
        }),
    closeModal: () => set({ activeModal: null }),
    confirmModalAction: () => set({ modalActionConfirmed: true }),

    // Penny
    pennyMessage: null,
    pennyVisible: false,
    showPenny: (message) => {
        audioManager.play('oink');
        set({ pennyMessage: message, pennyVisible: true });
    },
    dismissPenny: () => set({ pennyVisible: false, pennyMessage: null }),

    // Coin Animation
    coinAnimations: [],
    showCoin: (amount) => {
        audioManager.play(amount >= 0 ? 'coin_gain' : 'coin_loss');
        const id = ++coinIdCounter;
        set(state => ({
            coinAnimations: [...state.coinAnimations, { amount, id }],
        }));
    },
    removeCoin: (id) =>
        set(state => ({
            coinAnimations: state.coinAnimations.filter(c => c.id !== id),
        })),

    // Turn log
    turnLog: [],
    addLog: (message) =>
        set(state => ({ turnLog: [...state.turnLog.slice(-9), message] })),
    clearLog: () => set({ turnLog: [] }),

    // Multiplayer lobby routing
    multiplayerLobbyCode: null,
    setMultiplayerLobbyCode: (code) => set({ multiplayerLobbyCode: code }),
}));
