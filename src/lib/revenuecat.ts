import { Purchases, LOG_LEVEL, PURCHASES_ERROR_CODE } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';
import { useUIStore } from '../store/uiStore';

export interface PurchaseResult {
    success: boolean;
    error?: string;
}

function getPurchaseErrorMessage(e: any): string {
    const code = e?.code as string | undefined;
    switch (code) {
        case PURCHASES_ERROR_CODE.STORE_PROBLEM_ERROR:
            return 'The App Store encountered an issue. Please try again in a moment.';
        case PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR:
            return 'Purchases are not allowed on this device. Check your device restrictions.';
        case PURCHASES_ERROR_CODE.PURCHASE_INVALID_ERROR:
            return 'This purchase could not be completed. The product may not be available.';
        case PURCHASES_ERROR_CODE.PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR:
            return 'This product is not currently available for purchase.';
        case PURCHASES_ERROR_CODE.NETWORK_ERROR:
            return 'Network error. Please check your connection and try again.';
        case PURCHASES_ERROR_CODE.CONFIGURATION_ERROR:
        case PURCHASES_ERROR_CODE.INVALID_CREDENTIALS_ERROR:
            return 'Store configuration error. Please contact support.';
        case PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR:
            return 'Payment is pending. Please check back later.';
        case PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR:
            return 'You already own this product. Try restoring purchases.';
        default:
            return `Purchase failed (code: ${code ?? 'unknown'}). ${e?.message || 'Please try again.'}`;
    }
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
            const customerInfo = (await Purchases.getCustomerInfo()).customerInfo;
            if (customerInfo?.entitlements?.active?.['Premium']) {
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
            const customerInfo = (await Purchases.purchasePackage({ aPackage: pkg })).customerInfo;

            if (customerInfo?.entitlements?.active?.['Premium']) {
                useUIStore.getState().setPremium(true);
                return { success: true };
            }
            return { success: false, error: 'Purchase completed but entitlement not found. Please try restoring purchases.' };
        } else {
            console.warn("No packages found to purchase in RevenueCat dashboard.");
            return { success: false, error: 'This product is not available right now. Please try again later.' };
        }
    } catch (e: any) {
        if (e?.userCancelled || e?.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
            return { success: false };
        }
        console.error("Purchase Error:", JSON.stringify(e, null, 2));
        return { success: false, error: getPurchaseErrorMessage(e) };
    }
}

export async function restorePurchasesPkg(): Promise<PurchaseResult> {
    if (!Capacitor.isNativePlatform()) {
        console.warn("Restore only available natively");
        return { success: false, error: 'Restore is only available on iOS/Android.' };
    }

    try {
        const customerInfo = (await Purchases.restorePurchases()).customerInfo;
        if (customerInfo?.entitlements?.active?.['Premium']) {
            useUIStore.getState().setPremium(true);
            return { success: true };
        }
        return { success: false, error: 'No previous purchase found for this account.' };
    } catch (e: any) {
        console.error("Restore Error:", JSON.stringify(e, null, 2));
        return { success: false, error: getPurchaseErrorMessage(e) };
    }
}

export async function getProductPrice(): Promise<string | null> {
    if (!Capacitor.isNativePlatform()) return null;
    try {
        const offerings = await Purchases.getOfferings();
        const pkg = offerings.current?.availablePackages?.[0];
        return pkg?.product?.priceString ?? null;
    } catch {
        return null;
    }
}

