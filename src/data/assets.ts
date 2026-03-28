import type { Asset } from '../types';
import {
    bizLemonade,
    bizDogwalk,
    bizYardcare,
    bizCandy,
    bizBike,
    bizArt,
    bizPetgroom,
    bizArcade,
    bizFoodtruck,
    bizMusic,
} from '../assets/game';

// ============================================
// KidCapital — Business Catalog
// Rebalanced: higher costs, lower net income, longer ROI
// Makes investing a real commitment, not instant gratification
// ============================================

const ASSET_IMAGES: Record<string, string> = {
    a1: bizLemonade,
    a2: bizDogwalk,
    a3: bizYardcare,
    a4: bizCandy,
    a5: bizBike,
    a6: bizArt,
    a7: bizPetgroom,
    a8: bizArcade,
    a9: bizFoodtruck,
    a10: bizMusic,
};

export function getAssetImage(id: string): string | undefined {
    return ASSET_IMAGES[id];
}

export const ASSETS: Asset[] = [
    // --- Tier 1: Starter ($80-$120) — takes 10+ months to pay off ---
    { id: 'a1', name: 'Lemonade Stand', cost: 80, income: 6, maint: 2, icon: '🍋', tier: 1 },
    { id: 'a2', name: 'Dog Walking', cost: 90, income: 7, maint: 2, icon: '🐕', tier: 1 },
    { id: 'a3', name: 'Yard Care', cost: 120, income: 9, maint: 3, icon: '🌿', tier: 1 },

    // --- Tier 2: Growth ($180-$250) — meaningful investment ---
    { id: 'a4', name: 'Candy Shop', cost: 200, income: 14, maint: 5, icon: '🍬', tier: 2 },
    { id: 'a5', name: 'Bike Rental', cost: 240, income: 16, maint: 6, icon: '🚲', tier: 2 },
    { id: 'a6', name: 'Art Studio', cost: 220, income: 15, maint: 5, icon: '🎨', tier: 2 },
    { id: 'a7', name: 'Pet Grooming', cost: 180, income: 13, maint: 5, icon: '🐩', tier: 2 },

    // --- Tier 3: Premium ($350-$500) — big risk, big reward ---
    { id: 'a8', name: 'Arcade', cost: 400, income: 28, maint: 10, icon: '🕹️', tier: 3 },
    { id: 'a9', name: 'Food Truck', cost: 450, income: 32, maint: 12, icon: '🚚', tier: 3 },
    { id: 'a10', name: 'Music School', cost: 500, income: 38, maint: 15, icon: '🎵', tier: 3 },
];

export function getAssetsByTier(tier: 1 | 2 | 3): Asset[] {
    return ASSETS.filter(a => a.tier === tier);
}

export function getAvailableAssets(ownedIds: string[], maxTier: 1 | 2 | 3 = 3): Asset[] {
    const ownedSet = new Set(ownedIds);
    return ASSETS.filter(a => !ownedSet.has(a.id) && a.tier <= maxTier);
}
