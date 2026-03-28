import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/uiStore';
import { TIMING } from '../../utils/constants';
import PennyAvatar from '../ui/PennyAvatar';

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
                    className="fixed bottom-20 left-3 right-16 z-30"
                    onClick={handleDismiss}
                >
                    <div className="flex items-end gap-2">
                        {/* Penny illustrated avatar */}
                        <PennyAvatar pose="wave" size={40} showBubble />

                        {/* Speech bubble — comic book style */}
                        <div
                            className="rounded-2xl rounded-bl-md px-4 py-3 max-w-[280px]"
                            style={{
                                background: '#FFFFFF',
                                border: '2px solid #E0E0E0',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            }}
                        >
                            <p className="text-sm leading-relaxed" style={{ color: '#5D5D6E' }}>
                                {displayText}
                                {displayText.length < (pennyMessage?.length ?? 0) && (
                                    <span style={{ color: '#FF8FAB' }}>▎</span>
                                )}
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
