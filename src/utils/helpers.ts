// ============================================
// KidCapital — Utility Helpers
// ============================================

/**
 * Clamp a value between min and max (inclusive).
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

/**
 * Generate a random integer between min and max (inclusive).
 */
export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Pick a random element from an array.
 */
export function pickRandom<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Roll a single 6-sided die.
 */
export function rollDice(): number {
    return randomInt(1, 6);
}

/**
 * Async sleep for timing / pacing.
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Format currency with $ sign.
 */
export function formatMoney(amount: number): string {
    const prefix = amount >= 0 ? '+$' : '-$';
    return `${prefix}${Math.abs(amount)}`;
}
