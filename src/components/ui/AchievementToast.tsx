import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { useAchievementStore } from '../../store/achievementStore';

export default function AchievementToast() {
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
                        <div className="bg-gradient-to-r from-amber-400/95 to-amber-500/95 backdrop-blur-md rounded-2xl px-4 py-3 shadow-[0_8px_32px_rgba(245,158,11,0.4)] border border-amber-300/30">
                            <div className="flex items-center gap-3">
                                {/* Icon */}
                                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-2xl flex-shrink-0">
                                    {firstNotif.achievement.icon}
                                </div>

                                {/* Text */}
                                <div className="flex-1 min-w-0">
                                    <div className="text-[9px] font-bold text-amber-900/60 uppercase tracking-wider">
                                        🏅 Achievement Unlocked!
                                    </div>
                                    <div className="text-sm font-bold text-amber-900 truncate">
                                        {firstNotif.achievement.title}
                                    </div>
                                    <div className="text-[10px] text-amber-800/70 truncate">
                                        {firstNotif.achievement.description}
                                    </div>
                                </div>

                                {/* XP badge */}
                                <div className="flex-shrink-0 bg-white/25 rounded-lg px-2 py-1">
                                    <span className="text-xs font-bold text-amber-900">
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
