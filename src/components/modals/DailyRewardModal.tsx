import { motion, AnimatePresence } from 'framer-motion';
import { useDailyRewardStore } from '../../store/dailyRewardStore';
import { useTranslation } from 'react-i18next';

interface DailyRewardModalProps {
    onClose: (bonusAmount: number) => void;
}

export default function DailyRewardModal({ onClose }: DailyRewardModalProps) {
    const { t } = useTranslation();
    const checkDailyReward = useDailyRewardStore(s => s.checkDailyReward);
    const claimDailyReward = useDailyRewardStore(s => s.claimDailyReward);

    const rewardData = checkDailyReward();
    const isAvailable = rewardData?.isAvailable;
    const streak = rewardData?.streak || 0;
    const bonusCash = rewardData?.bonusCash || 0;

    const handleClaim = () => {
        claimDailyReward();
        onClose(bonusCash);
    };

    if (!isAvailable) return null;

    const flames = Array.from({ length: Math.min(streak, 7) }).map((_, i) => (
        <span key={i}>🔥</span>
    ));

    return (
        <AnimatePresence mode="wait">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-[100] flex items-center justify-center"
            >
                {/* Solid overlay */}
                <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} />

                {/* Modal card — white with gold accent */}
                <motion.div
                    initial={{ scale: 0.85, y: 30 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: -20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="relative z-10 mx-6 max-w-sm md:max-w-md lg:max-w-lg w-full"
                >
                    <div
                        className="rounded-3xl p-6 text-center"
                        style={{
                            background: '#FFFFFF',
                            border: '3px solid #FFD700',
                            boxShadow: '0 8px 0 #B8860B, 0 12px 40px rgba(0,0,0,0.2)',
                        }}
                    >
                        <div className="text-6xl lg:text-7xl mb-4 inline-block">
                            📅
                        </div>

                        <h2 className="font-display text-2xl lg:text-3xl font-black tracking-wide mb-2" style={{ color: '#DAA520' }}>
                            {t('modals.daily_reward.title')}
                        </h2>

                        <p className="text-sm mb-6 leading-relaxed px-4" style={{ color: '#5D5D6E' }}>
                            {t('modals.daily_reward.subtitle')}
                        </p>

                        {/* Streak Box */}
                        <div
                            className="rounded-2xl p-4 mb-6"
                            style={{ background: '#FFF8E1', border: '2px solid #FFD700' }}
                        >
                            <div className="text-3xl mb-1 flex justify-center gap-1">
                                {flames}
                            </div>
                            <div className="font-bold font-display tracking-widest uppercase text-xs" style={{ color: '#DAA520' }}>
                                {t('modals.daily_reward.streak', { streak })}
                            </div>
                        </div>

                        {/* Reward Amount */}
                        <div className="flex flex-col items-center mb-6">
                            <span className="text-xs uppercase tracking-widest mb-1 font-bold" style={{ color: '#9E9EAF' }}>
                                {t('modals.daily_reward.your_bonus')}
                            </span>
                            <div className="font-display text-5xl lg:text-6xl font-black" style={{ color: '#4CAF50' }}>
                                +${bonusCash}
                            </div>
                            {streak > 1 && (
                                <div
                                    className="text-[10px] mt-2 px-3 py-1 rounded-full"
                                    style={{ background: '#E8F5E9', color: '#2E7D32' }}
                                >
                                    {t('modals.daily_reward.streak_bonus', { amount: (streak - 1) * 5 })}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleClaim}
                            className="w-full py-4 rounded-2xl font-display font-bold text-lg cursor-pointer transition-all active:scale-95"
                            style={{
                                background: '#4CAF50',
                                color: '#FFFFFF',
                                boxShadow: '0 5px 0 #2E7D32, 0 8px 16px rgba(0,0,0,0.15)',
                            }}
                        >
                            {t('modals.daily_reward.claim', { amount: bonusCash })}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
