import { motion, AnimatePresence } from 'framer-motion';
import { useDailyRewardStore } from '../../store/dailyRewardStore';

interface DailyRewardModalProps {
    onClose: (bonusAmount: number) => void;
}

export default function DailyRewardModal({ onClose }: DailyRewardModalProps) {
    const checkDailyReward = useDailyRewardStore(s => s.checkDailyReward);
    const claimDailyReward = useDailyRewardStore(s => s.claimDailyReward);

    // We expect this modal to only be rendered if a reward IS available, 
    // but we'll read the state just to be sure.
    const { isAvailable, streak, bonusCash } = checkDailyReward();

    const handleClaim = () => {
        claimDailyReward();
        onClose(bonusCash);
    };

    if (!isAvailable) return null;

    // Array of flame emojis to represent streak visually
    const flames = Array.from({ length: Math.min(streak, 7) }).map((_, i) => (
        <span key={i} className="animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}>🔥</span>
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
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                {/* Modal card */}
                <motion.div
                    initial={{ scale: 0.85, y: 30 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: -20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="relative z-10 mx-6 max-w-sm w-full"
                >
                    <div className="bg-gradient-to-br from-[#1e2a4a] to-[#162040] rounded-3xl border border-amber-400/30 p-6 shadow-[0_0_50px_rgba(245,158,11,0.2)] text-center">

                        <div className="text-6xl mb-4 inline-block drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                            📅
                        </div>

                        <h2 className="font-display text-2xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 mb-2">
                            Daily Log-in Bonus!
                        </h2>

                        <p className="text-white/80 text-sm mb-6 leading-relaxed px-4">
                            Welcome back! You get a cash bonus to jumpstart your businesses today.
                        </p>

                        {/* Streak Box */}
                        <div className="bg-black/20 rounded-2xl p-4 mb-6 relative overflow-hidden">
                            {/* Decorative glow */}
                            <div className="absolute -top-10 -right-10 w-20 h-20 bg-amber-500/20 blur-2xl rounded-full" />

                            <div className="text-3xl mb-1 flex justify-center gap-1">
                                {flames}
                            </div>
                            <div className="text-amber-400 font-bold font-display tracking-widest uppercase text-xs">
                                {streak} Day Streak!
                            </div>
                        </div>

                        {/* Reward Amount */}
                        <div className="flex flex-col items-center mb-6">
                            <span className="text-xs text-white/50 uppercase tracking-widest mb-1 font-bold">Your Bonus</span>
                            <div className="font-display text-5xl font-black text-emerald-400 drop-shadow-[0_2px_10px_rgba(52,211,153,0.3)]">
                                +${bonusCash}
                            </div>
                            {streak > 1 && (
                                <div className="text-[10px] text-emerald-400/60 mt-2 bg-emerald-400/10 px-3 py-1 rounded-full">
                                    Includes +${(streak - 1) * 5} streak bonus!
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleClaim}
                            className="w-full py-4 rounded-2xl font-display font-bold text-lg cursor-pointer transition-all active:scale-95 bg-gradient-to-r from-emerald-400 to-emerald-500 text-emerald-950 shadow-[0_5px_20px_rgba(52,211,153,0.4)] border border-emerald-300/50 hover:brightness-110"
                        >
                            Claim ${bonusCash} & Play!
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
