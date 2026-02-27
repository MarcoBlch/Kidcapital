import type { LifeEvent } from '../types';

// ============================================
// KidCapital — Life Events (20 total)
// 10 Good (+$7 to +$40) | 10 Bad (-$6 to -$20)
// ============================================

export const LIFE_EVENTS: LifeEvent[] = [
    // --- Good Events ---
    { id: 'e1', title: 'Birthday Money!', text: 'Grandma sent a gift!', amount: 25, mood: '🥳' },
    { id: 'e2', title: 'Viral Video!', text: 'Your biz went viral!', amount: 35, mood: '🤩' },
    { id: 'e3', title: 'Garage Sale', text: 'Sold old stuff', amount: 15, mood: '😊' },
    { id: 'e4', title: 'Tip Jar Full!', text: 'Customers tipped big', amount: 20, mood: '😄' },
    { id: 'e5', title: 'School Prize', text: 'Won science fair', amount: 30, mood: '🥇' },
    { id: 'e6', title: 'Lucky Find', text: 'Found money in your jacket', amount: 10, mood: '🍀' },
    { id: 'e7', title: 'BBQ Sales', text: 'Sold lemonade at BBQ', amount: 22, mood: '☀️' },
    { id: 'e8', title: 'Partnership Win', text: 'Teamed up on big order', amount: 28, mood: '💪' },
    { id: 'e9', title: 'Festival Booth', text: 'Crushed it at the fair', amount: 40, mood: '🎉' },
    { id: 'e10', title: 'Snow Day Sales', text: 'Hot cocoa sold out', amount: 18, mood: '🧣' },

    // --- Bad Events ---
    { id: 'e11', title: 'Broken Window', text: 'Ball through the glass', amount: -15, mood: '😬' },
    { id: 'e12', title: 'Rainy Week', text: 'No foot traffic', amount: -10, mood: '😕' },
    { id: 'e13', title: 'Supply Shortage', text: 'Ingredients cost up', amount: -12, mood: '😤' },
    { id: 'e14', title: 'Pet Vet Bill', text: 'Hamster check-up', amount: -20, mood: '🏥' },
    { id: 'e15', title: 'Equipment Broke', text: 'Blender gave up', amount: -18, mood: '😩' },
    { id: 'e16', title: 'Power Outage', text: 'Lost a day of sales', amount: -8, mood: '😶' },
    { id: 'e17', title: 'Tax Time', text: 'Small business tax', amount: -10, mood: '📋' },
    { id: 'e18', title: 'Delivery Mishap', text: 'Wrong order sent', amount: -14, mood: '🤦' },
    { id: 'e19', title: 'Bike Flat', text: 'Tire popped mid-delivery', amount: -6, mood: '😐' },
    { id: 'e20', title: 'Health Inspection', text: 'Fine for messy shop', amount: -12, mood: '🧹' },
];

export function getRandomEvent(): LifeEvent {
    return LIFE_EVENTS[Math.floor(Math.random() * LIFE_EVENTS.length)];
}
