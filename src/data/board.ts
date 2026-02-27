import type { Space } from '../types';

// ============================================
// KidCapital — Board Layout (20 spaces)
// ============================================

export const BOARD: Space[] = [
    { index: 0, type: 'start', icon: '🏁', label: 'GO', color: 'amber' },
    { index: 1, type: 'invest', icon: '🏪', label: 'Invest', color: 'emerald' },
    { index: 2, type: 'life', icon: '🎲', label: 'Life', color: 'rose' },
    { index: 3, type: 'hustle', icon: '💼', label: 'Hustle', color: 'purple' },
    { index: 4, type: 'invest', icon: '🏪', label: 'Invest', color: 'emerald' },
    { index: 5, type: 'payday', icon: '💰', label: 'Payday', color: 'amber' },
    { index: 6, type: 'temptation', icon: '🛍️', label: 'Want!', color: 'pink' },
    { index: 7, type: 'invest', icon: '🏪', label: 'Invest', color: 'emerald' },
    { index: 8, type: 'life', icon: '🎲', label: 'Life', color: 'rose' },
    { index: 9, type: 'challenge', icon: '🧠', label: 'Quiz', color: 'cyan' },
    { index: 10, type: 'bank', icon: '🏦', label: 'Bank', color: 'indigo' },
    { index: 11, type: 'invest', icon: '🏪', label: 'Invest', color: 'emerald' },
    { index: 12, type: 'payday', icon: '💰', label: 'Payday', color: 'amber' },
    { index: 13, type: 'hustle', icon: '💼', label: 'Hustle', color: 'purple' },
    { index: 14, type: 'life', icon: '🎲', label: 'Life', color: 'rose' },
    { index: 15, type: 'invest', icon: '🏪', label: 'Invest', color: 'emerald' },
    { index: 16, type: 'temptation', icon: '🛍️', label: 'Want!', color: 'pink' },
    { index: 17, type: 'challenge', icon: '🧠', label: 'Quiz', color: 'cyan' },
    { index: 18, type: 'bank', icon: '🏦', label: 'Bank', color: 'indigo' },
    { index: 19, type: 'payday', icon: '💰', label: 'Payday', color: 'amber' },
];

export const BOARD_SIZE = BOARD.length;
