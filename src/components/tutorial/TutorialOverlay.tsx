import { motion, AnimatePresence } from 'framer-motion';
import { useTutorialStore } from '../../store/tutorialStore';

export default function TutorialOverlay() {
    const isActive = useTutorialStore(s => s.isActive);
    const getCurrentStep = useTutorialStore(s => s.getCurrentStep);
    const nextStep = useTutorialStore(s => s.nextStep);
    const completeTutorial = useTutorialStore(s => s.completeTutorial);
    const currentStepIndex = useTutorialStore(s => s.currentStepIndex);

    const step = getCurrentStep();

    if (!isActive || !step) return null;

    const isWaitingForTap = step.waitFor === 'tap';
    const totalSteps = 8; // TUTORIAL_STEPS.length

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={step.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`fixed inset-0 z-[100] flex items-center justify-center ${!isWaitingForTap ? 'pointer-events-none' : ''}`}
                onClick={isWaitingForTap ? nextStep : undefined}
            >
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/60 pointer-events-none" />

                {/* Tutorial card */}
                <motion.div
                    initial={{ scale: 0.85, y: 30 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: -20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="relative z-[101] mx-6 max-w-sm w-full pointer-events-auto"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="bg-gradient-to-br from-[#1e2a4a] to-[#162040] rounded-3xl border border-amber-400/20 shadow-[0_0_40px_rgba(245,158,11,0.15)] overflow-hidden">
                        {/* Progress dots */}
                        <div className="flex items-center justify-center gap-1.5 pt-4 pb-2">
                            {Array.from({ length: totalSteps }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1 rounded-full transition-all duration-300 ${i === currentStepIndex
                                        ? 'w-5 bg-amber-400'
                                        : i < currentStepIndex
                                            ? 'w-2 bg-amber-400/40'
                                            : 'w-2 bg-white/10'
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Penny avatar */}
                        <div className="flex justify-center pt-2 pb-1">
                            <motion.div
                                animate={{ rotate: [0, -5, 5, -3, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                                className="w-16 h-16 rounded-full bg-amber-400/15 border-2 border-amber-400/30 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                            >
                                <span className="text-3xl">🐷</span>
                            </motion.div>
                        </div>

                        {/* Content */}
                        <div className="px-6 pb-2 text-center">
                            <h3 className="font-display text-lg text-amber-300 mb-2">
                                {step.title}
                            </h3>
                            <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">
                                {step.message}
                            </p>
                        </div>

                        {/* Action area */}
                        <div className="px-6 pb-5 pt-3">
                            {isWaitingForTap ? (
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={nextStep}
                                    className="
                                        w-full py-3 rounded-2xl font-display text-sm font-bold
                                        bg-gradient-to-r from-amber-400 to-amber-500
                                        text-amber-900 cursor-pointer transition-all
                                        shadow-[0_4px_20px_rgba(245,158,11,0.3)]
                                    "
                                >
                                    {currentStepIndex === totalSteps - 1 ? "Let's Go! 🎲" : 'Got it! →'}
                                </motion.button>
                            ) : (
                                <div className="text-center">
                                    <p className="text-[11px] text-amber-300/50 font-medium animate-pulse">
                                        {step.waitFor === 'roll' && '👆 Tap "Roll!" to continue...'}
                                        {step.waitFor === 'modal_close' && '👆 Close the card to continue...'}
                                        {step.waitFor === 'next_turn' && '👆 Tap "Next" to continue...'}
                                    </p>
                                </div>
                            )}

                            {/* Skip button */}
                            <button
                                onClick={completeTutorial}
                                className="mt-3 w-full text-center text-[10px] text-white/20 hover:text-white/40 transition-colors cursor-pointer"
                            >
                                Skip tutorial
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
