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
    accentColor = '#f59e0b',
    children,
}: BottomSheetProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/30 z-40"
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
                        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[28px] max-h-[88vh] overflow-y-auto safe-bottom"
                        style={{ boxShadow: '0 -8px 40px rgba(0,0,0,0.12)' }}
                    >
                        {/* Color stripe */}
                        <div
                            className="h-0.5 rounded-full mx-auto mt-0 mb-0"
                            style={{ backgroundColor: accentColor }}
                        />

                        {/* Drag handle */}
                        <div className="flex justify-center pt-3 pb-2">
                            <div className="w-10 h-1 bg-slate-200 rounded-full" />
                        </div>

                        {/* Content */}
                        <div className="px-5 pb-6">
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
