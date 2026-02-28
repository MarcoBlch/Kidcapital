import { create } from 'zustand';
import {
    ACHIEVEMENTS,
    INITIAL_STATS,
    getLevelForXP,
    type Achievement,
    type AchievementStats,
} from '../data/achievements';

// ============================================
// Achievement Store — persisted in localStorage
// ============================================

interface AchievementNotification {
    achievement: Achievement;
    id: number;
}

interface AchievementStore {
    /** Persistent stats across games */
    stats: AchievementStats;
    /** IDs of unlocked achievements */
    unlockedIds: Set<string>;
    /** Current total XP */
    xp: number;
    /** Active toast notifications */
    notifications: AchievementNotification[];

    // --- Session streaks (reset per game) ---
    sessionQuizStreak: number;
    sessionTemptationStreak: number;

    /** Update stats and check for new achievements */
    updateStat: (key: keyof AchievementStats, value: number) => void;
    /** Increment a stat by a delta */
    incrementStat: (key: keyof AchievementStats, delta?: number) => void;
    /** Set max of stat (only updates if higher) */
    maxStat: (key: keyof AchievementStats, value: number) => void;
    /** Record end of game */
    recordGameEnd: (won: boolean, months: number) => void;
    /** Reset session streaks (new game) */
    resetSession: () => void;
    /** Increment quiz streak */
    recordQuizResult: (correct: boolean) => void;
    /** Increment temptation streak */
    recordTemptationSkip: () => void;
    /** Reset temptation streak (bought one) */
    resetTemptationStreak: () => void;
    /** Dismiss a notification */
    dismissNotification: (id: number) => void;
}

const STORAGE_KEY = 'kidcapital_achievements';

function loadFromStorage(): { stats: AchievementStats; unlockedIds: string[]; xp: number } {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const data = JSON.parse(raw);
            return {
                stats: { ...INITIAL_STATS, ...data.stats },
                unlockedIds: data.unlockedIds ?? [],
                xp: data.xp ?? 0,
            };
        }
    } catch { /* ignore */ }
    return { stats: { ...INITIAL_STATS }, unlockedIds: [], xp: 0 };
}

function saveToStorage(stats: AchievementStats, unlockedIds: Set<string>, xp: number) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        stats,
        unlockedIds: Array.from(unlockedIds),
        xp,
    }));
}

let notifIdCounter = 0;

function checkNewAchievements(
    stats: AchievementStats,
    unlockedIds: Set<string>,
): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    for (const ach of ACHIEVEMENTS) {
        if (!unlockedIds.has(ach.id) && ach.check(stats)) {
            newlyUnlocked.push(ach);
        }
    }
    return newlyUnlocked;
}

export const useAchievementStore = create<AchievementStore>((set, get) => {
    const loaded = loadFromStorage();

    return {
        stats: loaded.stats,
        unlockedIds: new Set(loaded.unlockedIds),
        xp: loaded.xp,
        notifications: [],
        sessionQuizStreak: 0,
        sessionTemptationStreak: 0,

        updateStat: (key, value) => {
            const { stats, unlockedIds, xp } = get();
            const newStats = { ...stats, [key]: value };
            const newAchievements = checkNewAchievements(newStats, unlockedIds);
            const newUnlocked = new Set(unlockedIds);
            let newXP = xp;
            const newNotifs: AchievementNotification[] = [];

            for (const ach of newAchievements) {
                newUnlocked.add(ach.id);
                newXP += ach.xp;
                newNotifs.push({ achievement: ach, id: ++notifIdCounter });
            }

            saveToStorage(newStats, newUnlocked, newXP);
            set(state => ({
                stats: newStats,
                unlockedIds: newUnlocked,
                xp: newXP,
                notifications: [...state.notifications, ...newNotifs],
            }));
        },

        incrementStat: (key, delta = 1) => {
            const current = get().stats[key];
            if (typeof current === 'number') {
                get().updateStat(key, (current as number) + delta);
            }
        },

        maxStat: (key, value) => {
            const current = get().stats[key];
            if (typeof current === 'number' && value > (current as number)) {
                get().updateStat(key, value);
            }
        },

        recordGameEnd: (won, months) => {
            const { stats } = get();
            get().updateStat('totalGamesPlayed', stats.totalGamesPlayed + 1);
            if (won) {
                get().updateStat('totalGamesWon', stats.totalGamesWon + 1);
                const fastest = stats.fastestWin === null ? months : Math.min(stats.fastestWin, months);
                get().updateStat('fastestWin', fastest);
                if (months < stats.bestWinMonths) {
                    get().updateStat('bestWinMonths', months);
                }
            }
        },

        resetSession: () => {
            set({ sessionQuizStreak: 0, sessionTemptationStreak: 0 });
        },

        recordQuizResult: (correct) => {
            if (correct) {
                const newStreak = get().sessionQuizStreak + 1;
                set({ sessionQuizStreak: newStreak });
                get().incrementStat('totalQuizCorrect');
                get().incrementStat('totalQuizTotal');
                get().maxStat('quizCorrectStreak', newStreak);
            } else {
                set({ sessionQuizStreak: 0 });
                get().incrementStat('totalQuizTotal');
            }
        },

        recordTemptationSkip: () => {
            const newStreak = get().sessionTemptationStreak + 1;
            set({ sessionTemptationStreak: newStreak });
            get().incrementStat('totalTemptationsSkipped');
            get().maxStat('temptationsSkippedStreak', newStreak);
        },

        resetTemptationStreak: () => {
            set({ sessionTemptationStreak: 0 });
        },

        dismissNotification: (id) => {
            set(state => ({
                notifications: state.notifications.filter(n => n.id !== id),
            }));
        },
    };
});
