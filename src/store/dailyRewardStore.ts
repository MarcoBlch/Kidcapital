import { create } from 'zustand';
import { safeGetItem, safeSetItem } from '../utils/safeStorage';

interface DailyRewardStore {
    lastClaimDate: string | null;
    currentStreak: number;

    /** 
     * Checks if a reward is ready today. 
     * Returns true if a reward is ready to be claimed.
     * Also returns the calculated streak if they were to claim it today.
     */
    checkDailyReward: () => { isAvailable: boolean; streak: number; bonusCash: number };

    /**
     * Claims the reward, updating the last claim date and streak.
     */
    claimDailyReward: () => void;
}

const STORAGE_KEY = 'kidcapital_daily_reward';

export const useDailyRewardStore = create<DailyRewardStore>((set, get) => {
    const saved = safeGetItem(STORAGE_KEY);
    let initialState = { lastClaimDate: null as string | null, currentStreak: 0 };
    if (saved) {
        try {
            initialState = JSON.parse(saved);
        } catch {
            // Corrupt data — reset to defaults
        }
    }

    return {
        ...initialState,

        checkDailyReward: () => {
            const { lastClaimDate, currentStreak } = get();
            const today = new Date().toISOString().split('T')[0];

            if (!lastClaimDate) {
                // First time ever playing
                return { isAvailable: true, streak: 1, bonusCash: 10 };
            }

            const lastDate = new Date(lastClaimDate);
            const currentDate = new Date(today);

            // Calculate difference in days (ignoring timezones by strictly using YYYY-MM-DD strings)
            const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
                // Already claimed today
                return { isAvailable: false, streak: currentStreak, bonusCash: 0 };
            } else if (diffDays === 1) {
                // Consecutive day!
                const newStreak = currentStreak + 1;
                // Base $10 + $5 per streak day (cap at $50 total bonus after 8 days)
                const bonus = Math.min(10 + (newStreak - 1) * 5, 50);
                return { isAvailable: true, streak: newStreak, bonusCash: bonus };
            } else {
                // Streak broken (missed a day)
                return { isAvailable: true, streak: 1, bonusCash: 10 };
            }
        },

        claimDailyReward: () => {
            const { isAvailable, streak } = get().checkDailyReward();
            if (isAvailable) {
                const today = new Date().toISOString().split('T')[0];
                const newState = { lastClaimDate: today, currentStreak: streak };
                set(newState);
                safeSetItem(STORAGE_KEY, JSON.stringify(newState));
            }
        }
    };
});
