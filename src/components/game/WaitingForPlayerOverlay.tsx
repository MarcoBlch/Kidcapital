import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '../../store/uiStore';
import { useGameStore } from '../../store/gameStore';

interface Props {
    isSyncing: boolean;
}

export default function WaitingForPlayerOverlay({ isSyncing }: Props) {
    const { t } = useTranslation();
    const setScreen = useUIStore(s => s.setScreen);
    const players = useGameStore(s => s.players);
    const currentPlayerIndex = useGameStore(s => s.currentPlayerIndex);

    const nextPlayer = players[currentPlayerIndex];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center px-8 text-center"
            style={{ background: 'rgba(43, 106, 78, 0.95)' }}
        >
            {/* Animated spinner or checkmark */}
            {isSyncing ? (
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 rounded-full border-4 border-white/20 border-t-white mb-6"
                />
            ) : (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                    className="text-6xl mb-6"
                >
                    ✅
                </motion.div>
            )}

            <h2 className="font-display text-2xl font-bold text-white mb-3">
                {t('multiplayer.waiting_title')}
            </h2>

            {nextPlayer && (
                <p className="text-white/70 text-base mb-8">
                    {t('multiplayer.waiting_msg', { name: nextPlayer.name })}
                </p>
            )}

            <button
                onClick={() => setScreen('splash')}
                className="px-8 py-3 rounded-2xl font-bold text-sm cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1.5px solid rgba(255,255,255,0.3)' }}
            >
                {t('multiplayer.waiting_close')}
            </button>
        </motion.div>
    );
}
