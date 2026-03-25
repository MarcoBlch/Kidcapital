import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/uiStore';
import { purchasePremiumPkg, restorePurchasesPkg, getProductPrice } from '../../lib/revenuecat';

export default function PaywallModal() {
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
            setErrorMessage('An unexpected error occurred. Please try again.');
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
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 30 }}
                    className="w-full max-w-sm md:max-w-lg lg:max-w-xl bg-gradient-to-b from-slate-900 to-slate-800 border-2 border-amber-500/40 rounded-3xl shadow-2xl shadow-amber-500/20 overflow-hidden flex flex-col relative"
                >
                    {/* Close Button */}
                    <button
                        onClick={closeModal}
                        className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 text-white/60 hover:text-white transition-colors z-10"
                    >
                        ✕
                    </button>

                    {/* Header Image Room */}
                    <div className="pt-10 pb-6 px-6 relative overflow-hidden flex flex-col items-center text-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-rose-500/20" />
                        <div className="text-6xl lg:text-7xl mb-4 drop-shadow-xl animate-bounce">👑</div>
                        <h2 className="text-3xl lg:text-4xl font-display font-black text-white tracking-tight mb-2 relative z-10">
                            KidCapital<span className="text-amber-400">+</span>
                        </h2>
                        <p className="text-amber-200/80 text-sm relative z-10 font-bold">
                            Unlock the full billionaire experience.
                        </p>
                    </div>

                    {/* Features List */}
                    <div className="px-6 py-6 lg:px-8 lg:py-8 space-y-4 lg:space-y-5">
                        <FeatureItem icon="🎭" title="All 10 Premium Avatars" />
                        <FeatureItem icon="🔥" title="Hard Difficulty (Age 15-18)" />
                        <FeatureItem icon="🤖" title="Play against up to 3 Bots" />
                        <FeatureItem icon="🌍" title="Online Multiplayer" isComingSoon />
                        <FeatureItem icon="🚫" title="No Ads, Forever" />
                    </div>

                    {/* Purchase Box */}
                    <div className="px-6 lg:px-8 pb-6 lg:pb-8 pt-2">
                        <button
                            onClick={handlePurchase}
                            disabled={isPurchasing}
                            className={`
                                w-full py-4 lg:py-5 rounded-2xl font-display text-lg lg:text-xl font-bold shadow-lg
                                transition-all flex flex-col items-center justify-center gap-1
                                ${isPurchasing
                                    ? 'bg-amber-600/50 text-white/50 cursor-not-allowed'
                                    : 'bg-gradient-to-b from-amber-400 to-amber-600 text-amber-950 hover:scale-[1.02] active:scale-95 shadow-amber-500/30'
                                }
                            `}
                        >
                            {isPurchasing ? (
                                <span>Processing...</span>
                            ) : (
                                <>
                                    <span>Unlock Now</span>
                                    <span className="text-xs text-amber-950/70 font-sans tracking-wide">
                                        One-Time Payment of {price}
                                    </span>
                                </>
                            )}
                        </button>

                        {/* Error message banner */}
                        {errorMessage && (
                            <div className="mt-3 px-4 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30">
                                <p className="text-xs text-rose-300 text-center leading-relaxed">
                                    {errorMessage}
                                </p>
                            </div>
                        )}

                        <div className="mt-4 text-center">
                            <button
                                onClick={handleRestore}
                                className="text-xs text-white/40 underline hover:text-white/80 transition-colors"
                            >
                                Already purchased? Restore here.
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

function FeatureItem({ icon, title, isComingSoon = false }: { icon: string, title: string, isComingSoon?: boolean }) {
    return (
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white/5 flex items-center justify-center text-xl lg:text-2xl shrink-0 border border-white/10">
                {icon}
            </div>
            <div className="flex-1 font-medium text-white/90 text-[15px] lg:text-base flex items-center gap-2">
                {title}
                {isComingSoon && (
                    <span className="text-[9px] uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded-full">
                        Soon
                    </span>
                )}
            </div>
        </div>
    );
}
