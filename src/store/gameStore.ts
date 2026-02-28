import { create } from 'zustand';
import type { Player, Asset, TurnPhase, Difficulty, GameState } from '../types';
import {
    calculatePayday,
    applyPayday,
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
} from '../engine/FinancialEngine';
import { checkFreedom } from '../engine/WinCondition';
import type { BotPersonality } from '../types';

interface GameStore extends GameState {
    turnLocked: boolean;

    // --- Init ---
    initGame: (
        playerName: string,
        playerAvatar: string,
        bots: { name: string; avatar: string; personality: BotPersonality }[],
        difficulty: Difficulty,
        dailyBonus?: number,
    ) => void;
    restartCurrentGame: () => void;
    resetGame: () => void;

    // --- Turn Flow ---
    setTurnPhase: (phase: TurnPhase) => void;
    setDiceResult: (result: number) => void;
    setTurnLocked: (locked: boolean) => void;

    // --- Movement ---
    movePlayerTo: (playerId: number, newPosition: number, passedGo: boolean) => void;

    // --- Financial Actions ---
    playerBuyAssetCash: (playerId: number, asset: Asset) => boolean;
    playerBuyAssetLoan: (playerId: number, asset: Asset) => boolean;
    playerDeposit: (playerId: number, amount: number) => boolean;
    playerWithdraw: (playerId: number, amount: number) => boolean;
    playerApplyLifeEvent: (playerId: number, amount: number) => void;
    playerApplyHustle: (playerId: number, amount: number) => void;
    playerBuyTemptation: (playerId: number, cost: number) => boolean;
    playerSkipTemptation: (playerId: number) => void;
    playerPayday: (playerId: number) => ReturnType<typeof calculatePayday>;
    playerQuizResult: (playerId: number, correct: boolean, reward: number) => void;

    // --- Turn Management ---
    advanceTurn: () => void;
    checkWinCondition: () => number | null; // returns winner ID or null

    // --- Helpers ---
    getCurrentPlayer: () => Player;
    getPlayer: (id: number) => Player;
    updatePlayer: (id: number, updates: Partial<Player>) => void;
}

const initialState: GameState = {
    players: [],
    currentPlayerIndex: 0,
    month: 1,
    turnPhase: 'idle',
    diceResult: null,
    isGameOver: false,
    winnerId: null,
    difficulty: '11-14',
    isPremium: false,
    soundEnabled: true,
    pennyMuted: false,
    dailyBonus: 0,
};

export const useGameStore = create<GameStore>((set, get) => ({
    ...initialState,
    turnLocked: false,

    // --- Init ---
    initGame: (playerName, playerAvatar, bots, difficulty, dailyBonus = 0) => {
        const players: Player[] = [
            // Human player gets the daily bonus
            createDefaultPlayer(0, playerName, playerAvatar, true, difficulty, undefined, dailyBonus),
            // Bots do not get the daily bonus
            ...bots.map((bot, i) =>
                createDefaultPlayer(i + 1, bot.name, bot.avatar, false, difficulty, bot.personality),
            ),
        ];
        set({
            ...initialState,
            players,
            difficulty,
            dailyBonus: dailyBonus ?? 0,
            turnPhase: 'idle',
        });
    },

    restartCurrentGame: () => {
        const state = get();
        const human = state.players.find(p => p.isHuman);
        if (!human) return;

        const bots = state.players.filter(p => !p.isHuman).map(b => ({
            name: b.name,
            avatar: b.avatar,
            personality: b.personality as BotPersonality,
        }));

        get().initGame(human.name, human.avatar, bots, state.difficulty, state.dailyBonus);
    },

    resetGame: () => set(initialState),

    // --- Turn Flow ---
    setTurnPhase: (phase) => set({ turnPhase: phase }),
    setDiceResult: (result) => set({ diceResult: result }),
    setTurnLocked: (locked) => set({ turnLocked: locked }),

    // --- Movement ---
    movePlayerTo: (playerId, newPosition, passedGo) => {
        const state = get();
        const players = state.players.map(p => {
            if (p.id !== playerId) return p;
            let updated = { ...p, position: newPosition };
            if (passedGo) {
                updated = applyGoBonus(updated);
            }
            return updated;
        });
        set({
            players,
            month: passedGo && playerId === 0 ? state.month + 1 : state.month,
        });
    },

    // --- Financial Actions ---
    playerBuyAssetCash: (playerId, asset) => {
        const player = get().getPlayer(playerId);
        const updated = buyAssetCash(player, asset);
        if (!updated) return false;
        get().updatePlayer(playerId, updated);
        return true;
    },

    playerBuyAssetLoan: (playerId, asset) => {
        const player = get().getPlayer(playerId);
        const updated = buyAssetLoan(player, asset);
        if (!updated) return false;
        get().updatePlayer(playerId, updated);
        return true;
    },

    playerDeposit: (playerId, amount) => {
        const player = get().getPlayer(playerId);
        const updated = deposit(player, amount);
        if (!updated) return false;
        get().updatePlayer(playerId, updated);
        return true;
    },

    playerWithdraw: (playerId, amount) => {
        const player = get().getPlayer(playerId);
        const updated = withdraw(player, amount);
        if (!updated) return false;
        get().updatePlayer(playerId, updated);
        return true;
    },

    playerApplyLifeEvent: (playerId, amount) => {
        const player = get().getPlayer(playerId);
        const updated = applyLifeEvent(player, amount);
        get().updatePlayer(playerId, updated);
    },

    playerApplyHustle: (playerId, amount) => {
        const player = get().getPlayer(playerId);
        const updated = applyHustle(player, amount);
        get().updatePlayer(playerId, updated);
    },

    playerBuyTemptation: (playerId, cost) => {
        const player = get().getPlayer(playerId);
        const updated = buyTemptation(player, cost);
        if (!updated) return false;
        get().updatePlayer(playerId, updated);
        return true;
    },

    playerSkipTemptation: (playerId) => {
        const player = get().getPlayer(playerId);
        const updated = skipTemptation(player);
        get().updatePlayer(playerId, updated);
    },

    playerPayday: (playerId) => {
        const player = get().getPlayer(playerId);
        const report = calculatePayday(player);
        const updated = applyPayday(player, report);
        get().updatePlayer(playerId, updated);
        return report;
    },

    playerQuizResult: (playerId, correct, reward) => {
        const player = get().getPlayer(playerId);
        const updates: Partial<Player> = {
            quizTotal: player.quizTotal + 1,
        };
        if (correct) {
            updates.quizCorrect = player.quizCorrect + 1;
            updates.cash = player.cash + reward;
        }
        get().updatePlayer(playerId, updates);
    },

    // --- Turn Management ---
    advanceTurn: () => {
        const state = get();
        const nextIndex = (state.currentPlayerIndex + 1) % state.players.length;
        set({
            currentPlayerIndex: nextIndex,
            turnPhase: 'idle',
            diceResult: null,
        });
    },

    checkWinCondition: () => {
        const state = get();
        for (const player of state.players) {
            if (checkFreedom(player)) {
                set({ isGameOver: true, winnerId: player.id });
                return player.id;
            }
        }
        return null;
    },

    // --- Helpers ---
    getCurrentPlayer: () => {
        const state = get();
        return state.players[state.currentPlayerIndex];
    },

    getPlayer: (id) => {
        const state = get();
        return state.players.find(p => p.id === id)!;
    },

    updatePlayer: (id, updates) => {
        set(state => ({
            players: state.players.map(p =>
                p.id === id ? { ...p, ...updates } : p,
            ),
        }));
    },
}));
