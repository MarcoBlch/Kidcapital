import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    accentColor?: string;
    children: ReactNode;
}

export default function BottomSheet({
    isOpen,
    onClose,
    accentColor = '#FFD700',
    children,
}: BottomSheetProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop — solid overlay, no blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40"
                        style={{ background: 'rgba(0,0,0,0.5)' }}
                        onClick={onClose}
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 35,
                            mass: 0.8,
                        }}
                        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[28px] max-h-[88vh] overflow-y-auto safe-bottom md:max-w-xl lg:max-w-2xl md:mx-auto md:rounded-b-[28px] md:bottom-4"
                        style={{ boxShadow: '0 -8px 40px rgba(0,0,0,0.15)' }}
                    >
                        {/* 4px colored accent bar */}
                        <div
                            className="h-1 rounded-full mx-auto mt-0 mb-0"
                            style={{ backgroundColor: accentColor }}
                        />

                        {/* Drag handle */}
                        <div className="flex justify-center pt-3 pb-2">
                            <div className="w-10 h-1 rounded-full" style={{ background: '#E0E0E0' }} />
                        </div>

                        {/* Content */}
                        <div className="px-5 md:px-6 lg:px-8 pb-6 lg:pb-8">
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
