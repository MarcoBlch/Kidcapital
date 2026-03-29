import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/uiStore';
import { purchasePremiumPkg, restorePurchasesPkg, getProductPrice } from '../../lib/revenuecat';
import { useTranslation } from 'react-i18next';

export default function PaywallModal() {
    const { t } = useTranslation();
    const activeModal = useUIStore(s => s.activeModal);
    const closeModal = useUIStore(s => s.closeModal);

    const [isPurchasing, setIsPurchasing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [price, setPrice] = useState('$4.99');

    useEffect(() => {
        getProductPrice().then(p => { if (p) setPrice(p); });
    }, []);

    const isOpen = activeModal === 'paywall';

    if (!isOpen) return null;

    const handlePurchase = async () => {
        setIsPurchasing(true);
        setErrorMessage(null);
        try {
            const result = await purchasePremiumPkg();
            if (result.success) {
                closeModal();
            } else if (result.error) {
                setErrorMessage(result.error);
            }
        } catch (e) {
            console.error('Purchase failed', e);
            setErrorMessage(t('modals.paywall.error'));
        } finally {
            setIsPurchasing(false);
        }
    };

    const handleRestore = async () => {
        setIsPurchasing(true);
        setErrorMessage(null);
        try {
            const result = await restorePurchasesPkg();
            if (result.success) {
                closeModal();
            } else if (result.error) {
                setErrorMessage(result.error);
            }
        } finally {
            setIsPurchasing(false);
        }
    };

    return (
        <AnimatePresence>
            <div
                className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                style={{ background: 'rgba(0,0,0,0.5)' }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 30 }}
                    className="w-full max-w-sm md:max-w-lg lg:max-w-xl rounded-3xl overflow-hidden flex flex-col relative"
                    style={{
                        background: '#FFFFFF',
                        border: '3px solid #FFD700',
                        boxShadow: '0 8px 0 #B8860B, 0 12px 40px rgba(0,0,0,0.2)',
                    }}
                >
                    {/* Close Button */}
                    <button
                        onClick={closeModal}
                        className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full cursor-pointer z-10 transition-colors"
                        style={{ background: '#F5F0E8', color: '#9E9EAF' }}
                    >
                        ✕
                    </button>

                    {/* Header */}
                    <div
                        className="pt-10 pb-6 px-6 relative overflow-hidden flex flex-col items-center text-center"
                        style={{ background: '#FFF8E1' }}
                    >
                        <div className="text-6xl lg:text-7xl mb-4 animate-bounce">👑</div>
                        <h2 className="text-3xl lg:text-4xl font-display font-black tracking-tight mb-2 relative z-10" style={{ color: '#1A1A2E' }}>
                            {t('modals.paywall.title')}<span style={{ color: '#DAA520' }}>{t('modals.paywall.title_plus')}</span>
                        </h2>
                        <p className="text-sm relative z-10 font-bold" style={{ color: '#DAA520' }}>
                            {t('modals.paywall.subtitle')}
                        </p>
                    </div>

                    {/* Features List */}
                    <div className="px-6 py-6 lg:px-8 lg:py-8 space-y-4 lg:space-y-5">
                        <FeatureItem icon="🎭" title={t('modals.paywall.feature_avatars')} />
                        <FeatureItem icon="🔥" title={t('modals.paywall.feature_hard')} />
                        <FeatureItem icon="🤖" title={t('modals.paywall.feature_bots')} />
                        <FeatureItem icon="🌍" title={t('modals.paywall.feature_multi')} isComingSoon soonLabel={t('modals.paywall.soon')} />
                        <FeatureItem icon="🚫" title={t('modals.paywall.feature_ads')} />
                    </div>

                    {/* Purchase Box */}
                    <div className="px-6 lg:px-8 pb-6 lg:pb-8 pt-2">
                        <button
                            onClick={handlePurchase}
                            disabled={isPurchasing}
                            className="w-full py-4 lg:py-5 rounded-2xl font-display text-lg lg:text-xl font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
                            style={{
                                background: isPurchasing ? '#E0E0E0' : '#FFD700',
                                color: isPurchasing ? '#9E9EAF' : '#4A3800',
                                boxShadow: isPurchasing ? 'none' : '0 5px 0 #B8860B, 0 8px 16px rgba(0,0,0,0.15)',
                                cursor: isPurchasing ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {isPurchasing ? (
                                <span>{t('modals.paywall.processing')}</span>
                            ) : (
                                <>
                                    <span>{t('modals.paywall.unlock')}</span>
                                    <span className="text-xs font-sans tracking-wide" style={{ color: '#78350f' }}>
                                        {t('modals.paywall.one_time', { price })}
                                    </span>
                                </>
                            )}
                        </button>

                        {/* Error message */}
                        {errorMessage && (
                            <div
                                className="mt-3 px-4 py-2.5 rounded-xl"
                                style={{ background: '#FFEBEE', border: '2px solid #EF5350' }}
                            >
                                <p className="text-xs text-center leading-relaxed" style={{ color: '#C62828' }}>
                                    {errorMessage}
                                </p>
                            </div>
                        )}

                        <div className="mt-4 text-center">
                            <button
                                onClick={handleRestore}
                                className="text-xs underline transition-colors cursor-pointer"
                                style={{ color: '#9E9EAF' }}
                            >
                                {t('modals.paywall.restore')}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

function FeatureItem({ icon, title, isComingSoon = false, soonLabel }: { icon: string, title: string, isComingSoon?: boolean, soonLabel?: string }) {
    return (
        <div className="flex items-center gap-4">
            <div
                className="w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-xl lg:text-2xl shrink-0"
                style={{ background: '#FFF8E1', border: '2px solid #FFD700' }}
            >
                {icon}
            </div>
            <div className="flex-1 font-medium text-[15px] lg:text-base flex items-center gap-2" style={{ color: '#1A1A2E' }}>
                {title}
                {isComingSoon && (
                    <span
                        className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                        style={{ background: '#FFEBEE', color: '#EF5350', border: '1px solid #EF5350' }}
                    >
                        {soonLabel || 'Soon'}
                    </span>
                )}
            </div>
        </div>
    );
}
