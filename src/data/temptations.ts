import type { Temptation } from '../types';

// ============================================
// KidCapital — Temptations (Wants)
// Key educational tool: impulse control
// ============================================

export const TEMPTATIONS: Temptation[] = [
    { id: 't1', name: 'New Sneakers', cost: 25, icon: '👟', text: 'So fresh, so clean!' },
    { id: 't2', name: 'Video Game', cost: 30, icon: '🎮', text: "Everyone's playing it!" },
    { id: 't3', name: 'Concert Ticket', cost: 35, icon: '🎤', text: 'Your fave artist!' },
    { id: 't4', name: 'Phone Case', cost: 15, icon: '📱', text: 'Gotta protect the phone' },
    { id: 't5', name: 'Skateboard', cost: 40, icon: '🛹', text: 'Ride in style!' },
    { id: 't6', name: 'Movie Night', cost: 12, icon: '🍿', text: 'Popcorn included!' },
    { id: 't7', name: 'Plush Toy', cost: 18, icon: '🧸', text: 'So soft and cuddly!' },
    { id: 't8', name: 'Ice Cream', cost: 8, icon: '🍦', text: 'Triple scoop!' },
];

export function getRandomTemptation(): Temptation {
    return TEMPTATIONS[Math.floor(Math.random() * TEMPTATIONS.length)];
}
