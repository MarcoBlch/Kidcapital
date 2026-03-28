import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUIStore } from '../store/uiStore';
import { useTranslation } from 'react-i18next';
import PennyAvatar from '../components/ui/PennyAvatar';
import { uiCoin } from '../assets/game';

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
            style={{ background: '#2B6A4E' }}
        >
            {/* Subtle radial glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                    className="w-64 h-64 md:w-96 md:h-96 rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(255,215,0,0.12) 0%, transparent 70%)',
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
                    className="flex justify-center mb-4 md:mb-6"
                >
                    <PennyAvatar pose="wave" size={140} />
                </motion.div>

                <h1 className="font-display text-4xl md:text-6xl lg:text-7xl mb-2 tracking-tight" style={{ color: '#FFD700' }}>
                    {t('splash.title')}
                </h1>
                <p className="text-sm md:text-lg lg:text-xl font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {t('splash.subtitle')}
                </p>
            </motion.div>

            {/* Loading — bouncing gold coins */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-12 flex gap-3 relative z-10"
            >
                {[0, 1, 2].map(i => (
                    <motion.img
                        key={i}
                        src={uiCoin}
                        alt="coin"
                        width={24}
                        height={24}
                        animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                        className="object-contain"
                        draggable={false}
                    />
                ))}
            </motion.div>
        </motion.div>
    );
}
