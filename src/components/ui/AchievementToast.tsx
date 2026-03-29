import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { useAchievementStore } from '../../store/achievementStore';
import { useTranslation } from 'react-i18next';

export default function AchievementToast() {
    const { t } = useTranslation();
    const notifications = useAchievementStore(s => s.notifications);
    const dismissNotification = useAchievementStore(s => s.dismissNotification);

    // Auto-dismiss each notification after 4s
    const firstNotif = notifications[0];
    useEffect(() => {
        if (!firstNotif) return;
        const timer = setTimeout(() => dismissNotification(firstNotif.id), 4000);
        return () => clearTimeout(timer);
    }, [firstNotif?.id, dismissNotification]);

    return (
        <div className="fixed top-16 left-0 right-0 z-[90] flex flex-col items-center pointer-events-none">
            <AnimatePresence>
                {firstNotif && (
                    <motion.div
                        key={firstNotif.id}
                        initial={{ opacity: 0, y: -40, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="pointer-events-auto mx-4 max-w-xs w-full"
                        onClick={() => dismissNotification(firstNotif.id)}
                    >
                        <div
                            className="rounded-2xl px-4 py-3"
                            style={{
                                background: '#FFD700',
                                boxShadow: '0 5px 0 #B8860B, 0 8px 24px rgba(0,0,0,0.25)',
                                border: '2px solid #DAA520',
                            }}
                        >
                            <div className="flex items-center gap-3">
                                {/* Icon */}
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                                    style={{ background: 'rgba(255,255,255,0.3)' }}
                                >
                                    {firstNotif.achievement.icon}
                                </div>

                                {/* Text */}
                                <div className="flex-1 min-w-0">
                                    <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#78350f' }}>
                                        {t('achievements.unlocked')}
                                    </div>
                                    <div className="text-sm font-bold truncate" style={{ color: '#4A3800' }}>
                                        {firstNotif.achievement.title}
                                    </div>
                                    <div className="text-[10px] truncate" style={{ color: '#78350f' }}>
                                        {firstNotif.achievement.description}
                                    </div>
                                </div>

                                {/* XP badge */}
                                <div
                                    className="flex-shrink-0 rounded-lg px-2 py-1"
                                    style={{ background: 'rgba(255,255,255,0.35)' }}
                                >
                                    <span className="text-xs font-bold" style={{ color: '#4A3800' }}>
                                        +{firstNotif.achievement.xp} XP
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
