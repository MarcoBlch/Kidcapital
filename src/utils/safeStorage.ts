/**
 * Safe localStorage wrapper for Capacitor native environments.
 * On iOS/Android via Capacitor, localStorage may not be available
 * at module initialization time before the WebView is fully ready.
 * These helpers prevent uncaught exceptions that cause blank pages / crashes.
 */

export function safeGetItem(key: string): string | null {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            return localStorage.getItem(key);
        }
    } catch {
        // Silently fail — localStorage access denied or unavailable
    }
    return null;
}

export function safeSetItem(key: string, value: string): void {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem(key, value);
        }
    } catch {
        // Silently fail — localStorage access denied or unavailable
    }
}
