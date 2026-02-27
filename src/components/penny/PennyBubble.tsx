import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/uiStore';
import { TIMING } from '../../utils/constants';

export default function PennyBubble() {
    const pennyMessage = useUIStore(s => s.pennyMessage);
    const pennyVisible = useUIStore(s => s.pennyVisible);
    const dismissPenny = useUIStore(s => s.dismissPenny);

    const [displayText, setDisplayText] = useState('');

    // Typewriter effect
    useEffect(() => {
        if (!pennyMessage || !pennyVisible) {
            setDisplayText('');
            return;
        }

        setDisplayText('');
        let i = 0;
        const interval = setInterval(() => {
            i++;
            setDisplayText(pennyMessage.slice(0, i));
            if (i >= pennyMessage.length) clearInterval(interval);
        }, 1000 / TIMING.PENNY_TYPEWRITER_CPS);

        return () => clearInterval(interval);
    }, [pennyMessage, pennyVisible]);

    // Auto-dismiss
    useEffect(() => {
        if (!pennyVisible) return;
        const timer = setTimeout(dismissPenny, TIMING.PENNY_BUBBLE_DURATION);
        return () => clearTimeout(timer);
    }, [pennyVisible, dismissPenny]);

    const handleDismiss = useCallback(() => {
        dismissPenny();
    }, [dismissPenny]);

    return (
        <AnimatePresence>
            {pennyVisible && pennyMessage && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="fixed bottom-28 left-3 right-16 z-30"
                    onClick={handleDismiss}
                >
                    <div className="flex items-end gap-2">
                        {/* Penny icon */}
                        <div className="flex-shrink-0 w-10 h-10 bg-amber-400/20 rounded-full flex items-center justify-center border-2 border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
                            <span className="text-lg">🐷</span>
                        </div>

                        {/* Speech bubble */}
                        <div className="bg-white/95 rounded-2xl rounded-bl-md px-4 py-3 shadow-heavy border border-amber-200/30 max-w-[280px]">
                            <p className="text-sm text-slate-700 leading-relaxed">
                                {displayText}
                                {displayText.length < (pennyMessage?.length ?? 0) && (
                                    <span className="animate-pulse text-amber-500">▎</span>
                                )}
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
