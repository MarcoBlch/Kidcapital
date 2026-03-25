import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUIStore } from '../store/uiStore';
import { useTranslation } from 'react-i18next';

export default function SplashScreen() {
    const setScreen = useUIStore(s => s.setScreen);
    const { t } = useTranslation();

    useEffect(() => {
        const timer = setTimeout(() => setScreen('setup'), 2500);
        return () => clearTimeout(timer);
    }, [setScreen]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-dvh flex flex-col items-center justify-center px-8"
            style={{
                background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            }}
        >
            {/* Glow circle */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                    className="w-64 h-64 md:w-96 md:h-96 rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)',
                    }}
                />
            </div>

            {/* Logo */}
            <motion.div
                initial={{ scale: 0.5, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                className="text-center relative z-10"
            >
                <motion.div
                    animate={{ rotate: [0, -5, 5, -3, 0] }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="text-7xl md:text-9xl mb-4 md:mb-6"
                >
                    🐷
                </motion.div>

                <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-amber-400 mb-2 tracking-tight">
                    {t('splash.title')}
                </h1>
                <p className="text-sm md:text-lg lg:text-xl text-amber-200/50 font-medium">
                    {t('splash.subtitle')}
                </p>
            </motion.div>

            {/* Loading dots */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-12 flex gap-1.5 relative z-10"
            >
                {[0, 1, 2].map(i => (
                    <motion.div
                        key={i}
                        animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        className="w-2 h-2 rounded-full bg-amber-400"
                    />
                ))}
            </motion.div>
        </motion.div>
    );
}
