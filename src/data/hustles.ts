import type { Hustle } from '../types';

// ============================================
// KidCapital — Hustles (Side Jobs)
// Active income: "You worked for it!"
// ============================================

export const HUSTLES: Hustle[] = [
    { id: 'h1', title: 'Mow 3 Lawns', text: 'Hard work pays off!', amount: 20, icon: '🌿' },
    { id: 'h2', title: 'Wash Cars', text: 'Scrub scrub sparkle!', amount: 25, icon: '🚗' },
    { id: 'h3', title: 'Tutor a Kid', text: 'Teaching is earning!', amount: 18, icon: '📚' },
    { id: 'h4', title: 'Babysitting', text: 'Responsible = rewarded!', amount: 22, icon: '👶' },
    { id: 'h5', title: 'Lemonade Boost', text: 'Extra stand this weekend', amount: 15, icon: '🍋' },
    { id: 'h6', title: 'Tech Help', text: "Fixed Mrs. Chen's Wi-Fi", amount: 30, icon: '💻' },
    { id: 'h7', title: 'Pet Sitting', text: '2 dogs + 1 cat = $$$', amount: 20, icon: '🐾' },
    { id: 'h8', title: 'Bake Sale', text: 'Cookies flew off table', amount: 28, icon: '🍪' },
];

export function getRandomHustle(): Hustle {
    return HUSTLES[Math.floor(Math.random() * HUSTLES.length)];
}
