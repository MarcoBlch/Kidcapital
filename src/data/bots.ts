import type { BotProfile } from '../types';

// ============================================
// KidCapital — Bot Profiles
// 3 distinct AI personalities
// ============================================

export const BOTS: BotProfile[] = [
    {
        id: 'bot-chloe',
        name: 'Careful Chloe',
        avatar: 'turtle',
        personality: 'conservative',
        description: 'Plays it safe — cash only, cheapest assets, always saves.',
    },
    {
        id: 'bot-ben',
        name: 'Bold Ben',
        avatar: 'lion',
        personality: 'aggressive',
        description: 'Go big or go home — takes loans for the best businesses!',
    },
    {
        id: 'bot-sam',
        name: 'Smart Sam',
        avatar: 'owl',
        personality: 'balanced',
        description: 'Calculates the best deals. Strategic and smart.',
    },
];

export function getBotById(id: string): BotProfile | undefined {
    return BOTS.find(b => b.id === id);
}
