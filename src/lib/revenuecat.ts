import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';
import { useUIStore } from '../store/uiStore';

export interface PurchaseResult {
    success: boolean;
    error?: string;
}

export async function initRevenueCat() {
    // Only initialize on real devices/emulators
    if (Capacitor.isNativePlatform()) {
        try {
            await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });

            const appleKey = import.meta.env.VITE_REVENUECAT_APPLE_KEY || '';
            const googleKey = import.meta.env.VITE_REVENUECAT_GOOGLE_KEY || '';

            if (Capacitor.getPlatform() === 'ios' && appleKey) {
                await Purchases.configure({ apiKey: appleKey });
            } else if (Capacitor.getPlatform() === 'android' && googleKey) {
                await Purchases.configure({ apiKey: googleKey });
            }

            // Initial check to see if user already has premium
            const { customerInfo } = await Purchases.getCustomerInfo();
            if (typeof customerInfo.entitlements.active['Premium'] !== 'undefined') {
                useUIStore.getState().setPremium(true);
            }
        } catch (e) {
            console.error("RevenueCat Init Error:", e);
        }
    }
}

export async function purchasePremiumPkg(): Promise<PurchaseResult> {
    if (!Capacitor.isNativePlatform()) {
        console.warn("Purchases are only available on iOS/Android native apps. Generating mock success for Web.");
        // Mock success for web development
        useUIStore.getState().setPremium(true);
        return { success: true };
    }

    try {
        const offerings = await Purchases.getOfferings();
        if (offerings.current && offerings.current.availablePackages.length > 0) {
            // Assume the first package in the current offering is the Premium unlock
            const pkg = offerings.current.availablePackages[0];
            const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });

            if (typeof customerInfo.entitlements.active['Premium'] !== 'undefined') {
                useUIStore.getState().setPremium(true);
                return { success: true };
            }
            return { success: false, error: 'Purchase completed but entitlement not found. Please try restoring purchases.' };
        } else {
            console.warn("No packages found to purchase in RevenueCat dashboard.");
            return { success: false, error: 'This product is not available right now. Please try again later.' };
        }
    } catch (e: any) {
        if (e.userCancelled) {
            return { success: false }; // User cancelled, no error to show
        }
        console.error("Purchase Error:", e);
        return { success: false, error: 'Something went wrong with the purchase. Please try again.' };
    }
}

export async function restorePurchasesPkg(): Promise<PurchaseResult> {
    if (!Capacitor.isNativePlatform()) {
        console.warn("Restore only available natively");
        return { success: false, error: 'Restore is only available on iOS/Android.' };
    }

    try {
        const { customerInfo } = await Purchases.restorePurchases();
        if (typeof customerInfo.entitlements.active['Premium'] !== 'undefined') {
            useUIStore.getState().setPremium(true);
            return { success: true };
        }
        return { success: false, error: 'No previous purchase found for this account.' };
    } catch (e) {
        console.error("Restore Error:", e);
        return { success: false, error: 'Could not restore purchases. Please try again.' };
    }
}

