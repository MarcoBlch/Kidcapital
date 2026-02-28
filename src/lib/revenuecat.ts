import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';
import { useUIStore } from '../store/uiStore';

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

export async function purchasePremiumPkg(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
        console.warn("Purchases are only available on iOS/Android native apps. Generating mock success for Web.");
        // Mock success for web development
        useUIStore.getState().setPremium(true);
        return true;
    }

    try {
        const offerings = await Purchases.getOfferings();
        if (offerings.current && offerings.current.availablePackages.length > 0) {
            // Assume the first package in the current offering is the Premium unlock
            const pkg = offerings.current.availablePackages[0];
            const purchaseResult = await Purchases.purchasePackage({ aPackage: pkg });

            if (typeof purchaseResult.customerInfo.entitlements.active['Premium'] !== 'undefined') {
                useUIStore.getState().setPremium(true);
                return true;
            }
        } else {
            console.warn("No packages found to purchase in RevenueCat dashboard.");
        }
    } catch (e: any) {
        if (!e.userCancelled) {
            console.error("Purchase Error:", e);
        }
    }
    return false;
}

export async function restorePurchasesPkg(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
        console.warn("Restore only available natively");
        return false;
    }

    try {
        const { customerInfo } = await Purchases.restorePurchases();
        if (typeof customerInfo.entitlements.active['Premium'] !== 'undefined') {
            useUIStore.getState().setPremium(true);
            return true;
        }
    } catch (e) {
        console.error("Restore Error:", e);
    }
    return false;
}
